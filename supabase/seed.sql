-- Seed data for local dev
-- Run via: supabase db reset

INSERT INTO orders (
  id,
  customer_email,
  customer_name,
  task_description,
  task_type,
  quoted_price_cents,
  payment_status,
  execution_status
) VALUES
(
  'a0000000-0000-0000-0000-000000000001',
  'alice@example.com',
  'Alice Test',
  'Write a 500-word blog post about the future of AI in healthcare, professional tone, SEO optimised.',
  'content',
  4900,
  'paid',
  'delivered'
),
(
  'a0000000-0000-0000-0000-000000000002',
  'bob@example.com',
  'Bob Test',
  'Build a Python script that scrapes product prices from a list of URLs and outputs a CSV.',
  'automation',
  9900,
  'paid',
  'running'
),
(
  'a0000000-0000-0000-0000-000000000003',
  'carol@example.com',
  'Carol Test',
  'Analyse this spreadsheet of sales data and produce a summary report with charts.',
  'data',
  7900,
  'pending',
  'queued'
);
