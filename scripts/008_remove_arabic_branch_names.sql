-- Remove the nameAr column from branches table
ALTER TABLE branches DROP COLUMN IF EXISTS nameAr;

-- Verify the updated table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'branches' 
ORDER BY ordinal_position;

-- Show remaining data
SELECT * FROM branches;
