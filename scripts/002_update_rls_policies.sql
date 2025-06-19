-- Ensure tables exist (or create them if they don't)
CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nameAr TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL,
  "baseSalary" NUMERIC NOT NULL,
  attendance JSONB DEFAULT '{}'::jsonb,
  "bonusDays" NUMERIC DEFAULT 0,
  "penaltyDays" NUMERIC DEFAULT 0,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  "startDate" TEXT NOT NULL,
  "branchIds" TEXT[] DEFAULT '{}'::text[],
  status TEXT NOT NULL DEFAULT 'pending',
  email TEXT,
  password TEXT
);

-- Enable Row Level Security for both tables
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts if they were partially created
DROP POLICY IF EXISTS "Allow public read access" ON branches;
DROP POLICY IF EXISTS "Allow authenticated insert" ON branches;
DROP POLICY IF EXISTS "Allow authenticated update" ON branches;
DROP POLICY IF EXISTS "Allow authenticated delete" ON branches;
DROP POLICY IF EXISTS "Allow all access for demo" ON branches; -- Drop the new one too, if it exists

DROP POLICY IF EXISTS "Allow public read access" ON employees;
DROP POLICY IF EXISTS "Allow authenticated insert" ON employees;
DROP POLICY IF EXISTS "Allow authenticated update" ON employees;
DROP POLICY IF EXISTS "Allow authenticated delete" ON employees;
DROP POLICY IF EXISTS "Allow all access for demo" ON employees; -- Drop the new one too, if it exists

-- Create new, more permissive policies for demo purposes
-- This allows any user with the anon key to perform all operations
CREATE POLICY "Allow all access for demo" ON branches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access for demo" ON employees FOR ALL USING (true) WITH CHECK (true);
