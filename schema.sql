-- V4 Digital Archaeology Schema
-- Run this in your Supabase SQL Editor

-- 1. Sessions table
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  last_active_at timestamptz DEFAULT now(),
  country_code text,
  duration_ms bigint
);

-- 2. Interactions table
CREATE TABLE interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  step_name text NOT NULL,
  value text NOT NULL,
  latency_ms bigint
);

-- 3. Card Selections table
CREATE TABLE card_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  card_name text NOT NULL
);

-- Enable Row Level Security (RLS) but allow anonymous inserts and reads for now
-- In production, you might want to restrict this slightly, but for full public access:
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/insert on sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on interactions" ON interactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/insert on card_selections" ON card_selections FOR ALL USING (true) WITH CHECK (true);
