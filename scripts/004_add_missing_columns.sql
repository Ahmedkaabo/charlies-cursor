-- Add missing nameAr column to branches table if it doesn't exist
ALTER TABLE branches ADD COLUMN IF NOT EXISTS nameAr TEXT;

-- Update existing branches to have nameAr values if they don't have them
UPDATE branches SET nameAr = 'فرع تجريبي' WHERE nameAr IS NULL OR nameAr = '';

-- Insert a test branch
INSERT INTO branches (id, name, nameAr) VALUES 
('main-branch-001', 'Main Branch', 'الفرع الرئيسي'),
('downtown-branch-002', 'Downtown Branch', 'فرع وسط البلد'),
('mall-branch-003', 'Mall Branch', 'فرع المول')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  nameAr = EXCLUDED.nameAr;

-- Verify the structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'branches' 
ORDER BY ordinal_position;
