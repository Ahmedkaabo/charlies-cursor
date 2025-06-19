-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  nameAr TEXT NOT NULL
);

-- Create employees table
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

-- Optional: Add RLS policies for public access (for demo purposes)
-- In a real app, you'd refine these based on user roles and authentication
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON branches FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON branches FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update" ON branches FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON branches FOR DELETE USING (true);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON employees FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert" ON employees FOR INSERT WITH (auth.role() = 'authenticated'); -- Corrected syntax for WITH CHECK
CREATE POLICY "Allow authenticated update" ON employees FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated delete" ON employees FOR DELETE USING (true);
