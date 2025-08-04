-- Migration: Add intervals.icu integration to workout_assignments
-- Add field to store intervals.icu event ID for workout sync

ALTER TABLE workout_assignments 
ADD COLUMN IF NOT EXISTS intervals_icu_event_id VARCHAR(255);

-- Add index for intervals.icu event lookups
CREATE INDEX IF NOT EXISTS idx_workout_assignments_intervals_icu 
ON workout_assignments(intervals_icu_event_id) 
WHERE intervals_icu_event_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN workout_assignments.intervals_icu_event_id IS 'Intervals.icu event ID for syncing workouts with external platform';
