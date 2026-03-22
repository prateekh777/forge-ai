# CLAUDE.md — Forge: AI Service Factory

> This file is the root instruction set for building Forge using Claude Code.
> Read this ENTIRELY before executing any task. Every section is load-bearing.

---

## PROJECT IDENTITY

**Codename:** Forge
**What it is:** An AI-powered service factory. Customers describe a task, pay, AI delivers it. Repeat requests become standalone products.
**Team:** 3 builders — Prateek (P), Achyut (A), CK (C)
**Build method:** Agentic coding via Claude Code. Each person runs their workstream from this root.
**Production target:** This is NOT a prototype. Every line ships. Every commit must be deployable.

---

## MONOREPO STRUCTURE

```
forge/
├── claude.md                          ← YOU ARE HERE
├── .env.example                       ← All env vars (never commit .env)
├── .env.local                         ← Local overrides (gitignored)
├── turbo.json                         ← Turborepo config
├── package.json                       ← Root workspace config
│
├── contracts/                         ← SINGLE SOURCE OF TRUTH
│   ├── database.sql                   ← All Supabase table definitions
│   ├── types.ts                       ← Shared TypeScript types (generated from SQL)
│   ├── enums.ts                       ← All enum values used across the system
│   ├── api-schemas.ts                 ← Zod schemas for all API request/response shapes
│   └── events.ts                      ← All event names + payloads (Supabase Realtime, webhooks)
│
├── tasks/                             ← TASK ORCHESTRATION SYSTEM
│   ├── phase-0/                       ← Foundation (all three, sync)
│   │   ├── 0.01-monorepo/
│   │   │   ├── TASK.md                ← What to build
│   │   │   ├── QA.md                  ← How to verify it works
│   │   │   └── DONE                   ← Created when QA passes (empty file)
│   │   ├── 0.02-supabase-schema/
│   │   │   ├── TASK.md
│   │   │   ├── QA.md
│   │   │   └── data/
│   │   │       └── schema.sql         ← Reference: copy of contracts/database.sql
│   │   └── ...
│   │
│   ├── workstream-p/                  ← Prateek's tasks (The Storefront)
│   │   ├── p1.01-scaffold-nextjs/
│   │   │   ├── TASK.md
│   │   │   ├── QA.md
│   │   │   ├── DEPS.md               ← Lists dependencies on other tasks
│   │   │   └── DONE
│   │   ├── p1.02-landing-hero/
│   │   └── ...
│   │
│   ├── workstream-a/                  ← Achyut's tasks (The Factory)
│   │   ├── a1.01-scaffold-fastapi/
│   │   └── ...
│   │
│   └── workstream-c/                  ← CK's tasks (The Brain)
│       ├── c1.01-supabase-tables/
│       └── ...
│
├── apps/
│   ├── web/                           ← Next.js 14 (App Router) — Prateek owns
│   │   ├── src/
│   │   │   ├── app/                   ← App Router pages
│   │   │   ├── components/            ← React components
│   │   │   ├── lib/                   ← Utilities, Supabase client, Stripe helpers
│   │   │   └── hooks/                 ← Custom React hooks
│   │   ├── public/                    ← Static assets
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                           ← Python FastAPI — Achyut owns
│       ├── src/
│       │   ├── main.py                ← FastAPI app entry
│       │   ├── routers/               ← API route modules
│       │   ├── services/              ← Business logic (classifier, pricing, pipelines)
│       │   ├── pipelines/             ← AI pipeline definitions
│       │   │   ├── base.py            ← Abstract pipeline class
│       │   │   ├── generic.py         ← Catch-all pipeline
│       │   │   ├── automation.py      ← Script/automation tasks
│       │   │   ├── content.py         ← Writing/content tasks
│       │   │   ├── agent.py           ← AI agent building tasks
│       │   │   ├── integration.py     ← API/CRM integration tasks
│       │   │   └── data.py            ← Data analysis tasks
│       │   ├── qa/                    ← QA automation modules
│       │   ├── workers/               ← Background job consumers
│       │   └── utils/                 ← Shared utilities
│       ├── tests/                     ← Pytest test suite
│       ├── pyproject.toml             ← Poetry config
│       └── Dockerfile                 ← Railway deployment
│
├── packages/
│   └── shared/                        ← Shared code between apps
│       ├── src/
│       │   ├── supabase.ts            ← Typed Supabase client
│       │   ├── constants.ts           ← Shared constants
│       │   └── validators.ts          ← Shared validation (Zod)
│       ├── tsconfig.json
│       └── package.json
│
├── supabase/                          ← Supabase local dev + migrations
│   ├── migrations/                    ← SQL migration files (sequential)
│   ├── seed.sql                       ← Test data for local development
│   └── config.toml                    ← Supabase local config
│
├── .github/
│   └── workflows/
│       ├── ci.yml                     ← Lint + type check + test on PR
│       ├── deploy-web.yml             ← Auto-deploy web to Vercel on merge to main
│       └── deploy-api.yml             ← Auto-deploy api to Railway on merge to main
│
└── scripts/
    ├── setup.sh                       ← One-command local dev setup
    ├── seed-test-order.ts             ← Creates a test order for integration testing
    ├── run-qa.sh                      ← Runs QA for a specific task folder
    └── check-contracts.sh             ← Validates all apps against contracts/
```

---

## CONTRACTS — THE LAW OF THIS CODEBASE

The `contracts/` folder is the **single source of truth** for all data shapes.
Every workstream builds AGAINST these contracts, never around them.

**Rules:**
1. NO workstream may change a contract without a PR reviewed by all three.
2. Every Supabase table is defined in `contracts/database.sql`.
3. Every TypeScript type is in `contracts/types.ts` — both `apps/web` and `packages/shared` import from here.
4. Every API request/response shape is a Zod schema in `contracts/api-schemas.ts`.
5. The Python API must match these shapes exactly — use Pydantic models that mirror the Zod schemas.
6. If you need a new field, new table, or new enum value: edit the contract FIRST, then implement.

**Why this matters:** Three people building in parallel WILL diverge if there's no shared contract. P might add a `priority` field to the order form that A's pipeline doesn't know about. C might expect a `tags` array that P never sends. The contracts prevent this. Every integration bug traces back to a contract violation.

### contracts/database.sql

```sql
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
```

---

## TASK SYSTEM — HOW AGENTIC CODING WORKS HERE

### Folder structure per task

```
tasks/workstream-X/x1.01-task-name/
├── TASK.md        ← WHAT to build (prompt + specs + file paths)
├── QA.md          ← HOW to verify (automated checks + manual checks)
├── DEPS.md        ← WHICH tasks must be DONE before starting this one
├── data/          ← Any reference data, sample inputs, test fixtures
└── DONE           ← Created ONLY when QA passes. Contains QA output log.
```

### Execution protocol

When a person sits down to work, they run through their workstream folder in order:

```
1. Check DEPS.md → Are all listed dependencies DONE? (look for DONE file in those task folders)
   - If NO: skip this task, move to the next one that has all deps satisfied
   - If YES: proceed

2. Read TASK.md thoroughly
   - Note which files to create/edit
   - Note which contracts/ files to reference
   - Note any env vars needed

3. Execute the task
   - Write code following the standards in this file
   - Reference contracts/ for all data shapes
   - Import types from contracts/ — never redefine them locally

4. Run QA.md
   - Execute every check listed
   - ALL checks must pass
   - If a check fails: fix the code, re-run

5. When ALL QA checks pass:
   - Create the DONE file with the QA output log
   - git add + commit with message: "task(x1.01): short description"
   - Push to your feature branch
   - If this task is an interface point (feeds another workstream): notify in Slack
```

### Task naming convention

```
Phase 0:   0.01, 0.02, 0.03 ...           (foundation, all three)
Prateek:   p1.01, p1.02 ... p2.01 ...     (storefront phases 1, 2, 3)
Achyut:    a1.01, a1.02 ... a2.01 ...     (factory phases 1, 2, 3)
CK:        c1.01, c1.02 ... c2.01 ...     (brain phases 1, 2, 3)
```

### Dependency notation in DEPS.md

```markdown
# Dependencies
- [x] 0.01-monorepo         ← DONE file exists
- [x] 0.02-supabase-schema  ← DONE file exists
- [ ] a1.03-classifier      ← NOT done yet, cannot start this task
```

---

## QA PROTOCOL — THE GATES THAT KEEP THIS PRODUCTION-GRADE

Every QA.md follows this template:

```markdown
# QA: [task name]

## Automated checks (must ALL pass)

### 1. Build check
- [ ] `cd apps/web && npm run build` exits 0 (or `cd apps/api && poetry run pytest`)
- [ ] No TypeScript errors
- [ ] No linting errors

### 2. Contract compliance
- [ ] All types imported from `contracts/types.ts` (not redefined locally)
- [ ] All Supabase queries match `contracts/database.sql` column names
- [ ] All API payloads match `contracts/api-schemas.ts`

### 3. Functional check
- [ ] [specific test command or curl command]
- [ ] [expected output]

### 4. Integration check (if interface point)
- [ ] Write test data to Supabase that matches the contract
- [ ] Verify the downstream workstream can read it correctly
- [ ] Run: `npx ts-node scripts/seed-test-order.ts` → verify order appears

## Manual checks (human eye)

- [ ] [what to visually verify]
- [ ] [any UX requirements]
```

### QA severity levels

| Level | When | Action on fail |
|-------|------|----------------|
| **GATE** | After every task | Cannot create DONE file. Must fix before proceeding. |
| **MILESTONE** | After sprint completion | All three run integration test together. Must pass before next sprint. |
| **SMOKE** | After every deploy to main | Automated: landing page loads, API health endpoint responds, Supabase connection works. |

### Milestone integration tests

After Sprint 1 (tasks p1.01-p1.13, a1.01-a1.13, c1.01-c1.08):
```bash
# The full order flow
1. Open landing page in browser → page loads, no console errors
2. Fill intake form → submit → order appears in Supabase orders table
3. Complete Stripe checkout (test mode) → payment_status changes to 'paid'
4. A's pipeline picks up order → execution_status changes to 'running'
5. Pipeline completes → delivery row created in deliveries table
6. P's email fires → delivery notification sent
7. C's Slack bot posts to #forge-orders → message appears
8. Check execution_logs table → steps are logged
```

---

## CODING STANDARDS — NON-NEGOTIABLE

### Universal rules

1. **TypeScript strict mode** everywhere in `apps/web` and `packages/shared`. No `any` types. No `@ts-ignore`.
2. **Python type hints** everywhere in `apps/api`. Use Pydantic for all data models.
3. **Import from contracts/** for all shared types. Never redefine a type that exists in contracts.
4. **Environment variables**: All in `.env.example` with comments. Never hardcode secrets. Never commit `.env`.
5. **Error handling**: Every external call (Supabase, Stripe, AI APIs) must be in try/catch with structured error logging.
6. **No console.log in production code**. Use structured logging: `console.error()` for errors, PostHog for analytics events.
7. **Git commits**: `type(scope): description`. Types: `feat`, `fix`, `task`, `qa`, `refactor`, `docs`. Scope: task number or component.

### Frontend (Next.js) — Prateek

```
Framework:     Next.js 14, App Router, TypeScript strict
Styling:       Tailwind CSS + shadcn/ui components
State:         React Server Components by default. Client components only when needed (forms, realtime).
Forms:         React Hook Form + Zod validation (schemas from contracts/api-schemas.ts)
Data fetching: Server components use Supabase server client. Client components use SWR or Supabase Realtime.
Auth:          Supabase Auth with middleware. Magic link primary, Google OAuth secondary.
File uploads:  Supabase Storage. Max 50MB. Accepted: pdf, csv, xlsx, png, jpg, zip.
Email:         Resend SDK + React Email templates in apps/web/src/emails/
Analytics:     PostHog provider wrapping the app. Track: page_view, order_started, order_paid, delivery_viewed, feedback_submitted.
SEO:           Metadata API in layout.tsx. OG images via next/og.
```

**File structure for pages:**
```
app/
├── page.tsx                     ← Landing page
├── order/
│   ├── page.tsx                 ← Intake form
│   └── [id]/
│       ├── confirmed/page.tsx   ← Post-payment confirmation
│       ├── page.tsx             ← Order status (realtime)
│       └── feedback/page.tsx    ← Feedback form
├── dashboard/
│   ├── page.tsx                 ← Customer order list
│   └── [id]/page.tsx            ← Order detail
├── reviews/page.tsx             ← Wall of Love
├── products/[slug]/page.tsx     ← Productised service pages
├── admin/                       ← Internal dashboard (auth-gated)
│   ├── page.tsx                 ← Orders overview
│   ├── revenue/page.tsx
│   └── pipelines/page.tsx
└── api/
    └── webhooks/
        └── stripe/route.ts      ← Stripe webhook handler
```

### Backend (FastAPI) — Achyut

```
Framework:     FastAPI (Python 3.12+), async everywhere
Deps:          Poetry for dependency management
Models:        Pydantic v2 for all request/response models
Database:      supabase-py (async client) — NEVER raw SQL outside migrations
AI providers:  anthropic SDK (Claude), openai SDK (GPT-4o), httpx for Ollama
Pipelines:     Each pipeline is a class inheriting from BasePipeline
Workers:       Background tasks via asyncio. Redis (Upstash) for job queue.
Auth:          API key auth for frontend→backend calls. Supabase service role for DB.
Rate limiting: slowapi middleware. 100 req/min per API key.
Testing:       pytest + pytest-asyncio. Fixtures for mock orders.
```

**File structure for API:**
```
src/
├── main.py                      ← FastAPI app, middleware, startup
├── config.py                    ← Settings from env vars (Pydantic BaseSettings)
├── routers/
│   ├── quote.py                 ← POST /api/quote (classifier + pricing)
│   ├── orders.py                ← Order lifecycle endpoints
│   ├── health.py                ← GET /api/health
│   └── admin.py                 ← Internal admin endpoints
├── services/
│   ├── classifier.py            ← Task complexity classification
│   ├── pricing.py               ← Complexity → price mapping
│   ├── delivery.py              ← Upload deliverable, write to DB, trigger notification
│   └── llm_router.py            ← Multi-provider LLM routing
├── pipelines/
│   ├── base.py                  ← Abstract BasePipeline class
│   ├── router.py                ← Routes order to correct pipeline
│   ├── generic.py               ← Catch-all pipeline
│   ├── automation.py
│   ├── content.py
│   ├── agent.py
│   ├── integration.py
│   └── data.py
├── qa/
│   ├── checker.py               ← Automated QA checks
│   └── escalation.py            ← Human escalation flow
├── workers/
│   ├── order_consumer.py        ← Listens for paid orders, routes to pipeline
│   └── scheduler.py             ← Scheduled jobs (metrics aggregation)
└── utils/
    ├── supabase.py              ← Typed Supabase client wrapper
    ├── slack.py                 ← Slack webhook helpers
    ├── cost_tracker.py          ← Token counting + cost calculation
    └── logger.py                ← Structured logging setup
```

### Pipeline architecture (critical for Achyut)

Every pipeline must:
```python
class BasePipeline(ABC):
    """All pipelines inherit from this. No exceptions."""

    name: str                    # e.g. "automation", "content"
    version: int                 # Increments on changes

    @abstractmethod
    async def execute(self, order: Order) -> PipelineResult:
        """Run the full pipeline. Must return PipelineResult."""
        pass

    async def run(self, order: Order) -> Delivery:
        """Orchestrates: log start → execute → QA → log end → deliver."""
        log_step(order.id, "pipeline_start", {"pipeline": self.name})
        try:
            result = await self.execute(order)
            qa_result = await self.qa_check(order, result)
            if qa_result.passed:
                return await self.deliver(order, result)
            elif qa_result.attempts < 3:
                return await self.retry(order, qa_result)
            else:
                return await self.escalate(order, qa_result)
        except Exception as e:
            await self.handle_error(order, e)
            raise

    async def qa_check(self, order: Order, result: PipelineResult) -> QAResult:
        """Automated QA. Override for pipeline-specific checks."""
        checks = [
            self.check_output_exists(result),
            self.check_output_format(result),
            self.check_llm_self_review(order, result),
        ]
        return QAResult(passed=all(checks), checks=checks)

    async def log_step(self, order_id, step_name, data):
        """Writes to execution_logs table. C's brain reads these."""
        # ... writes to Supabase execution_logs
```

---

## ENVIRONMENT VARIABLES

```bash
# ============================================================
# .env.example — Copy to .env.local and fill in values
# NEVER commit .env.local
# ============================================================

# --- Supabase ---
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # Backend only. Never expose to frontend.
SUPABASE_DB_URL=postgresql://...       # Direct DB connection for migrations

# --- Stripe ---
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# --- AI Providers ---
ANTHROPIC_API_KEY=sk-ant-...           # Claude API (primary)
OPENAI_API_KEY=sk-...                  # GPT-4o (fallback)
OLLAMA_BASE_URL=http://localhost:11434 # Local open-source models

# --- Email ---
RESEND_API_KEY=re_...
FROM_EMAIL=hello@yourforge.com

# --- Monitoring ---
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=sntrys_...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com

# --- Slack ---
SLACK_WEBHOOK_ORDERS=https://hooks.slack.com/services/...
SLACK_WEBHOOK_ALERTS=https://hooks.slack.com/services/...
SLACK_WEBHOOK_WINS=https://hooks.slack.com/services/...
SLACK_WEBHOOK_DEPLOYS=https://hooks.slack.com/services/...

# --- Redis (Upstash) ---
UPSTASH_REDIS_URL=https://...
UPSTASH_REDIS_TOKEN=...

# --- Cloudflare R2 ---
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=forge-assets

# --- App Config ---
NEXT_PUBLIC_APP_URL=https://yourforge.com
API_BASE_URL=https://api.yourforge.com
API_KEY=forge-internal-...             # Frontend → Backend auth
NODE_ENV=development
```

---

## GIT WORKFLOW

```
main          ← Production. Auto-deploys. PRs only. Must pass CI.
├── dev       ← Integration branch. All three merge here first.
├── p/feat-*  ← Prateek's feature branches
├── a/feat-*  ← Achyut's feature branches
└── c/feat-*  ← CK's feature branches
```

**Rules:**
1. Never push directly to `main` or `dev`.
2. Feature branches: `p/feat-landing-page`, `a/feat-classifier`, `c/feat-slack-bots`.
3. PR to `dev` requires 1 review from another person.
4. PR from `dev` to `main` requires all three to approve.
5. Every PR must pass CI: lint + type check + tests.
6. Commit format: `task(p1.03): build landing hero section`

---

## DEPLOYMENT

### Frontend (Vercel)
- Connected to `apps/web/` in monorepo
- Auto-deploy on merge to `main`
- Preview deploys on PRs to `dev`
- Environment variables set in Vercel dashboard
- Edge functions for API routes (`/api/webhooks/stripe`)

### Backend (Railway)
- Connected to `apps/api/` in monorepo
- Dockerfile-based deploy
- Auto-deploy on merge to `main`
- Environment variables set in Railway dashboard
- Horizontal scaling: start with 1 worker, scale to N

### Database (Supabase)
- Project region: EU (Frankfurt) — GDPR compliance
- Migrations in `supabase/migrations/` — run via Supabase CLI
- Local development: `supabase start` for local instance
- Seed data: `supabase db reset` applies migrations + seed.sql

---

## ACCESS + CREDENTIALS COORDINATION

Each person needs these accounts set up BEFORE starting tasks:

| Account | Who sets up | Who needs access |
|---------|-------------|-----------------|
| GitHub org | A | All three (admin) |
| Supabase project | C | All three (admin) |
| Vercel | P | P (admin), A+C (viewer) |
| Railway | A | A (admin), P+C (viewer) |
| Stripe (test mode) | P | All three (team member) |
| Resend | P | P (admin), A+C (viewer) |
| Sentry | C | All three (team member) |
| PostHog | C | All three (team member) |
| Cloudflare | P | P (admin) |
| Slack workspace | C | All three |
| Linear workspace | C | All three |
| Upstash Redis | A | A (admin), C (viewer) |

**Credential sharing:** Use 1Password or Bitwarden team vault. NEVER share secrets over Slack/WhatsApp.

---

## INTERFACE POINTS — WHERE THE THREE ZONES TOUCH

These are the moments where one person's work feeds into another's. Each interface point has a specific contract and notification protocol.

### Interface 1: P → A (Order handoff)
**Trigger:** Customer pays via Stripe → P's webhook writes to `orders` table with `payment_status: paid`
**Contract:** `orders` table schema in `contracts/database.sql`
**A listens:** Order consumer polls/subscribes to orders where `payment_status = 'paid' AND execution_status = 'queued'`
**Notification:** OrderBot posts to `#forge-orders`

### Interface 2: A → P (Quote API)
**Trigger:** P's intake form calls `POST /api/quote` with task description
**Contract:** `QuoteRequest` / `QuoteResponse` in `contracts/api-schemas.ts`
**Response:** `{ complexity_score, confidence, suggested_price_cents, suggested_pipeline }`

### Interface 3: A → P (Delivery)
**Trigger:** A's pipeline completes QA → writes to `deliveries` table → updates `orders.execution_status: delivered`
**Contract:** `deliveries` table schema
**P listens:** Supabase Realtime subscription on `orders.execution_status` change → triggers delivery email

### Interface 4: P → C (Feedback)
**Trigger:** Customer submits feedback form → P writes to `feedback` table
**Contract:** `feedback` table schema
**C listens:** Supabase trigger on `feedback` insert → runs sentiment analysis → enriches tags

### Interface 5: C → A (Pipeline improvements)
**Trigger:** C's brain detects pattern or negative feedback → writes to `pipeline_improvements` table
**Contract:** `pipeline_improvements` table schema
**Notification:** Posts to `#forge-engine` with improvement suggestion

### Interface 6: C → P (Customer intelligence)
**Trigger:** C's weekly digest runs → produces customer segments, churn risks
**Contract:** Slack message to `#forge-feedback` with actionable insights
**P acts:** Adjusts marketing, sends win-back emails

---

## WHEN YOU'RE STUCK — ESCALATION RULES

1. **Code doesn't compile:** Fix it. Don't skip the QA gate. Don't create the DONE file.
2. **Dependency not done:** Skip to the next task that has all deps satisfied. Notify the blocker in `#forge-general`.
3. **Contract needs changing:** Open a PR against `contracts/`. Post in `#forge-general`. All three must approve before merging.
4. **Integration is broken:** Both people on the interface debug together. Use `scripts/seed-test-order.ts` to create known-good test data.
5. **AI pipeline produces bad output:** Log the input/output in `#forge-engine`. Iterate on the prompt. Track in `pipeline_improvements` table.
6. **Don't know how to implement something:** Ask Claude Code. Reference this file. Reference the TASK.md. Don't wing it.
7. **Scope creep on a task:** If a task is taking 2x the estimate, STOP. Break it into smaller tasks. Create new task folders. Update DEPS.md files.

---

## ANTI-HALLUCINATION RULES

When using Claude Code to build tasks, these rules prevent drift:

1. **Always read TASK.md first.** Don't infer what to build from the task name.
2. **Always import types from contracts/.** If the type doesn't exist there, add it to contracts first.
3. **Never invent a database column.** If it's not in `contracts/database.sql`, it doesn't exist.
4. **Never invent an API endpoint.** If it's not in the task list, don't build it.
5. **Never install a dependency without checking the tech stack table.** If it's not listed, ask before adding.
6. **Always run the QA.md checks.** Don't mark a task DONE without running them.
7. **When in doubt, check the contract.** The contract is always right. Your memory might not be.
8. **One task at a time.** Don't jump ahead. Don't "quickly also add" something from a future task.
9. **If you find a bug in another workstream:** Don't fix it. File it in `#forge-alerts` with the exact issue and which task/file is affected.
10. **Commit after every task.** Not after every file. Not after three tasks. After every single task that passes QA.

---

## SPRINT MILESTONES — INTEGRATION CHECKPOINTS

### Sprint 1 complete (days 1-3) — "One order flows through"
```
[ ] P: Landing page loads at production URL
[ ] P: Intake form submits to Supabase
[ ] P: Stripe checkout completes (test mode)
[ ] P: Order confirmation email sends
[ ] A: Classifier returns complexity score for test task
[ ] A: Generic pipeline runs and produces output
[ ] A: Delivery row created in Supabase
[ ] A: QA check runs (even if basic)
[ ] C: All tables exist with correct schema
[ ] C: OrderBot posts to #forge-orders on new paid order
[ ] C: Execution logs are being written
[ ] INTEGRATION: Submit test order → flows through all three → delivery received
```

### Sprint 2 complete (days 4-7) — "Feedback loop works"
```
[ ] P: Feedback form works and writes to Supabase
[ ] P: Order status page shows realtime updates
[ ] P: First 3 TikTok/IG videos posted
[ ] A: Automation, content, and agent pipelines work
[ ] A: QA automation catches bad output
[ ] A: Retry + error handling works
[ ] C: Feedback ingestion auto-tags sentiment
[ ] C: Admin dashboard shows orders + revenue
[ ] C: AlertBot fires on pipeline failure
[ ] INTEGRATION: Submit order → get delivery → give feedback → see it in admin dashboard
```

### Sprint 3 complete (week 2) — "Customers self-serve"
```
[ ] P: Customer dashboard with auth works
[ ] P: Revision request flow works
[ ] P: Retargeting pixel + first ad campaign live
[ ] A: Revision handler re-runs pipeline with feedback
[ ] A: Multi-provider LLM router works (Claude primary, GPT fallback)
[ ] A: Sandbox execution for code tasks works
[ ] C: Pattern detection identifies repeated task types
[ ] C: Cost optimiser flags overspending
[ ] C: Weekly Slack digest sends
[ ] INTEGRATION: Customer places order → revises → gives feedback → pattern detected
```

### Sprint 4 complete (week 3) — "System scales"
```
[ ] P: Referral system works
[ ] P: Wall of Love page auto-populates from 4+ star feedback
[ ] A: Pipeline A/B testing runs
[ ] A: Caching layer reduces redundant API calls
[ ] A: Horizontal scaling works (2+ workers)
[ ] C: Product opportunity scorer ranks patterns
[ ] C: Churn detector flags at-risk customers
[ ] INTEGRATION: 50 test orders → system handles concurrency → product opportunity surfaces
```

---

## QUICK REFERENCE — COMMANDS

```bash
# --- Local development ---
npm install                         # Install all workspaces
cd apps/web && npm run dev          # Start Next.js dev server
cd apps/api && poetry run uvicorn src.main:app --reload  # Start FastAPI
supabase start                      # Start local Supabase
supabase db reset                   # Reset DB + apply migrations + seed

# --- Testing ---
cd apps/web && npm run typecheck    # TypeScript type check
cd apps/web && npm run lint         # ESLint
cd apps/api && poetry run pytest    # Python tests
npx ts-node scripts/seed-test-order.ts  # Seed test data

# --- Deployment ---
git push origin dev                 # Triggers preview deploys
# PR dev → main, get approvals, merge → triggers production deploy

# --- Supabase ---
supabase migration new <name>       # Create new migration
supabase db push                    # Push migrations to remote
supabase gen types typescript --local > contracts/types.ts  # Regenerate types from DB

# --- QA ---
bash scripts/run-qa.sh tasks/workstream-p/p1.01-scaffold-nextjs  # Run QA for a task
bash scripts/check-contracts.sh     # Validate all code against contracts
```
