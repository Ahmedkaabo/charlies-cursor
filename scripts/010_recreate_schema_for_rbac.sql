-- =================================================================
-- Charlie's Cafe: Complete Schema Rebuild for Role-Based Access Control
-- Version: 010
-- Description: This script completely drops and recreates the necessary
--              tables (branches, employees, users) to ensure a clean
--              and consistent state for the application. It standardizes
--              on snake_case naming and uses TEXT for all primary keys
--              to avoid UUID type conflicts.
-- =================================================================

-- To prevent foreign key constraint issues, drop tables in order
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS branches CASCADE;

-- -----------------------------------------------------------------
-- Table: branches
-- Stores all cafe branch locations.
-- -----------------------------------------------------------------
CREATE TABLE branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------
-- Table: users
-- Stores user accounts for logging into the application (admins/managers).
-- -----------------------------------------------------------------
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  branch_ids TEXT[] DEFAULT '{}'::text[],
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager')),
  token_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------
-- Table: employees
-- Stores staff information for payroll and management.
-- -----------------------------------------------------------------
CREATE TABLE employees (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('barista', 'waiter', 'captin_order', 'helper', 'steward', 'manager')),
  base_salary NUMERIC NOT NULL,
  attendance JSONB DEFAULT '{}'::jsonb,
  bonus_days NUMERIC DEFAULT 0,
  penalty_days NUMERIC DEFAULT 0,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  start_date TEXT NOT NULL,
  branch_ids TEXT[] DEFAULT '{}'::text[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  email TEXT,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------
-- Disable RLS for simplified development access
-- -----------------------------------------------------------------
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------
-- Insert Sample Data
-- -----------------------------------------------------------------
-- Branches
INSERT INTO branches (id, name) VALUES
('el-estad-branch', 'El Estad'),
('chillout-branch', 'Chillout'),
('lagons-mall-branch', 'Lagons Mall'),
('lagons-aqua-branch', 'Lagons Aqua');

-- Default Admin User (has access to all branches)
INSERT INTO users (id, first_name, last_name, email, password, branch_ids, role, token_version)
VALUES (
  'user_admin_001',
  'Admin',
  'User',
  'admin@charlies.com',
  'Medo123!''',
  (SELECT array_agg(id) FROM branches), -- Assign all branch IDs to admin
  'admin',
  1
) ON CONFLICT (email) DO UPDATE SET 
    -- If admin already exists, update their branches but keep their existing data
    branch_ids = (SELECT array_agg(id) FROM branches),
    token_version = users.token_version; -- Do not reset token version

-- Sample Manager User
INSERT INTO users (id, first_name, last_name, email, password, branch_ids, role, token_version)
VALUES (
  'user_manager_001',
  'Manager',
  'Test',
  'manager@charlies.com',
  'manager123',
  ARRAY['el-estad-branch', 'chillout-branch'], -- Assign specific branches
  'manager',
  1
) ON CONFLICT (email) DO UPDATE SET 
    branch_ids = EXCLUDED.branch_ids,
    token_version = users.token_version; -- Do not reset token version

-- Sample Employees
INSERT INTO employees (
  id, first_name, last_name, phone, role, base_salary,
  month, year, start_date, branch_ids, status, email, password
) VALUES
(
  'emp_001', 'Ahmed', 'Hassan', '01234567890', 'barista', 3000,
  EXTRACT(MONTH FROM NOW())::int, EXTRACT(YEAR FROM NOW())::int, '2025-01-01', ARRAY['el-estad-branch'], 'approved', NULL, NULL
),
(
  'emp_002', 'Fatima', 'Ali', '01234567891', 'waiter', 2800,
  EXTRACT(MONTH FROM NOW())::int, EXTRACT(YEAR FROM NOW())::int, '2025-01-01', ARRAY['chillout-branch'], 'approved', NULL, NULL
),
(
  'emp_manager_001', 'Omar', 'Mohamed', '01234567892', 'manager', 5000,
  EXTRACT(MONTH FROM NOW())::int, EXTRACT(YEAR FROM NOW())::int, '2025-01-01', ARRAY['el-estad-branch', 'chillout-branch'], 'approved',
  'manager@charlies.com', 'manager123'
);

-- -----------------------------------------------------------------
-- Add Indexes for Performance
-- -----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_employees_branch_ids ON employees USING GIN(branch_ids);

-- -----------------------------------------------------------------
-- Create a trigger function to validate branch_ids on user insert/update
-- -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_branch_ids()
RETURNS TRIGGER AS $$
DECLARE
  branch_id_to_check TEXT;
  branch_exists BOOLEAN;
BEGIN
  -- If branch_ids is NULL or empty, no need to check.
  IF NEW.branch_ids IS NULL OR array_length(NEW.branch_ids, 1) IS NULL THEN
    RETURN NEW;
  END IF;

  -- Loop through each ID in the new branch_ids array.
  FOREACH branch_id_to_check IN ARRAY NEW.branch_ids
  LOOP
    -- Check if the branch_id exists in the branches table.
    SELECT EXISTS(SELECT 1 FROM branches WHERE id = branch_id_to_check) INTO branch_exists;

    -- If it doesn't exist, raise an exception to reject the transaction.
    IF NOT branch_exists THEN
      RAISE EXCEPTION 'Invalid branch_id: "%". It does not exist in the branches table.', branch_id_to_check;
    END IF;
  END LOOP;

  -- If all checks pass, allow the transaction to proceed.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------
-- Attach the trigger to the users table.
-- It will run before any INSERT or UPDATE operation.
-- -----------------------------------------------------------------
CREATE TRIGGER trigger_validate_user_branch_ids
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION check_branch_ids();

-- -----------------------------------------------------------------
-- Verification Queries
-- -----------------------------------------------------------------
SELECT 'users' as table_name, count(*) as count from users;
SELECT 'branches' as table_name, count(*) as count from branches;
SELECT 'employees' as table_name, count(*) as count from employees; 