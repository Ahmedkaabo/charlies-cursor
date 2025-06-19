-- Drop and recreate the branches table with correct structure
DROP TABLE IF EXISTS branches CASCADE;

-- Recreate branches table with all required columns
CREATE TABLE branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nameAr TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for demo purposes
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;

-- Insert test branches
INSERT INTO branches (id, name, nameAr) VALUES 
('main-branch-001', 'Main Branch', 'الفرع الرئيسي'),
('downtown-branch-002', 'Downtown Branch', 'فرع وسط البلد'),
('mall-branch-003', 'Mall Branch', 'فرع المول'),
('stadium-branch-004', 'Stadium Branch', 'فرع الاستاد');

-- Verify the table structure and data
SELECT * FROM branches;
