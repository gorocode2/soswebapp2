# 🦈 School of Sharks Workout Library System ⚡

A comprehensive database schema for managing structured cycling training workouts, designed for coaches to create detailed training plans and assign them to athletes with precision control over every aspect of the training session.

## 🎯 Overview

The Workout Library System enables:
- **Coaches** to create detailed, structured workouts with multiple segments
- **Athletes** to receive personalized workout assignments with specific targets
- **Performance tracking** through detailed execution results and analytics
- **Flexible training parameters** supporting HR, Power, Cadence, and RPE zones

## 📊 Database Schema

### Core Tables

#### `workout_library`
The main table containing workout templates created by coaches.

**Key Features:**
- Multiple training types (zone2, tempo, interval, vo2max, threshold, etc.)
- Primary and secondary control parameters (hr, power, cadence, rpe)
- Difficulty scaling (1-10)
- Tag-based organization
- Public/private sharing options

#### `workout_segments`
Individual phases within each workout (warmup, intervals, cooldown, etc.).

**Key Features:**
- Ordered segments within workouts
- Flexible duration types (time, distance, open-ended)
- Multiple parameter targets (HR%, Power%, Cadence, RPE)
- Interval support with repetitions and rest periods
- Detailed coaching instructions

#### `workout_categories`
Organizational categories for grouping workouts.

**Default Categories:**
- 🕐 **Endurance** - Long steady-state base building
- ⚡ **Threshold** - Lactate threshold and FTP development  
- 📈 **VO2 Max** - High-intensity anaerobic capacity
- ⚡ **Sprint** - Explosive neuromuscular power
- 💖 **Recovery** - Active recovery and regeneration
- 🏔️ **Climbing** - Hill repeats and sustained efforts
- 🎯 **Time Trial** - Race pace preparation
- ⚙️ **Technique** - Skills and efficiency training

#### `workout_assignments`
When coaches assign specific workouts to athletes.

**Key Features:**
- Scheduled date planning
- Personalized intensity/duration adjustments
- Priority levels and custom notes
- Status tracking (assigned → started → completed)
- Athlete feedback integration

#### `workout_execution_results`
Actual performance data when athletes complete workouts.

**Key Features:**
- Comprehensive performance metrics
- Segment-by-segment results (JSONB)
- Training Stress Score (TSS) calculation
- Athlete rating system (difficulty, enjoyment)
- Integration with cycling sessions

## 🚀 Usage Examples

### Creating a Threshold Workout

```sql
-- Create the main workout
INSERT INTO workout_library (
    name, description, training_type, 
    primary_control_parameter, estimated_duration_minutes, 
    difficulty_level, tags
) VALUES (
    'Threshold Development - 3x7min',
    'Classic threshold workout to build lactate buffering capacity',
    'threshold', 'hr', 60, 7,
    ARRAY['threshold', 'ftp', 'structured']
);

-- Add workout segments
INSERT INTO workout_segments (
    workout_library_id, segment_order, segment_type,
    name, duration_minutes, hr_min_percent, hr_max_percent,
    repetitions, instructions
) VALUES 
    (1, 1, 'warmup', 'Warm Up', 10, 65, 75, 1, 'Gradual warm-up preparation'),
    (1, 2, 'main', '3x 7min Threshold', 7, 82, 89, 3, 'Steady threshold effort'),
    (1, 3, 'cooldown', 'Cool Down', 10, 50, 65, 1, 'Easy recovery spinning');
```

### Assigning a Workout

```sql
-- Coach assigns workout to athlete
INSERT INTO workout_assignments (
    workout_library_id, assigned_to_user_id, assigned_by_user_id,
    scheduled_date, intensity_adjustment, custom_notes
) VALUES (
    1, 123, 456, '2025-07-26', 0.95, 
    'First threshold session - focus on pacing'
);
```

### Recording Results

```sql
-- Athlete completes workout
INSERT INTO workout_execution_results (
    workout_assignment_id, actual_duration_minutes,
    perceived_exertion, avg_heart_rate, avg_power,
    difficulty_rating, enjoyment_rating, athlete_notes
) VALUES (
    1, 58, 7, 165, 250, 8, 7, 
    'Felt strong in the intervals, good session!'
);
```

## 📈 Advanced Queries

### Find Popular Workouts
```sql
SELECT 
    wl.name,
    COUNT(wa.id) as assignments,
    AVG(wer.enjoyment_rating) as avg_rating
FROM workout_library wl
LEFT JOIN workout_assignments wa ON wl.id = wa.workout_library_id
LEFT JOIN workout_execution_results wer ON wa.id = wer.workout_assignment_id
GROUP BY wl.id, wl.name
ORDER BY assignments DESC, avg_rating DESC;
```

### Athlete Progress Tracking
```sql
SELECT 
    u.username,
    wl.training_type,
    AVG(wer.avg_power) as avg_power_trend,
    AVG(wer.training_stress_score) as avg_tss
FROM users u
JOIN workout_assignments wa ON u.id = wa.assigned_to_user_id
JOIN workout_library wl ON wa.workout_library_id = wl.id
JOIN workout_execution_results wer ON wa.id = wer.workout_assignment_id
WHERE wa.completed_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.username, wl.training_type
ORDER BY u.username, wl.training_type;
```

### Coach Workout Analytics
```sql
SELECT 
    coach.username as coach_name,
    wl.training_type,
    COUNT(DISTINCT wl.id) as workouts_created,
    COUNT(wa.id) as total_assignments,
    AVG(wer.completion_percentage) as completion_rate
FROM users coach
JOIN workout_library wl ON coach.id = wl.created_by
LEFT JOIN workout_assignments wa ON wl.id = wa.workout_library_id
LEFT JOIN workout_execution_results wer ON wa.id = wer.workout_assignment_id
GROUP BY coach.id, coach.username, wl.training_type
ORDER BY coach.username, wl.training_type;
```

## 🔧 Installation

### Option 1: Add to Existing Schema
Add the workout library tables to your existing `schema.sql` file (already done in your project).

### Option 2: Migration Script
Use the provided migration script for existing databases:

```bash
psql -d your_database -f backend/src/models/workout_library_migration.sql
```

### Option 3: Sample Data
Load sample workouts to get started:

```bash
psql -d your_database -f backend/src/models/sample_workouts.sql
```

## 🏗️ TypeScript Integration

The system includes comprehensive TypeScript interfaces in `frontend/src/models/types.ts`:

- `WorkoutLibrary` - Main workout template
- `WorkoutSegment` - Individual workout phases  
- `WorkoutAssignment` - Coach-to-athlete assignments
- `WorkoutExecutionResult` - Performance tracking
- `CreateWorkoutLibraryRequest` - API DTOs
- `WorkoutLibraryFilters` - Search and filtering

## 🎨 UI Components

The workout system integrates with your existing components:
- `MonthlySchedule` - Calendar view of assigned workouts
- `DailySchedule` - Daily workout details and execution
- Consistent with your shark-themed design system

## 🔍 Key Benefits

### For Coaches
- **Structured Creation**: Build detailed workouts with precision
- **Reusable Library**: Save and share successful workout templates
- **Assignment Tracking**: Monitor athlete compliance and progress
- **Performance Analytics**: Data-driven coaching decisions

### For Athletes  
- **Clear Instructions**: Detailed guidance for each workout phase
- **Flexible Targets**: Multiple parameter options (HR, Power, RPE, Cadence)
- **Progress Tracking**: Historical performance data
- **Feedback Loop**: Rate and comment on completed sessions

### Technical
- **High Performance**: Optimized indexes for fast queries
- **Scalable Design**: Handles thousands of workouts and assignments
- **Flexible Schema**: Extensible for future training modalities
- **Data Integrity**: Comprehensive constraints and validation

## 🦈 School of Sharks Philosophy

This system embodies the apex predator approach to cycling training:
- **Precision**: Every workout parameter carefully controlled
- **Adaptability**: Flexible enough for any training methodology  
- **Performance**: Lightning-fast queries for real-time coaching
- **Growth**: Comprehensive analytics for continuous improvement

Ready to unleash your inner cycling shark! 🦈⚡
