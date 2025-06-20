-- Seed the users table with an initial admin user
insert into users (first_name, last_name, email, password, role, branch_ids)
values ('Admin', 'User', 'admin@charlies.com', 'Medo123!''', 'admin', '{}')
on conflict (email) do nothing; 