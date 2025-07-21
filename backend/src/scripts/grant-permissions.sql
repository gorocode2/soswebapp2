-- 🦈 School of Sharks Database - Grant Permissions to Goro
-- This script grants necessary permissions to the 'goro' user

-- Connect as postgres superuser and run these commands:

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO goro;

-- Grant all privileges on all tables in public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO goro;

-- Grant all privileges on all sequences in public schema (for auto-increment IDs)
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO goro;

-- Grant privileges on future tables (so new tables are accessible)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO goro;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO goro;

-- Specific grants for each table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO goro;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO goro;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cycling_sessions TO goro;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_programs TO goro;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_training_assignments TO goro;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coaching_sessions TO goro;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.performance_analytics TO goro;

-- If there are any sequences (auto-increment), grant usage
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO goro;

-- Check current permissions
SELECT 
    table_name,
    privilege_type,
    grantee 
FROM information_schema.table_privileges 
WHERE grantee = 'goro';
