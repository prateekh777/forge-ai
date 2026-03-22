-- ============================================================
-- FORGE DATABASE SCHEMA
-- Single source of truth. All Supabase migrations derive from this.
-- Last updated: 2026-03-22
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";  -- for future embeddings/pattern detection

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE task_type AS ENUM (
  'automation',
  'content',
  'agent',
  'integration',
  'data',
  'other'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'paid',
  'refunded',
  'failed'
);

CREATE TYPE execution_status AS ENUM (
  'queued',
  'classifying',
  'running',
  'qa_review',
  'delivered',
  'failed',
  'revision',
  'cancelled'
);

CREATE TYPE deliverable_type AS ENUM (
  'file',
  'url',
  'code_repo',
  'api_endpoint',
  'report',
  'other'
);

CREATE TYPE improvement_type AS ENUM (
  'prompt_update',
  'flow_change',
  'new_step',
  'parameter_tune'
);

-- ============================================================
-- TABLES
-- ============================================================

-- ORDERS: Created by P's storefront, consumed by A's factory
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Customer info
  customer_id UUID REFERENCES auth.users(id),
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,

  -- Task details
  task_description TEXT NOT NULL,
  task_type task_type NOT NULL DEFAULT 'other',
  uploaded_file_urls TEXT[] DEFAULT '{}',
  customer_notes TEXT,

  -- Classification (set by A's classifier)
  complexity_score INT CHECK (complexity_score BETWEEN 1 AND 10),
  confidence_score FLOAT CHECK (confidence_score BETWEEN 0 AND 1),
  suggested_pipeline TEXT,

  -- Pricing
  quoted_price_cents INT NOT NULL,
  cost_to_us_cents INT DEFAULT 0,

  -- Payment
  payment_status payment_status NOT NULL DEFAULT 'pending',
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,

  -- Execution
  execution_status execution_status NOT NULL DEFAULT 'queued',
  assigned_pipeline TEXT,
  deliverable_url TEXT,

  -- Referral tracking
  referral_code TEXT,

  -- Flexible metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- DELIVERIES: Written by A's factory, read by P's storefront
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Deliverable
  deliverable_type deliverable_type NOT NULL,
  deliverable_url TEXT NOT NULL,
  deliverable_description TEXT,

  -- Execution details
  execution_log JSONB DEFAULT '[]'::jsonb,
  pipeline_used TEXT NOT NULL,
  pipeline_version INT DEFAULT 1,
  execution_time_seconds INT,
  cost_to_us_cents INT DEFAULT 0,

  -- QA
  qa_passed BOOLEAN NOT NULL DEFAULT false,
  qa_notes TEXT,
  qa_attempts INT DEFAULT 1
);

-- FEEDBACK: Written by P's form, processed by C's brain
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  delivery_id UUID REFERENCES deliveries(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Customer feedback
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  revision_requested BOOLEAN DEFAULT false,
  revision_details TEXT,

  -- C's enrichment (auto-filled by feedback ingestion service)
  tags TEXT[] DEFAULT '{}',
  sentiment_score FLOAT CHECK (sentiment_score BETWEEN -1 AND 1),
  issue_category TEXT  -- quality | speed | wrong_output | great | scope | other
);

-- PIPELINE IMPROVEMENTS: Written by C's brain, consumed by A's factory
CREATE TABLE pipeline_improvements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_name TEXT NOT NULL,
  improvement_type improvement_type NOT NULL,
  description TEXT,
  before_success_rate FLOAT,
  after_success_rate FLOAT,
  triggered_by_feedback_ids UUID[] DEFAULT '{}',
  applied_at TIMESTAMPTZ,
  applied_by TEXT,  -- 'auto' or person name
  status TEXT DEFAULT 'proposed'  -- proposed | approved | applied | rejected
);

-- EXECUTION LOGS: Written by A's factory, read by C's brain
CREATE TABLE execution_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  step_name TEXT NOT NULL,
  step_index INT NOT NULL,
  input_summary TEXT,
  output_summary TEXT,
  duration_ms INT,
  tokens_used INT DEFAULT 0,
  cost_cents INT DEFAULT 0,
  provider TEXT,  -- claude | gpt4o | ollama
  model TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

-- PIPELINE METRICS: Aggregated by C's brain
CREATE TABLE pipeline_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_name TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_runs INT DEFAULT 0,
  success_count INT DEFAULT 0,
  failure_count INT DEFAULT 0,
  avg_execution_seconds FLOAT,
  avg_cost_cents FLOAT,
  avg_rating FLOAT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TASK PATTERNS: Detected by C's brain
CREATE TABLE task_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pattern_name TEXT NOT NULL,
  description TEXT,
  task_type task_type,
  example_order_ids UUID[] DEFAULT '{}',
  frequency INT DEFAULT 1,
  avg_price_cents INT,
  avg_success_rate FLOAT,
  avg_margin_pct FLOAT,
  growth_trend FLOAT,  -- positive = growing demand
  product_opportunity_score FLOAT,
  embedding VECTOR(1536),  -- for similarity search
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PIPELINE VERSIONS: Tracked by A's factory
CREATE TABLE pipeline_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pipeline_name TEXT NOT NULL,
  version INT NOT NULL,
  config JSONB NOT NULL,  -- full pipeline definition
  prompt_templates JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  UNIQUE(pipeline_name, version)
);

-- REFERRALS: Tracked by P's storefront
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_customer_id UUID REFERENCES auth.users(id),
  referrer_code TEXT NOT NULL UNIQUE,
  referred_email TEXT,
  referred_order_id UUID REFERENCES orders(id),
  credit_cents INT DEFAULT 1000,  -- €10 credit
  status TEXT DEFAULT 'pending',  -- pending | credited | expired
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(execution_status);
CREATE INDEX idx_orders_payment ON orders(payment_status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_deliveries_order ON deliveries(order_id);
CREATE INDEX idx_feedback_order ON feedback(order_id);
CREATE INDEX idx_feedback_rating ON feedback(rating);
CREATE INDEX idx_execution_logs_order ON execution_logs(order_id);
CREATE INDEX idx_task_patterns_type ON task_patterns(task_type);
CREATE INDEX idx_task_patterns_score ON task_patterns(product_opportunity_score DESC);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER task_patterns_updated_at
  BEFORE UPDATE ON task_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Customers see only their own orders
CREATE POLICY orders_customer_read ON orders
  FOR SELECT USING (auth.uid() = customer_id);

-- Service role (backend) can do everything
CREATE POLICY orders_service_all ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- Customers see only their own deliveries
CREATE POLICY deliveries_customer_read ON deliveries
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
  );

CREATE POLICY deliveries_service_all ON deliveries
  FOR ALL USING (auth.role() = 'service_role');

-- Customers can read and insert their own feedback
CREATE POLICY feedback_customer_read ON feedback
  FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
  );

CREATE POLICY feedback_customer_insert ON feedback
  FOR INSERT WITH CHECK (
    order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
  );

CREATE POLICY feedback_service_all ON feedback
  FOR ALL USING (auth.role() = 'service_role');

-- Internal tables: service role only
ALTER TABLE pipeline_improvements ENABLE ROW LEVEL SECURITY;
CREATE POLICY pipeline_improvements_service ON pipeline_improvements
  FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY execution_logs_service ON execution_logs
  FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE pipeline_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY pipeline_metrics_service ON pipeline_metrics
  FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE task_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY task_patterns_service ON task_patterns
  FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE pipeline_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY pipeline_versions_service ON pipeline_versions
  FOR ALL USING (auth.role() = 'service_role');

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY referrals_service ON referrals
  FOR ALL USING (auth.role() = 'service_role');
