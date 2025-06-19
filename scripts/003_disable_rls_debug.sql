-- Ensure tables exist with correct structure
DROP TABLE IF EXISTS branches CASCADE;
DROP TABLE IF EXISTS employees CASCADE;

-- Recreate branches table
CREATE TABLE branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nameAr TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate employees table
CREATE TABLE employees (
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
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DISABLE Row Level Security completely for now
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- Insert some test data to verify the tables work
INSERT INTO branches (id, name, nameAr) VALUES 
('test-branch-1', 'Test Branch', 'فرع تجريبي')
ON CONFLICT (id) DO NOTHING;

INSERT INTO employees (id, "firstName", "lastName", phone, role, "baseSalary", month, year, "startDate", "branchIds", status) VALUES 
('test-emp-1', 'Test', 'Employee', '01234567890', 'barista', 3000, 0, 2025, '2025-01-01', ARRAY['test-branch-1'], 'approved')
ON CONFLICT (id) DO NOTHING;
