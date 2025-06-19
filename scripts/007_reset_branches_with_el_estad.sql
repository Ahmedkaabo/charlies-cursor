-- Delete all existing branches
DELETE FROM branches;

-- Insert the single test branch "El Estad"
INSERT INTO branches (id, name, nameAr) VALUES 
('el-estad-branch', 'El Estad', 'الاستاد');

-- Verify the branch was created
SELECT * FROM branches;
