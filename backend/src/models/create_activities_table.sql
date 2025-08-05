-- =================================================================
-- 🦈 ACTIVITIES TABLE - SCHOOL OF SHARKS CYCLING PLATFORM ⚡
-- =================================================================
-- Table to store cycling activities imported from intervals.icu and other sources

CREATE TABLE IF NOT EXISTS activities (
    -- Primary identifiers
    id SERIAL PRIMARY KEY,
    intervals_icu_id VARCHAR(50) UNIQUE, -- intervals.icu activity ID (e.g., "i90576713")
    user_id INTEGER NOT NULL, -- Reference to our users table
    external_id VARCHAR(100), -- External ID from other platforms (Strava, etc.)
    
    -- Basic activity information
    name VARCHAR(255) NOT NULL DEFAULT 'Cycling Activity',
    description TEXT,
    activity_type VARCHAR(50) NOT NULL DEFAULT 'Ride', -- Ride, Run, etc.
    start_date_local TIMESTAMP NOT NULL,
    start_date_utc TIMESTAMP NOT NULL,
    timezone VARCHAR(100),
    
    -- Duration and distance
    elapsed_time INTEGER NOT NULL, -- Total elapsed time in seconds
    moving_time INTEGER NOT NULL, -- Active moving time in seconds
    recording_time INTEGER, -- Actual recording time from device
    distance DECIMAL(10,2), -- Distance in meters
    
    -- Speed metrics
    average_speed DECIMAL(8,3), -- m/s
    max_speed DECIMAL(8,3), -- m/s
    
    -- Power metrics (watts)
    has_power_data BOOLEAN DEFAULT FALSE,
    device_watts BOOLEAN DEFAULT FALSE, -- True if power from power meter
    average_watts INTEGER,
    weighted_avg_watts INTEGER, -- Normalized power
    max_watts INTEGER,
    ftp_watts INTEGER, -- FTP at time of activity
    normalized_power INTEGER,
    variability_index DECIMAL(8,4), -- Power variability
    
    -- Heart rate metrics (bpm)
    has_heartrate BOOLEAN DEFAULT FALSE,
    average_heartrate INTEGER,
    max_heartrate INTEGER,
    athlete_max_hr INTEGER, -- Athlete's max HR setting
    lthr INTEGER, -- Lactate threshold heart rate
    resting_hr INTEGER,
    
    -- Cadence metrics (rpm)
    average_cadence DECIMAL(8,3),
    
    -- Training load and intensity
    training_load INTEGER, -- TSS equivalent
    intensity_factor DECIMAL(8,4), -- IF
    training_stress_score INTEGER, -- TSS
    power_load INTEGER, -- Power-based training load
    hr_load INTEGER, -- HR-based training load
    icu_intensity DECIMAL(8,4), -- intervals.icu intensity score
    polarization_index DECIMAL(8,4), -- Training polarization
    
    -- Energy and physiological
    calories INTEGER,
    carbs_used INTEGER, -- Estimated carbs burned
    carbs_ingested INTEGER, -- Carbs consumed during activity
    joules INTEGER, -- Total energy in joules
    joules_above_ftp INTEGER, -- Energy above FTP
    
    -- Environmental data
    average_temp DECIMAL(6,2), -- Celsius
    min_temp DECIMAL(6,2),
    max_temp DECIMAL(6,2),
    elevation_gain INTEGER, -- meters
    elevation_loss INTEGER, -- meters
    average_altitude DECIMAL(8,2), -- meters
    
    -- Power zones time in zone (seconds) - stored as JSON
    power_zone_times JSONB, -- {"Z1": 473, "Z2": 539, ...}
    hr_zone_times JSONB, -- [1247, 357, 54, 34, 0, 0, 0]
    
    -- Device and technical info
    device_name VARCHAR(255),
    power_meter VARCHAR(255),
    power_meter_serial VARCHAR(100),
    power_meter_battery VARCHAR(50),
    file_type VARCHAR(20), -- fit, tcx, gpx, etc.
    
    -- Training context
    trainer BOOLEAN DEFAULT FALSE, -- Indoor trainer session
    commute BOOLEAN DEFAULT FALSE,
    race BOOLEAN DEFAULT FALSE,
    perceived_exertion INTEGER, -- RPE 1-10
    session_rpe INTEGER, -- Session RPE
    feel INTEGER, -- How the athlete felt (1-5 scale)
    
    -- Compliance and coaching
    compliance DECIMAL(5,2), -- Compliance percentage if planned workout
    coach_tick BOOLEAN DEFAULT FALSE, -- Coach approval
    workout_assignment_id INTEGER, -- Link to assigned workout if applicable
    
    -- Analysis and achievements
    achievements JSONB, -- intervals.icu achievements
    interval_summary TEXT[], -- Array of interval summaries
    
    -- External platform integration
    strava_id VARCHAR(50),
    source VARCHAR(50) DEFAULT 'MANUAL', -- WAHOO, GARMIN, STRAVA, etc.
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP, -- When synced from external source
    analyzed_at TIMESTAMP, -- When analysis completed
    
    -- Constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workout_assignment_id) REFERENCES workout_assignments(id) ON DELETE SET NULL,
    
    -- Ensure unique intervals.icu activities per user
    UNIQUE(intervals_icu_id, user_id),
    
    -- Indexes for common queries
    CHECK (elapsed_time >= 0),
    CHECK (moving_time >= 0),
    CHECK (distance >= 0),
    CHECK (perceived_exertion >= 1 AND perceived_exertion <= 10 OR perceived_exertion IS NULL),
    CHECK (session_rpe >= 1 AND session_rpe <= 10 OR session_rpe IS NULL),
    CHECK (feel >= 1 AND feel <= 5 OR feel IS NULL)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_start_date ON activities(start_date_local);
CREATE INDEX IF NOT EXISTS idx_activities_intervals_icu_id ON activities(intervals_icu_id);
CREATE INDEX IF NOT EXISTS idx_activities_workout_assignment ON activities(workout_assignment_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_source ON activities(source);
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON activities(user_id, start_date_local DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_activities_updated_at();

-- Add comments for documentation
COMMENT ON TABLE activities IS 'Stores cycling activities imported from intervals.icu and other sources';
COMMENT ON COLUMN activities.intervals_icu_id IS 'Unique ID from intervals.icu API (e.g., i90576713)';
COMMENT ON COLUMN activities.training_load IS 'Training Stress Score (TSS) equivalent';
COMMENT ON COLUMN activities.intensity_factor IS 'Intensity Factor (IF) - ratio of normalized power to FTP';
COMMENT ON COLUMN activities.power_zone_times IS 'Time spent in each power zone as JSON object';
COMMENT ON COLUMN activities.hr_zone_times IS 'Time spent in each HR zone as JSON array';
COMMENT ON COLUMN activities.compliance IS 'Percentage compliance with planned workout (0-100)';
COMMENT ON COLUMN activities.polarization_index IS 'Training polarization index from intervals.icu';
