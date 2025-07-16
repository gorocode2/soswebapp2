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
