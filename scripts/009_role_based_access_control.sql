-- Role-Based Access Control Database Schema Update
-- This script adds the users table and updates existing tables for RBAC

-- Create users table for role-based access control
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  branch_ids TEXT[] DEFAULT '{}'::text[],
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  permissions JSONB DEFAULT NULL
);

-- Disable Row Level Security for demo purposes
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Insert default admin user if it doesn't exist
INSERT INTO users (id, first_name, last_name, email, password, branch_ids, role)
VALUES (
  'admin-' || gen_random_uuid()::text,
  'Admin',
  'User',
  'admin@charlies.com',
  'Medo123!''',
  '{}'::text[], -- Empty array means all branches for admin
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Update branches table to remove nameAr column if it exists
ALTER TABLE branches DROP COLUMN IF EXISTS nameAr;

-- Update employees table to use snake_case naming convention
-- First, create new columns with snake_case names
ALTER TABLE employees ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS base_salary NUMERIC;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bonus_days NUMERIC;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS penalty_days NUMERIC;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS start_date TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS branch_ids TEXT[];

-- Copy data from camelCase columns to snake_case columns
UPDATE employees SET 
  first_name = "firstName",
  last_name = "lastName",
  base_salary = "baseSalary",
  bonus_days = "bonusDays",
  penalty_days = "penaltyDays",
  start_date = "startDate",
  branch_ids = "branchIds"
WHERE first_name IS NULL;

-- Make snake_case columns NOT NULL where appropriate
ALTER TABLE employees ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE employees ALTER COLUMN last_name SET NOT NULL;
ALTER TABLE employees ALTER COLUMN base_salary SET NOT NULL;

-- Drop old camelCase columns
ALTER TABLE employees DROP COLUMN IF EXISTS "firstName";
ALTER TABLE employees DROP COLUMN IF EXISTS "lastName";
ALTER TABLE employees DROP COLUMN IF EXISTS "baseSalary";
ALTER TABLE employees DROP COLUMN IF EXISTS "bonusDays";
ALTER TABLE employees DROP COLUMN IF EXISTS "penaltyDays";
ALTER TABLE employees DROP COLUMN IF EXISTS "startDate";
ALTER TABLE employees DROP COLUMN IF EXISTS "branchIds";

-- Add constraints to ensure data integrity
ALTER TABLE employees ADD CONSTRAINT employees_role_check 
  CHECK (role IN ('barista', 'waiter', 'captin_order', 'helper', 'steward', 'manager'));

ALTER TABLE employees ADD CONSTRAINT employees_status_check 
  CHECK (status IN ('pending', 'approved'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_employees_branch_ids ON employees USING GIN(branch_ids);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);

-- Insert sample manager user for testing
INSERT INTO users (id, first_name, last_name, email, password, branch_ids, role)
VALUES (
  'mgr-' || gen_random_uuid()::text,
  'Omar',
  'Mohamed',
  'omar@charlies.com',
  'manager123',
  ARRAY['main-branch-001', 'downtown-branch-002'], -- Specific branches for manager
  'manager'
) ON CONFLICT (email) DO NOTHING;

-- Update existing employee to use new manager credentials
UPDATE employees 
SET email = 'omar@charlies.com', password = 'manager123'
WHERE email IS NULL AND role = 'manager'
LIMIT 1;

-- Verify table structures
SELECT 'users' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
UNION ALL
SELECT 'branches' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'branches' 
UNION ALL
SELECT 'employees' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'employees'
ORDER BY table_name, ordinal_position;

-- Show sample data
SELECT 'Users:' as info;
SELECT id, first_name, last_name, email, role, branch_ids FROM users;

SELECT 'Branches:' as info;
SELECT * FROM branches;

SELECT 'Employees:' as info;
SELECT id, first_name, last_name, role, status, branch_ids FROM employees;

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON TABLE users TO your_app_user;
-- GRANT ALL PRIVILEGES ON TABLE branches TO your_app_user;
-- GRANT ALL PRIVILEGES ON TABLE employees TO your_app_user;

-- Create roles table for role-based permissions
CREATE TABLE IF NOT EXISTS roles (
  name TEXT PRIMARY KEY, -- e.g., 'admin', 'manager', 'hr', 'viewer'
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb -- e.g., {"dashboard": true, "payroll": true}
);

-- Insert default roles with permissions
INSERT INTO roles (name, permissions) VALUES
  ('admin', '{"dashboard": true, "payroll": true, "staff": true, "branches": true, "users": true}'),
  ('manager', '{"payroll": true, "staff": true}'); 