-- =================================================================
-- 🦈 WORKOUT LIBRARY MIGRATION SCRIPT - SCHOOL OF SHARKS ⚡
-- =================================================================
-- Safe migration to add workout library tables to existing database
-- Run this script to upgrade your database schema

-- Start transaction for safe rollback if needed
BEGIN;

-- Check if we're adding to the correct database
DO $$
BEGIN
    -- Verify users table exists (our dependency)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Users table not found. This migration requires the base schema to be installed first.';
    END IF;
    
    RAISE NOTICE '🦈 Starting School of Sharks Workout Library Migration...';
END $$;

-- Create workout_library table
CREATE TABLE IF NOT EXISTS workout_library (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    training_type VARCHAR(50) NOT NULL CHECK (training_type IN (
        'zone2', 'tempo', 'interval', 'vo2max', 'recovery', 
        'threshold', 'neuromuscular', 'endurance', 'sprint'
    )),
    primary_control_parameter VARCHAR(20) NOT NULL CHECK (primary_control_parameter IN (
        'hr', 'power', 'cadence', 'rpe'
    )),
    secondary_control_parameter VARCHAR(20) CHECK (secondary_control_parameter IN (
        'hr', 'power', 'cadence', 'rpe'
    )),
    estimated_duration_minutes INTEGER NOT NULL CHECK (estimated_duration_minutes > 0),
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 10),
    tags TEXT[],
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create workout_segments table
CREATE TABLE IF NOT EXISTS workout_segments (
    id SERIAL PRIMARY KEY,
    workout_library_id INTEGER NOT NULL REFERENCES workout_library(id) ON DELETE CASCADE,
    segment_order INTEGER NOT NULL CHECK (segment_order > 0),
    segment_type VARCHAR(50) NOT NULL CHECK (segment_type IN (
        'warmup', 'main', 'interval', 'recovery', 'cooldown', 'rest', 'build', 'test'
    )),
    name VARCHAR(255) NOT NULL,
    duration_minutes INTEGER CHECK (duration_minutes > 0),
    duration_type VARCHAR(20) DEFAULT 'time' CHECK (duration_type IN (
        'time', 'distance', 'until_failure', 'open', 'laps'
    )),
    
    -- Heart Rate Parameters
    hr_min_percent INTEGER CHECK (hr_min_percent BETWEEN 0 AND 100),
    hr_max_percent INTEGER CHECK (hr_max_percent BETWEEN 0 AND 100),
    hr_zone VARCHAR(10),
    
    -- Power Parameters
    power_min_percent INTEGER CHECK (power_min_percent BETWEEN 0 AND 200),
    power_max_percent INTEGER CHECK (power_max_percent BETWEEN 0 AND 200),
    power_zone VARCHAR(10),
    power_watts_min INTEGER CHECK (power_watts_min >= 0),
    power_watts_max INTEGER CHECK (power_watts_max >= 0),
    
    -- Cadence Parameters
    cadence_min INTEGER CHECK (cadence_min BETWEEN 30 AND 200),
    cadence_max INTEGER CHECK (cadence_max BETWEEN 30 AND 200),
    
    -- RPE Parameters
    rpe_min INTEGER CHECK (rpe_min BETWEEN 1 AND 10),
    rpe_max INTEGER CHECK (rpe_max BETWEEN 1 AND 10),
    
    -- Interval Configuration
    repetitions INTEGER DEFAULT 1 CHECK (repetitions >= 1),
    rest_duration_minutes INTEGER CHECK (rest_duration_minutes >= 0),
    rest_type VARCHAR(20) DEFAULT 'active' CHECK (rest_type IN (
        'active', 'complete', 'easy_spin'
    )),
    
    -- Instructions
    instructions TEXT,
    coaching_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure segment order is unique within each workout
    UNIQUE(workout_library_id, segment_order)
);

-- Create workout_categories table
CREATE TABLE IF NOT EXISTS workout_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color_hex VARCHAR(7) CHECK (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
    icon_name VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create junction table for workout-category relationships
CREATE TABLE IF NOT EXISTS workout_library_categories (
    workout_library_id INTEGER REFERENCES workout_library(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES workout_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (workout_library_id, category_id)
);

-- Create workout_assignments table
CREATE TABLE IF NOT EXISTS workout_assignments (
    id SERIAL PRIMARY KEY,
    workout_library_id INTEGER NOT NULL REFERENCES workout_library(id) ON DELETE CASCADE,
    assigned_to_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    
    -- Personalized adjustments
    intensity_adjustment DECIMAL(4,2) DEFAULT 1.00 CHECK (intensity_adjustment BETWEEN 0.5 AND 2.0),
    duration_adjustment DECIMAL(4,2) DEFAULT 1.00 CHECK (duration_adjustment BETWEEN 0.5 AND 2.0),
    custom_notes TEXT,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN (
        'assigned', 'started', 'completed', 'skipped', 'modified'
    )),
    completed_at TIMESTAMP,
    athlete_feedback TEXT,
    coach_review TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one assignment per athlete per day for same workout
    UNIQUE(workout_library_id, assigned_to_user_id, scheduled_date)
);

-- Create workout_execution_results table
CREATE TABLE IF NOT EXISTS workout_execution_results (
    id SERIAL PRIMARY KEY,
    workout_assignment_id INTEGER NOT NULL REFERENCES workout_assignments(id) ON DELETE CASCADE,
    cycling_session_id INTEGER REFERENCES cycling_sessions(id) ON DELETE SET NULL,
    
    -- Overall metrics
    actual_duration_minutes INTEGER CHECK (actual_duration_minutes > 0),
    perceived_exertion INTEGER CHECK (perceived_exertion BETWEEN 1 AND 10),
    completion_percentage DECIMAL(5,2) DEFAULT 100.00 CHECK (completion_percentage BETWEEN 0 AND 100),
    
    -- Performance metrics
    avg_heart_rate INTEGER CHECK (avg_heart_rate > 0),
    max_heart_rate INTEGER CHECK (max_heart_rate > 0),
    avg_power INTEGER CHECK (avg_power >= 0),
    max_power INTEGER CHECK (max_power >= 0),
    avg_cadence INTEGER CHECK (avg_cadence > 0),
    normalized_power INTEGER CHECK (normalized_power >= 0),
    training_stress_score DECIMAL(6,2) CHECK (training_stress_score >= 0),
    
    -- Segment results as JSONB
    segment_results JSONB,
    
    -- Athlete feedback
    difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 10),
    enjoyment_rating INTEGER CHECK (enjoyment_rating BETWEEN 1 AND 10),
    athlete_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create performance indexes
DO $$
BEGIN
    -- Workout Library indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_library_training_type') THEN
        CREATE INDEX idx_workout_library_training_type ON workout_library(training_type);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_library_duration') THEN
        CREATE INDEX idx_workout_library_duration ON workout_library(estimated_duration_minutes);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_library_difficulty') THEN
        CREATE INDEX idx_workout_library_difficulty ON workout_library(difficulty_level);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_library_active') THEN
        CREATE INDEX idx_workout_library_active ON workout_library(is_active);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_library_public') THEN
        CREATE INDEX idx_workout_library_public ON workout_library(is_public);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_library_creator') THEN
        CREATE INDEX idx_workout_library_creator ON workout_library(created_by);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_library_tags') THEN
        CREATE INDEX idx_workout_library_tags ON workout_library USING GIN(tags);
    END IF;
    
    -- Workout Segments indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_segments_workout_id') THEN
        CREATE INDEX idx_workout_segments_workout_id ON workout_segments(workout_library_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_segments_order') THEN
        CREATE INDEX idx_workout_segments_order ON workout_segments(workout_library_id, segment_order);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_segments_type') THEN
        CREATE INDEX idx_workout_segments_type ON workout_segments(segment_type);
    END IF;
    
    -- Categories indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_categories_active') THEN
        CREATE INDEX idx_workout_categories_active ON workout_categories(is_active);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_categories_sort') THEN
        CREATE INDEX idx_workout_categories_sort ON workout_categories(sort_order);
    END IF;
    
    -- Assignments indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_assignments_athlete') THEN
        CREATE INDEX idx_workout_assignments_athlete ON workout_assignments(assigned_to_user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_assignments_coach') THEN
        CREATE INDEX idx_workout_assignments_coach ON workout_assignments(assigned_by_user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_assignments_date') THEN
        CREATE INDEX idx_workout_assignments_date ON workout_assignments(scheduled_date);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_assignments_status') THEN
        CREATE INDEX idx_workout_assignments_status ON workout_assignments(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_assignments_athlete_date') THEN
        CREATE INDEX idx_workout_assignments_athlete_date ON workout_assignments(assigned_to_user_id, scheduled_date);
    END IF;
    
    -- Results indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_results_assignment') THEN
        CREATE INDEX idx_workout_results_assignment ON workout_execution_results(workout_assignment_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_results_session') THEN
        CREATE INDEX idx_workout_results_session ON workout_execution_results(cycling_session_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_workout_results_tss') THEN
        CREATE INDEX idx_workout_results_tss ON workout_execution_results(training_stress_score);
    END IF;
    
    RAISE NOTICE '📊 Performance indexes created successfully';
END $$;

-- Insert default workout categories
INSERT INTO workout_categories (name, description, color_hex, icon_name, sort_order) VALUES
('Endurance', 'Long steady-state efforts to build aerobic base like a cruising shark', '#3B82F6', 'clock', 1),
('Threshold', 'Lactate threshold and FTP building workouts for sustained power', '#EF4444', 'zap', 2),
('VO2 Max', 'High-intensity efforts to improve oxygen uptake and anaerobic capacity', '#F59E0B', 'trending-up', 3),
('Sprint', 'Short explosive power and neuromuscular training for apex speed', '#10B981', 'flash', 4),
('Recovery', 'Easy spinning and active recovery sessions for regeneration', '#6B7280', 'heart', 5),
('Climbing', 'Hill repeats and sustained climbing efforts for elevation gains', '#8B5CF6', 'mountain', 6),
('Time Trial', 'Sustained efforts at race pace for competitive preparation', '#EC4899', 'target', 7),
('Technique', 'Skills-focused sessions for pedaling efficiency and bike handling', '#14B8A6', 'settings', 8)
ON CONFLICT (name) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to relevant tables
DROP TRIGGER IF EXISTS update_workout_library_updated_at ON workout_library;
CREATE TRIGGER update_workout_library_updated_at 
    BEFORE UPDATE ON workout_library 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workout_assignments_updated_at ON workout_assignments;
CREATE TRIGGER update_workout_assignments_updated_at 
    BEFORE UPDATE ON workout_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migration complete
DO $$
BEGIN
    RAISE NOTICE '🦈 ⚡ School of Sharks Workout Library Migration Complete! ⚡ 🦈';
    RAISE NOTICE '📋 Tables created: workout_library, workout_segments, workout_categories, workout_library_categories, workout_assignments, workout_execution_results';
    RAISE NOTICE '📊 Indexes created for optimal performance';
    RAISE NOTICE '🏷️  Default categories inserted';
    RAISE NOTICE '🚀 Ready to create structured training plans for apex cycling performance!';
END $$;

-- Commit the transaction
COMMIT;

-- Display summary of new tables
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE tablename IN (
    'workout_library', 
    'workout_segments', 
    'workout_categories', 
    'workout_library_categories',
    'workout_assignments',
    'workout_execution_results'
)
ORDER BY tablename;
