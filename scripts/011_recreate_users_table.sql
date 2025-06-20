-- Drop the users table if it exists
DROP TABLE IF EXISTS users CASCADE;

-- Create the users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'manager')),
  branch_ids uuid[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Disable Row Level Security for development
ALTER TABLE users DISABLE ROW LEVEL SECURITY; 