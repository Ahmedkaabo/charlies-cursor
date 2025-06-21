-- Migration: Add Owner Role
-- 1. Update users table to allow 'owner' as a role
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'manager', 'owner'));

-- 2. Update roles table to allow 'owner' as a role (if needed, but name is PK)
-- 3. Insert 'owner' role with view-only permissions for all modules
INSERT INTO roles (name, permissions) VALUES (
  'owner', '{
    "dashboard": {"view": true, "edit": false, "add": false, "delete": false},
    "payroll": {"view": true, "edit": false, "add": false, "delete": false},
    "staff": {"view": true, "edit": false, "add": false, "delete": false},
    "branches": {"view": true, "edit": false, "add": false, "delete": false},
    "users": {"view": true, "edit": false, "add": false, "delete": false},
    "roles": {"view": true, "edit": false, "add": false, "delete": false}
  }'
) ON CONFLICT (name) DO NOTHING; 