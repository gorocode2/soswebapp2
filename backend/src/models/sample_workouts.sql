-- =================================================================
-- 🦈 SCHOOL OF SHARKS WORKOUT LIBRARY - SAMPLE DATA ⚡
-- =================================================================
-- Comprehensive sample workouts demonstrating the full power
-- of the workout library system for apex cycling performance

-- Sample Workout 1: Classic Threshold Development
WITH threshold_workout AS (
  INSERT INTO workout_library (
    name, 
    description, 
    training_type, 
    primary_control_parameter,
    secondary_control_parameter,
    estimated_duration_minutes,
    difficulty_level,
    tags,
    is_public
  ) VALUES (
    'Threshold Development - 3x7min',
    'Classic threshold workout to build lactate buffering capacity and FTP. Perfect for intermediate to advanced cyclists looking to improve their sustained power output.',
    'threshold',
    'hr',
    'power',
    60,
    7,
    ARRAY['threshold', 'ftp', 'lactate', 'intermediate', 'structured'],
    true
  ) RETURNING id
)

-- Insert segments for threshold workout
INSERT INTO workout_segments (
  workout_library_id,
  segment_order,
  segment_type,
  name,
  duration_minutes,
  hr_min_percent,
  hr_max_percent,
  power_min_percent,
  power_max_percent,
  rpe_min,
  rpe_max,
  repetitions,
  rest_duration_minutes,
  rest_type,
  instructions
) 
SELECT 
  tw.id,
  segment_data.*
FROM threshold_workout tw,
(VALUES 
  (1, 'warmup', 'Warm Up', 10, 65, 75, 55, 65, 3, 4, 1, NULL, 'active', 'Gradual warm-up, spin easy and prepare your body for the main effort. Include a few 30-second efforts at 85% to prime the legs.'),
  (2, 'main', '3x 7min Threshold Intervals', 7, 82, 89, 88, 105, 7, 8, 3, 4, 'active', 'Steady effort at lactate threshold. Should feel comfortably hard - you could speak 2-3 words. Focus on smooth pedaling and controlled breathing.'),
  (3, 'main', 'Final 10min Tempo', 10, 75, 80, 76, 90, 6, 7, 1, NULL, 'active', 'Sustained tempo effort to extend the training stimulus. Maintain steady rhythm and good form.'),
  (4, 'cooldown', 'Cool Down', 10, 50, 65, 45, 60, 2, 3, 1, NULL, 'active', 'Easy spinning to gradually bring heart rate down. Focus on recovery and lactate clearance.')
) AS segment_data(segment_order, segment_type, name, duration_minutes, hr_min_percent, hr_max_percent, power_min_percent, power_max_percent, rpe_min, rpe_max, repetitions, rest_duration_minutes, rest_type, instructions);

-- Sample Workout 2: VO2 Max Intervals
WITH vo2_workout AS (
  INSERT INTO workout_library (
    name, 
    description, 
    training_type, 
    primary_control_parameter,
    secondary_control_parameter,
    estimated_duration_minutes,
    difficulty_level,
    tags,
    is_public
  ) VALUES (
    'VO2 Max Crushers - 5x3min',
    'High-intensity intervals to maximize oxygen uptake and anaerobic power. These efforts will push you to your limits and significantly improve your top-end fitness.',
    'vo2max',
    'power',
    'hr',
    70,
    9,
    ARRAY['vo2max', 'anaerobic', 'hard', 'advanced', 'intervals'],
    true
  ) RETURNING id
)

INSERT INTO workout_segments (
  workout_library_id,
  segment_order,
  segment_type,
  name,
  duration_minutes,
  hr_min_percent,
  hr_max_percent,
  power_min_percent,
  power_max_percent,
  rpe_min,
  rpe_max,
  repetitions,
  rest_duration_minutes,
  rest_type,
  instructions
) 
SELECT 
  vw.id,
  segment_data.*
FROM vo2_workout vw,
(VALUES 
  (1, 'warmup', 'Progressive Warm Up', 15, 60, 85, 50, 75, 3, 6, 1, NULL, 'active', 'Start easy and build gradually. Include 3x30sec efforts at 90% FTP to open up the legs and prepare for the main set.'),
  (2, 'main', '5x 3min VO2 Max', 3, 90, 100, 110, 120, 8, 9, 5, 3, 'easy_spin', 'All-out sustainable effort for 3 minutes. This should hurt! Focus on smooth pedaling, controlled breathing, and mental toughness.'),
  (3, 'cooldown', 'Extended Cool Down', 15, 50, 65, 45, 60, 2, 3, 1, NULL, 'active', 'Long cool down to clear lactate and begin recovery process. Stay hydrated and focus on easy spinning.')
) AS segment_data(segment_order, segment_type, name, duration_minutes, hr_min_percent, hr_max_percent, power_min_percent, power_max_percent, rpe_min, rpe_max, repetitions, rest_duration_minutes, rest_type, instructions);

-- Sample Workout 3: Endurance Base Building
WITH endurance_workout AS (
  INSERT INTO workout_library (
    name, 
    description, 
    training_type, 
    primary_control_parameter,
    estimated_duration_minutes,
    difficulty_level,
    tags,
    is_public
  ) VALUES (
    'Aerobic Base Builder - 90min Zone 2',
    'Long steady aerobic effort to build your base fitness and fat-burning capacity. The foundation of all cycling fitness.',
    'zone2',
    'hr',
    90,
    4,
    ARRAY['endurance', 'zone2', 'base', 'aerobic', 'beginner-friendly'],
    true
  ) RETURNING id
)

INSERT INTO workout_segments (
  workout_library_id,
  segment_order,
  segment_type,
  name,
  duration_minutes,
  hr_min_percent,
  hr_max_percent,
  power_min_percent,
  power_max_percent,
  rpe_min,
  rpe_max,
  repetitions,
  instructions
) 
SELECT 
  ew.id,
  segment_data.*
FROM endurance_workout ew,
(VALUES 
  (1, 'warmup', 'Easy Warm Up', 10, 60, 70, 45, 55, 2, 3, 1, 'Start very easy and gradually increase to Zone 2 heart rate. No rush - let your body warm up naturally.'),
  (2, 'main', 'Zone 2 Steady State', 70, 69, 75, 56, 75, 3, 4, 1, 'Steady aerobic effort in Zone 2. Should feel conversational - you can speak in full sentences. Focus on efficient pedaling and good position.'),
  (3, 'cooldown', 'Easy Cool Down', 10, 50, 65, 40, 50, 2, 3, 1, 'Gentle cool down to complete the session. Great job building your aerobic base!')
) AS segment_data(segment_order, segment_type, name, duration_minutes, hr_min_percent, hr_max_percent, power_min_percent, power_max_percent, rpe_min, rpe_max, repetitions, instructions);

-- Sample Workout 4: Sprint Power Development
WITH sprint_workout AS (
  INSERT INTO workout_library (
    name, 
    description, 
    training_type, 
    primary_control_parameter,
    secondary_control_parameter,
    estimated_duration_minutes,
    difficulty_level,
    tags,
    is_public
  ) VALUES (
    'Neuromuscular Sprint Power - 6x15sec',
    'Short explosive efforts to develop neuromuscular power and sprint capacity. Perfect for developing your finishing kick.',
    'sprint',
    'power',
    'cadence',
    45,
    8,
    ARRAY['sprint', 'neuromuscular', 'power', 'explosive', 'advanced'],
    true
  ) RETURNING id
)

INSERT INTO workout_segments (
  workout_library_id,
  segment_order,
  segment_type,
  name,
  duration_minutes,
  hr_min_percent,
  hr_max_percent,
  power_min_percent,
  power_max_percent,
  cadence_min,
  cadence_max,
  rpe_min,
  rpe_max,
  repetitions,
  rest_duration_minutes,
  rest_type,
  instructions
) 
SELECT 
  sw.id,
  segment_data.*
FROM sprint_workout sw,
(VALUES 
  (1, 'warmup', 'Thorough Warm Up', 15, 60, 80, 50, 75, 85, 95, 3, 5, 1, NULL, 'active', 'Extended warm-up with progressive efforts. Include several 10-second accelerations to prepare for sprints.'),
  (2, 'main', '6x 15sec All-Out Sprints', NULL, NULL, NULL, 150, 200, 100, 130, 9, 10, 6, 3, 'easy_spin', 'Maximum effort for 15 seconds! Focus on explosive power and high cadence. Give everything you have.'),
  (3, 'cooldown', 'Recovery Spin', 15, 50, 65, 45, 60, 80, 90, 2, 3, 1, NULL, 'active', 'Easy spinning to recover and clear lactate. Well done on those explosive efforts!')
) AS segment_data(segment_order, segment_type, name, duration_minutes, hr_min_percent, hr_max_percent, power_min_percent, power_max_percent, cadence_min, cadence_max, rpe_min, rpe_max, repetitions, rest_duration_minutes, rest_type, instructions);

-- Sample Workout 5: Recovery Ride
WITH recovery_workout AS (
  INSERT INTO workout_library (
    name, 
    description, 
    training_type, 
    primary_control_parameter,
    estimated_duration_minutes,
    difficulty_level,
    tags,
    is_public
  ) VALUES (
    'Active Recovery - Easy Spin',
    'Gentle active recovery session to promote blood flow and aid recovery between hard training sessions.',
    'recovery',
    'rpe',
    30,
    2,
    ARRAY['recovery', 'easy', 'regeneration', 'active-recovery', 'all-levels'],
    true
  ) RETURNING id
)

INSERT INTO workout_segments (
  workout_library_id,
  segment_order,
  segment_type,
  name,
  duration_minutes,
  hr_max_percent,
  power_max_percent,
  rpe_min,
  rpe_max,
  repetitions,
  instructions
) 
SELECT 
  rw.id,
  segment_data.*
FROM recovery_workout rw,
(VALUES 
  (1, 'main', 'Easy Recovery Spin', 30, 65, 60, 1, 3, 1, 'Very easy spinning to promote recovery. Should feel refreshing, not tiring. Focus on smooth pedaling and relaxation.')
) AS segment_data(segment_order, segment_type, name, duration_minutes, hr_max_percent, power_max_percent, rpe_min, rpe_max, repetitions, instructions);

-- Link workouts to appropriate categories
-- Threshold workout
INSERT INTO workout_library_categories (workout_library_id, category_id)
SELECT wl.id, wc.id 
FROM workout_library wl, workout_categories wc 
WHERE wl.name = 'Threshold Development - 3x7min' 
AND wc.name IN ('Threshold', 'Time Trial');

-- VO2 Max workout
INSERT INTO workout_library_categories (workout_library_id, category_id)
SELECT wl.id, wc.id 
FROM workout_library wl, workout_categories wc 
WHERE wl.name = 'VO2 Max Crushers - 5x3min' 
AND wc.name = 'VO2 Max';

-- Endurance workout
INSERT INTO workout_library_categories (workout_library_id, category_id)
SELECT wl.id, wc.id 
FROM workout_library wl, workout_categories wc 
WHERE wl.name = 'Aerobic Base Builder - 90min Zone 2' 
AND wc.name = 'Endurance';

-- Sprint workout
INSERT INTO workout_library_categories (workout_library_id, category_id)
SELECT wl.id, wc.id 
FROM workout_library wl, workout_categories wc 
WHERE wl.name = 'Neuromuscular Sprint Power - 6x15sec' 
AND wc.name = 'Sprint';

-- Recovery workout
INSERT INTO workout_library_categories (workout_library_id, category_id)
SELECT wl.id, wc.id 
FROM workout_library wl, workout_categories wc 
WHERE wl.name = 'Active Recovery - Easy Spin' 
AND wc.name = 'Recovery';

-- Display summary of created workouts
SELECT 
  wl.name,
  wl.training_type,
  wl.estimated_duration_minutes,
  wl.difficulty_level,
  array_agg(wc.name) as categories,
  count(ws.id) as segment_count
FROM workout_library wl
LEFT JOIN workout_library_categories wlc ON wl.id = wlc.workout_library_id
LEFT JOIN workout_categories wc ON wlc.category_id = wc.id
LEFT JOIN workout_segments ws ON wl.id = ws.workout_library_id
WHERE wl.name IN (
  'Threshold Development - 3x7min',
  'VO2 Max Crushers - 5x3min', 
  'Aerobic Base Builder - 90min Zone 2',
  'Neuromuscular Sprint Power - 6x15sec',
  'Active Recovery - Easy Spin'
)
GROUP BY wl.id, wl.name, wl.training_type, wl.estimated_duration_minutes, wl.difficulty_level
ORDER BY wl.difficulty_level;
