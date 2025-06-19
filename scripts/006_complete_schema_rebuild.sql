-- Complete database rebuild to fix schema cache issues

-- Drop all existing tables to start fresh
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS branches CASCADE;

-- Recreate branches table with correct structure
CREATE TABLE branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nameAr TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate employees table with correct structure
CREATE TABLE employees (
  id TEXT PRIMARY KEY,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('barista', 'waiter', 'helper', 'manager')),
  "baseSalary" NUMERIC NOT NULL,
  attendance JSONB DEFAULT '{}'::jsonb,
  "bonusDays" NUMERIC DEFAULT 0,
  "penaltyDays" NUMERIC DEFAULT 0,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  "startDate" TEXT NOT NULL,
  "branchIds" TEXT[] DEFAULT '{}'::text[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  email TEXT,
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable Row Level Security for demo purposes
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- Insert test branches
INSERT INTO branches (id, name, nameAr) VALUES 
('main-branch-001', 'Main Branch', 'الفرع الرئيسي'),
('downtown-branch-002', 'Downtown Branch', 'فرع وسط البلد'),
('mall-branch-003', 'Mall Branch', 'فرع المول'),
('stadium-branch-004', 'Stadium Branch', 'فرع الاستاد'),
('airport-branch-005', 'Airport Branch', 'فرع المطار');

-- Insert test employees
INSERT INTO employees (
  id, "firstName", "lastName", phone, role, "baseSalary", 
  month, year, "startDate", "branchIds", status, email, password
) VALUES 
(
  'emp-001', 'Ahmed', 'Hassan', '01234567890', 'barista', 3000,
  0, 2025, '2025-01-01', ARRAY['main-branch-001'], 'approved', NULL, NULL
),
(
  'emp-002', 'Fatima', 'Ali', '01234567891', 'waiter', 2800,
  0, 2025, '2025-01-01', ARRAY['downtown-branch-002'], 'approved', NULL, NULL
),
(
  'mgr-001', 'Omar', 'Mohamed', '01234567892', 'manager', 5000,
  0, 2025, '2025-01-01', ARRAY['main-branch-001', 'downtown-branch-002'], 'approved', 
  'omar@charlies.com', 'manager123'
);

-- Verify table structures
SELECT 'branches' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'branches' 
UNION ALL
SELECT 'employees' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'employees'
ORDER BY table_name, ordinal_position;

-- Show sample data
SELECT 'Branches:' as info;
SELECT * FROM branches;

SELECT 'Employees:' as info;
SELECT id, "firstName", "lastName", role, status FROM employees;
