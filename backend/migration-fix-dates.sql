-- Migration to fix date storage issue by converting scheduled_date from DATE to VARCHAR
-- This eliminates timezone conversion problems

-- Step 1: Add a new temporary column with VARCHAR type
ALTER TABLE workout_assignments ADD COLUMN scheduled_date_new VARCHAR(10);

-- Step 2: Copy existing dates as strings (format: YYYY-MM-DD)
UPDATE workout_assignments SET scheduled_date_new = scheduled_date::VARCHAR;

-- Step 3: Drop the old DATE column
ALTER TABLE workout_assignments DROP COLUMN scheduled_date;

-- Step 4: Rename the new column to the original name
ALTER TABLE workout_assignments RENAME COLUMN scheduled_date_new TO scheduled_date;

-- Step 5: Add NOT NULL constraint
ALTER TABLE workout_assignments ALTER COLUMN scheduled_date SET NOT NULL;

-- Step 6: Recreate the unique constraint
ALTER TABLE workout_assignments ADD CONSTRAINT workout_assignments_workout_library_id_assigned_to_user_id__key 
UNIQUE(workout_library_id, assigned_to_user_id, scheduled_date);

-- Step 7: Recreate indexes for performance
CREATE INDEX idx_workout_assignments_date ON workout_assignments(scheduled_date);
CREATE INDEX idx_workout_assignments_athlete_date ON workout_assignments(assigned_to_user_id, scheduled_date);

-- Verify the change
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'workout_assignments' AND column_name = 'scheduled_date';
