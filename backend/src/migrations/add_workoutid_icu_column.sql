-- Migration: Add workoutid_icu and workout_description columns to workout_library table
-- Date: 2025-01-27
-- Purpose: 
-- 1. Link workout library with intervals.icu external workout library
-- 2. Restructure to use workout_description instead of complex workout_segments

-- Step 1: Add the workoutid_icu column to workout_library table
ALTER TABLE workout_library 
ADD COLUMN IF NOT EXISTS workoutid_icu VARCHAR(255);

-- Step 2: Add workout_description column to workout_library table
ALTER TABLE workout_library 
ADD COLUMN IF NOT EXISTS workout_description TEXT;

-- Step 3: Add comments to the columns for clarity
COMMENT ON COLUMN workout_library.workoutid_icu IS 'intervals.icu workout ID for linking external workouts';
COMMENT ON COLUMN workout_library.workout_description IS 'Detailed workout structure description in intervals.icu format (e.g., "- Warm up 10m 47-75% LTHR\n\n3x\n- 7m 82-89% LTHR\n- Easy 4m 59-75% LTHR")';

-- Step 4: Optional - Migrate existing workout_segments data to workout_description
-- This query creates a formatted description from existing segments (if you want to preserve existing data)
UPDATE workout_library 
SET workout_description = (
    SELECT string_agg(
        CASE 
            WHEN ws.segment_type = 'warmup' THEN '- Warm up ' || ws.duration_minutes || 'm'
            WHEN ws.segment_type = 'cooldown' THEN '- Cooldown ' || ws.duration_minutes || 'm'
            WHEN ws.segment_type = 'main' OR ws.segment_type = 'interval' THEN 
                '- ' || ws.name || ' ' || ws.duration_minutes || 'm'
            WHEN ws.segment_type = 'rest' OR ws.segment_type = 'recovery' THEN 
                '- Easy ' || ws.duration_minutes || 'm'
            ELSE '- ' || ws.name || ' ' || ws.duration_minutes || 'm'
        END ||
        CASE 
            WHEN ws.hr_min_percent IS NOT NULL AND ws.hr_max_percent IS NOT NULL 
            THEN ' ' || ws.hr_min_percent || '-' || ws.hr_max_percent || '% LTHR'
            WHEN ws.power_min_percent IS NOT NULL AND ws.power_max_percent IS NOT NULL 
            THEN ' ' || ws.power_min_percent || '-' || ws.power_max_percent || '% FTP'
            WHEN ws.hr_zone IS NOT NULL THEN ' ' || ws.hr_zone || ' HR'
            WHEN ws.power_zone IS NOT NULL THEN ' ' || ws.power_zone
            ELSE ''
        END,
        E'\n' ORDER BY ws.segment_order
    )
    FROM workout_segments ws 
    WHERE ws.workout_library_id = workout_library.id
)
WHERE id IN (SELECT DISTINCT workout_library_id FROM workout_segments)
AND workout_description IS NULL; -- Only update if not already set

-- Step 5: Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_workout_library_workoutid_icu 
ON workout_library(workoutid_icu);

-- Step 6: Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    col_description(pgc.oid, a.attnum) as comment
FROM information_schema.columns a
LEFT JOIN pg_class pgc ON pgc.relname = a.table_name
WHERE table_name = 'workout_library' 
AND column_name IN ('workout_description', 'workoutid_icu')
ORDER BY column_name;

-- Step 7: Show sample of updated workout_library structure
SELECT 
    id, 
    name, 
    LEFT(workout_description, 100) || '...' as workout_description_preview,
    workoutid_icu,
    estimated_duration_minutes,
    training_type
FROM workout_library 
WHERE workout_description IS NOT NULL
LIMIT 3;
