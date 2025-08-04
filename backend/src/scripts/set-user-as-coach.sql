-- Set user as coach for testing
-- Replace the email with the actual user email you want to make a coach

UPDATE users 
SET is_coach = true 
WHERE email = 'testing@only.com'; -- Change this to your test user email

-- Check the results
SELECT id, email, username, first_name, last_name, is_coach 
FROM users 
WHERE is_coach = true;
