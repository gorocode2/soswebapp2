-- 🦈 School of Sharks User Management Database Schema
-- High-performance tables for apex cycling predators
-- Run this script to create the complete user management system

BEGIN;

-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - Core user management
CREATE TABLE IF NOT EXISTS users (
    -- Primary identification
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    
    -- Authentication credentials
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Personal information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    
    -- Cycling profile data
    cycling_experience VARCHAR(20) CHECK (cycling_experience IN ('beginner', 'intermediate', 'advanced', 'pro')) DEFAULT 'beginner',
    weight_kg DECIMAL(5,2),
    height_cm INTEGER,
    ftp_watts INTEGER, -- Functional Threshold Power
    max_heart_rate INTEGER,
    
    -- Geographic information
    country VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Account status and preferences
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verified BOOLEAN DEFAULT false,
    subscription_type VARCHAR(20) CHECK (subscription_type IN ('free', 'premium', 'apex_predator')) DEFAULT 'free',
    
    -- Privacy and notification settings
    privacy_settings JSONB DEFAULT '{"profile_public": false, "stats_public": false, "training_public": false}',
    notification_preferences JSONB DEFAULT '{"email_workouts": true, "email_achievements": true, "push_notifications": true}',
    
    -- Platform engagement metrics
    total_sessions INTEGER DEFAULT 0,
    total_distance_km DECIMAL(10,2) DEFAULT 0,
    total_training_hours DECIMAL(8,2) DEFAULT 0,
    apex_score DECIMAL(4,1) DEFAULT 0, -- Performance rating 0-10
    
    -- Security and session management
    last_login_at TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    verification_token VARCHAR(255),
    
    -- Audit trail
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
    
    -- Social features
    avatar_url VARCHAR(500),
    bio TEXT,
    social_links JSONB DEFAULT '{}', -- Store social media links
    
    -- AI coaching preferences
    coaching_preferences JSONB DEFAULT '{"intensity": "moderate", "focus_areas": ["endurance"], "ai_suggestions": true}'
);

-- Extended user profile data for advanced cyclists
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    -- Advanced cycling metrics
    vo2_max DECIMAL(5,2), -- Oxygen uptake measurement
    lactate_threshold_watts INTEGER,
    preferred_cadence INTEGER, -- RPM
    bike_fit_data JSONB, -- Store bike geometry and fit measurements
    
    -- Equipment information
    primary_bike JSONB, -- Bike specifications
    equipment_list JSONB DEFAULT '[]', -- Array of cycling equipment
    
    -- Goals and achievements
    current_goals JSONB DEFAULT '[]',
    achievements JSONB DEFAULT '[]',
    personal_records JSONB DEFAULT '{}',
    
    -- Training history summary
    training_zones JSONB, -- Heart rate and power zones
    seasonal_goals JSONB DEFAULT '{}',
    coach_notes TEXT,
    
    -- Health and injury tracking
    injury_history JSONB DEFAULT '[]',
    health_conditions JSONB DEFAULT '[]',
    
    -- Performance analytics preferences
    preferred_metrics JSONB DEFAULT '["power", "heart_rate", "cadence"]',
    dashboard_layout JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User goals tracking
CREATE TABLE IF NOT EXISTS user_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    goal_type VARCHAR(50) CHECK (goal_type IN ('distance', 'time', 'power', 'weight_loss', 'event_preparation', 'custom')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target_value DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    target_date DATE,
    status VARCHAR(20) CHECK (status IN ('active', 'completed', 'paused', 'cancelled')) DEFAULT 'active',
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- User achievements system
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    icon_url VARCHAR(500),
    badge_color VARCHAR(7) DEFAULT '#007ACC',
    points_awarded INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_featured BOOLEAN DEFAULT false
);

-- User notifications
CREATE TABLE IF NOT EXISTS user_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) CHECK (notification_type IN ('achievement', 'goal_reminder', 'workout_suggestion', 'social', 'system')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    is_actionable BOOLEAN DEFAULT false,
    priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

-- User social following system
CREATE TABLE IF NOT EXISTS user_following (
    id SERIAL PRIMARY KEY,
    follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(follower_id, following_id)
);

-- Create indexes for apex performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_subscription_type ON users(subscription_type);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);
CREATE INDEX IF NOT EXISTS idx_users_apex_score ON users(apex_score DESC);

-- Create partial indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_users_active_premium ON users(id) WHERE is_active = true AND subscription_type = 'premium';
CREATE INDEX IF NOT EXISTS idx_users_unverified ON users(id) WHERE email_verified = false;

-- Indexes for related tables
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_status ON user_goals(status);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_unread ON user_notifications(user_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_user_following_follower ON user_following(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_following_following ON user_following(following_id);

-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at timestamp
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments for documentation
COMMENT ON TABLE users IS 'School of Sharks user management - stores cycling predator profiles';
COMMENT ON COLUMN users.apex_score IS 'AI-calculated performance score (0-10) based on training consistency and improvement';
COMMENT ON COLUMN users.ftp_watts IS 'Functional Threshold Power - cyclist power output sustainability metric';
COMMENT ON COLUMN users.coaching_preferences IS 'AI coaching system preferences and training focus areas';

COMMENT ON TABLE user_profiles IS 'Extended user profiles for advanced cycling metrics and equipment';
COMMENT ON TABLE user_goals IS 'User-defined cycling and fitness goals with progress tracking';
COMMENT ON TABLE user_achievements IS 'Gamification system for user accomplishments and milestones';
COMMENT ON TABLE user_notifications IS 'In-app notification system for user engagement';
COMMENT ON TABLE user_following IS 'Social following system for cyclist community features';

-- Insert sample apex predator for testing
INSERT INTO users (
    email, username, password_hash, first_name, last_name,
    cycling_experience, weight_kg, height_cm, ftp_watts, max_heart_rate,
    country, city, subscription_type, apex_score, bio
) VALUES (
    'test.shark@soscycling.com',
    'test_shark',
    '$2a$12$example_hashed_password_for_testing_only',
    'Test',
    'Shark',
    'advanced',
    75.5,
    180,
    280,
    190,
    'United States',
    'San Francisco',
    'premium',
    8.5,
    'Test apex predator ready to dominate the cycling world! 🦈'
) ON CONFLICT (email) DO NOTHING;

COMMIT;

-- Display success message
SELECT 
    '🦈 School of Sharks user management system deployed successfully!' as message,
    'Apex cycling predators can now create accounts and track their performance!' as status;

-- Show table information
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('users', 'user_profiles', 'user_goals', 'user_achievements', 'user_notifications', 'user_following')
ORDER BY tablename;
