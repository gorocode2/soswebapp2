-- School of Sharks Database Schema
-- PostgreSQL schema for the AI cycling training platform

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    fitness_level VARCHAR(20) DEFAULT 'beginner', -- beginner, intermediate, advanced
    weight DECIMAL(5,2), -- in kg
    height DECIMAL(5,2), -- in cm
    date_of_birth DATE,
    intervals_icu_id VARCHAR(100) UNIQUE, -- intervals.icu account ID for 3rd party integration
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cycling sessions table
CREATE TABLE IF NOT EXISTS cycling_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_name VARCHAR(255),
    distance DECIMAL(8,2), -- in km
    duration INTEGER, -- in seconds
    average_speed DECIMAL(5,2), -- in km/h
    max_speed DECIMAL(5,2), -- in km/h
    calories_burned INTEGER,
    elevation_gain DECIMAL(8,2), -- in meters
    heart_rate_avg INTEGER,
    heart_rate_max INTEGER,
    power_avg INTEGER, -- in watts
    power_max INTEGER, -- in watts
    session_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    route_data JSONB, -- GPS coordinates and route information
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI training programs table
CREATE TABLE IF NOT EXISTS training_programs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    difficulty_level VARCHAR(20), -- easy, intermediate, advanced, expert
    duration_weeks INTEGER,
    sessions_per_week INTEGER,
    focus_area VARCHAR(100), -- endurance, speed, strength, recovery
    ai_model_version VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User training assignments
CREATE TABLE IF NOT EXISTS user_training_assignments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    program_id INTEGER REFERENCES training_programs(id) ON DELETE CASCADE,
    start_date DATE,
    target_end_date DATE,
    actual_end_date DATE,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, paused, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI coaching sessions
CREATE TABLE IF NOT EXISTS coaching_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(50), -- workout_guidance, performance_analysis, goal_setting
    ai_recommendations JSONB,
    user_feedback JSONB,
    session_duration INTEGER, -- in seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance analytics (aggregated data)
CREATE TABLE IF NOT EXISTS performance_analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    analysis_period VARCHAR(20), -- weekly, monthly, yearly
    total_distance DECIMAL(10,2),
    total_duration INTEGER,
    average_speed DECIMAL(5,2),
    calories_burned INTEGER,
    sessions_count INTEGER,
    improvement_score DECIMAL(5,2), -- AI-calculated improvement metric
    analysis_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_cycling_sessions_user_id ON cycling_sessions(user_id);
CREATE INDEX idx_cycling_sessions_date ON cycling_sessions(session_date);
CREATE INDEX idx_training_assignments_user_id ON user_training_assignments(user_id);
CREATE INDEX idx_coaching_sessions_user_id ON coaching_sessions(user_id);
CREATE INDEX idx_performance_analytics_user_id ON performance_analytics(user_id);

-- =================================================================
-- 🦈 WORKOUT LIBRARY SCHEMA - SCHOOL OF SHARKS TRAINING SYSTEM ⚡
-- =================================================================
-- Comprehensive workout library for coaches to create and assign
-- structured training sessions with detailed segment control

-- Workout Library Table - Core workout templates that coaches create
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
    tags TEXT[], -- Array for easy searching (e.g., ['endurance', 'climbing', 'sprints'])
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT false, -- Can other coaches use this workout?
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workout Segments Table - Individual phases/intervals within a workout
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
    
    -- Heart Rate Parameters (percentage of LTHR or max HR)
    hr_min_percent INTEGER CHECK (hr_min_percent BETWEEN 0 AND 100),
    hr_max_percent INTEGER CHECK (hr_max_percent BETWEEN 0 AND 100),
    hr_zone VARCHAR(10), -- e.g., 'Z1', 'Z2', 'LTHR', 'Zone2'
    
    -- Power Parameters (percentage of FTP)
    power_min_percent INTEGER CHECK (power_min_percent BETWEEN 0 AND 200),
    power_max_percent INTEGER CHECK (power_max_percent BETWEEN 0 AND 200),
    power_zone VARCHAR(10), -- e.g., 'Z1', 'Z2', 'FTP', 'VO2'
    power_watts_min INTEGER CHECK (power_watts_min >= 0),
    power_watts_max INTEGER CHECK (power_watts_max >= 0),
    
    -- Cadence Parameters (RPM)
    cadence_min INTEGER CHECK (cadence_min BETWEEN 30 AND 200),
    cadence_max INTEGER CHECK (cadence_max BETWEEN 30 AND 200),
    
    -- RPE Parameters (Rating of Perceived Exertion 1-10)
    rpe_min INTEGER CHECK (rpe_min BETWEEN 1 AND 10),
    rpe_max INTEGER CHECK (rpe_max BETWEEN 1 AND 10),
    
    -- Interval Configuration
    repetitions INTEGER DEFAULT 1 CHECK (repetitions >= 1),
    rest_duration_minutes INTEGER CHECK (rest_duration_minutes >= 0),
    rest_type VARCHAR(20) DEFAULT 'active' CHECK (rest_type IN (
        'active', 'complete', 'easy_spin'
    )),
    
    -- Coaching Instructions
    instructions TEXT,
    coaching_notes TEXT, -- Internal notes for coaches
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure segment order is unique within each workout
    UNIQUE(workout_library_id, segment_order)
);

-- Workout Categories for organization and filtering
CREATE TABLE IF NOT EXISTS workout_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color_hex VARCHAR(7) CHECK (color_hex ~ '^#[0-9A-Fa-f]{6}$'), -- Valid hex color
    icon_name VARCHAR(50), -- For UI icons
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for workout-category relationships (many-to-many)
CREATE TABLE IF NOT EXISTS workout_library_categories (
    workout_library_id INTEGER REFERENCES workout_library(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES workout_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (workout_library_id, category_id)
);

-- Workout Assignments - When coaches assign workouts to athletes
CREATE TABLE IF NOT EXISTS workout_assignments (
    id SERIAL PRIMARY KEY,
    workout_library_id INTEGER NOT NULL REFERENCES workout_library(id) ON DELETE CASCADE,
    assigned_to_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    
    -- Personalized adjustments for this specific assignment
    intensity_adjustment DECIMAL(4,2) DEFAULT 1.00 CHECK (intensity_adjustment BETWEEN 0.5 AND 2.0),
    duration_adjustment DECIMAL(4,2) DEFAULT 1.00 CHECK (duration_adjustment BETWEEN 0.5 AND 2.0),
    custom_notes TEXT,
    
    -- Assignment status tracking
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

-- Workout Execution Results - Actual performance data when athlete completes workout
CREATE TABLE IF NOT EXISTS workout_execution_results (
    id SERIAL PRIMARY KEY,
    workout_assignment_id INTEGER NOT NULL REFERENCES workout_assignments(id) ON DELETE CASCADE,
    cycling_session_id INTEGER REFERENCES cycling_sessions(id) ON DELETE SET NULL,
    
    -- Overall workout metrics
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
    
    -- Segment-specific results stored as JSONB for flexibility
    segment_results JSONB, -- Array of segment performance data
    
    -- Athlete feedback
    difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 10),
    enjoyment_rating INTEGER CHECK (enjoyment_rating BETWEEN 1 AND 10),
    athlete_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes for high-speed queries 🚀
CREATE INDEX idx_workout_library_training_type ON workout_library(training_type);
CREATE INDEX idx_workout_library_duration ON workout_library(estimated_duration_minutes);
CREATE INDEX idx_workout_library_difficulty ON workout_library(difficulty_level);
CREATE INDEX idx_workout_library_active ON workout_library(is_active);
CREATE INDEX idx_workout_library_public ON workout_library(is_public);
CREATE INDEX idx_workout_library_creator ON workout_library(created_by);
CREATE INDEX idx_workout_library_tags ON workout_library USING GIN(tags);

CREATE INDEX idx_workout_segments_workout_id ON workout_segments(workout_library_id);
CREATE INDEX idx_workout_segments_order ON workout_segments(workout_library_id, segment_order);
CREATE INDEX idx_workout_segments_type ON workout_segments(segment_type);

CREATE INDEX idx_workout_categories_active ON workout_categories(is_active);
CREATE INDEX idx_workout_categories_sort ON workout_categories(sort_order);

CREATE INDEX idx_workout_assignments_athlete ON workout_assignments(assigned_to_user_id);
CREATE INDEX idx_workout_assignments_coach ON workout_assignments(assigned_by_user_id);
CREATE INDEX idx_workout_assignments_date ON workout_assignments(scheduled_date);
CREATE INDEX idx_workout_assignments_status ON workout_assignments(status);
CREATE INDEX idx_workout_assignments_athlete_date ON workout_assignments(assigned_to_user_id, scheduled_date);

CREATE INDEX idx_workout_results_assignment ON workout_execution_results(workout_assignment_id);
CREATE INDEX idx_workout_results_session ON workout_execution_results(cycling_session_id);
CREATE INDEX idx_workout_results_tss ON workout_execution_results(training_stress_score);

-- Insert default workout categories following School of Sharks theme 🦈
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
