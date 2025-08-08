// TypeScript interfaces for School of Sharks data models

// 🦈 User Management Interfaces - Apex Cycling Platform
export interface User {
  id: number;
  uuid: string;
  email: string;
  username: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  date_of_birth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  cycling_experience: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  weight_kg?: number;
  height_cm?: number;
  ftp_watts?: number; // Functional Threshold Power
  max_heart_rate?: number;
  country?: string;
  city?: string;
  timezone: string;
  is_active: boolean;
  is_verified: boolean;
  email_verified: boolean;
  subscription_type: 'free' | 'premium' | 'apex_predator';
  privacy_settings: {
    profile_public: boolean;
    stats_public: boolean;
    training_public: boolean;
  };
  notification_preferences: {
    email_workouts: boolean;
    email_achievements: boolean;
    push_notifications: boolean;
  };
  total_sessions: number;
  total_distance_km: number;
  total_training_hours: number;
  apex_score: number; // AI-calculated performance score (0-10)
  last_login_at?: Date;
  login_attempts: number;
  locked_until?: Date;
  password_reset_token?: string;
  password_reset_expires?: Date;
  verification_token?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date; // Soft delete
  avatar_url?: string;
  bio?: string;
  intervals_icu_id?: string; // intervals.icu account ID for 3rd party integration
  is_coach: boolean; // Whether user has coach privileges
  social_links: Record<string, string>;
  coaching_preferences: {
    intensity: 'low' | 'moderate' | 'high' | 'extreme';
    focus_areas: string[];
    ai_suggestions: boolean;
  };
}

// 🏆 Extended User Profile for Advanced Cyclists
export interface UserProfile {
  id: number;
  user_id: number;
  vo2_max?: number; // Oxygen uptake measurement
  lactate_threshold_watts?: number;
  preferred_cadence?: number; // RPM
  bike_fit_data?: Record<string, any>; // Bike geometry and fit measurements
  primary_bike?: Record<string, any>; // Bike specifications
  equipment_list: Record<string, any>[]; // Array of cycling equipment
  current_goals: Record<string, any>[];
  achievements: Record<string, any>[];
  personal_records: Record<string, any>;
  training_zones?: Record<string, any>; // Heart rate and power zones
  seasonal_goals: Record<string, any>;
  coach_notes?: string;
  injury_history: Record<string, any>[];
  health_conditions: Record<string, any>[];
  preferred_metrics: string[];
  dashboard_layout: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

// 🔐 Authentication & Registration Interfaces
export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: User['gender'];
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  weight?: number;
  height?: number;
  country?: string;
  city?: string;
  
  // Database field aliases for compatibility
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  cycling_experience?: 'beginner' | 'intermediate' | 'advanced';
  weight_kg?: number;
  height_cm?: number;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  uuid: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  fitnessLevel?: string;
  weight?: number;
  height?: number;
  avatarUrl?: string;
  createdAt: Date;
  apex_score?: number; // AI-calculated performance score
  is_coach: boolean; // Whether user has coach privileges
}

export interface UserUpdateRequest {
  first_name?: string;
  last_name?: string;
  weight_kg?: number;
  height_cm?: number;
  ftp_watts?: number;
  max_heart_rate?: number;
  country?: string;
  city?: string;
  bio?: string;
  privacy_settings?: User['privacy_settings'];
  notification_preferences?: User['notification_preferences'];
  coaching_preferences?: User['coaching_preferences'];
}

// 🔒 Security Interfaces
export interface JWTPayload {
  user_id: number;
  email: string;
  subscription_type: string;
  iat: number;
  exp: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  new_password: string;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface CyclingSession {
  id: number;
  userId: number;
  sessionName?: string;
  distance?: number; // in km
  duration?: number; // in seconds
  averageSpeed?: number; // in km/h
  maxSpeed?: number; // in km/h
  caloriesBurned?: number;
  elevationGain?: number; // in meters
  heartRateAvg?: number;
  heartRateMax?: number;
  powerAvg?: number; // in watts
  powerMax?: number; // in watts
  sessionDate: Date;
  routeData?: RouteData; // GPS coordinates and route information
  createdAt: Date;
}

export interface RouteData {
  coordinates: Array<{
    latitude: number;
    longitude: number;
    elevation?: number;
    timestamp: Date;
  }>;
  startLocation?: string;
  endLocation?: string;
  mapUrl?: string;
}

export interface TrainingProgram {
  id: number;
  name: string;
  description?: string;
  difficultyLevel: 'easy' | 'intermediate' | 'advanced' | 'expert';
  durationWeeks?: number;
  sessionsPerWeek?: number;
  focusArea?: string; // endurance, speed, strength, recovery
  aiModelVersion?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserTrainingAssignment {
  id: number;
  userId: number;
  programId: number;
  startDate?: Date;
  targetEndDate?: Date;
  actualEndDate?: Date;
  progressPercentage: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface CoachingSession {
  id: number;
  userId: number;
  sessionType: 'workout_guidance' | 'performance_analysis' | 'goal_setting';
  aiRecommendations?: AIRecommendations;
  userFeedback?: UserFeedback;
  sessionDuration?: number; // in seconds
  createdAt: Date;
}

export interface AIRecommendations {
  nextWorkout?: string;
  focusArea?: string;
  restDays?: number;
  nutritionTips?: string[];
  motivationalMessage?: string;
  adjustments?: {
    intensity?: number; // percentage adjustment
    duration?: number; // time adjustment in minutes
    difficulty?: string;
  };
}

export interface UserFeedback {
  rating?: number; // 1-5 stars
  comments?: string;
  followedRecommendations?: boolean;
  difficultyRating?: number; // 1-10 scale
  enjoymentRating?: number; // 1-10 scale
}

export interface PerformanceAnalytics {
  id: number;
  userId: number;
  analysisPeriod: 'weekly' | 'monthly' | 'yearly';
  totalDistance?: number;
  totalDuration?: number;
  averageSpeed?: number;
  caloriesBurned?: number;
  sessionsCount?: number;
  improvementScore?: number; // AI-calculated improvement metric
  analysisDate: Date;
  createdAt: Date;
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Training session types
export interface WorkoutSession {
  warmUp: WorkoutPhase;
  mainSet: WorkoutPhase[];
  coolDown: WorkoutPhase;
  totalDuration: number;
  targetIntensity: 'low' | 'moderate' | 'high' | 'maximum';
}

export interface WorkoutPhase {
  name: string;
  description: string;
  duration: number; // in minutes
  intensity: number; // percentage of max heart rate
  instructions: string[];
}

// Real-time data types for live sessions
export interface LiveSessionData {
  timestamp: Date;
  speed: number;
  heartRate?: number;
  power?: number;
  cadence?: number;
  position?: {
    latitude: number;
    longitude: number;
  };
}

// 🦈 User Database Model Class
export interface UserModelInterface {
  createUser(userData: CreateUserRequest): Promise<UserResponse>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<UserResponse | null>;
  findByUsername(username: string): Promise<User | null>;
  updateUser(id: number, userData: UserUpdateRequest): Promise<UserResponse>;
  updateApexScore(userId: number, newScore: number): Promise<void>;
  updateTrainingMetrics(userId: number, sessions: number, distance: number, hours: number): Promise<void>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  verifyEmail(userId: number): Promise<void>;
  updateLastLogin(userId: number): Promise<void>;
  getApexLeaderboard(limit?: number): Promise<UserResponse[]>;
  softDeleteUser(userId: number): Promise<void>;
  updatePassword(userId: number, newPasswordHash: string): Promise<void>;
  setPasswordResetToken(email: string, token: string, expires: Date): Promise<void>;
  validatePasswordResetToken(token: string): Promise<User | null>;
  incrementLoginAttempts(email: string): Promise<void>;
  resetLoginAttempts(email: string): Promise<void>;
  lockAccount(email: string, lockUntil: Date): Promise<void>;
}

// 🏅 User Statistics and Analytics
export interface UserStats {
  user_id: number;
  total_sessions: number;
  total_distance_km: number;
  total_training_hours: number;
  avg_session_duration: number;
  avg_speed_kmh: number;
  avg_power_watts?: number;
  avg_heart_rate?: number;
  best_ftp?: number;
  apex_score: number;
  rank_overall?: number;
  rank_by_experience?: number;
  improvement_trend: 'improving' | 'stable' | 'declining';
  last_activity_date?: Date;
}

// 🎯 User Goals and Achievements
export interface UserGoal {
  id: number;
  user_id: number;
  goal_type: 'distance' | 'time' | 'power' | 'weight_loss' | 'event_preparation' | 'custom';
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  unit: string;
  target_date?: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  created_at: Date;
  completed_at?: Date;
}

export interface UserAchievement {
  id: number;
  user_id: number;
  achievement_type: 'distance_milestone' | 'consistency' | 'power_improvement' | 'speed_record' | 'challenge_completion';
  title: string;
  description: string;
  icon_url?: string;
  badge_color: string;
  points_awarded: number;
  earned_at: Date;
  is_featured: boolean;
}

// =================================================================
// 🚴‍♂️ ACTIVITIES & TRAINING DATA TYPES - SCHOOL OF SHARKS ⚡
// =================================================================

// Core activity interface matching our database table
export interface Activity {
  id: number;
  intervals_icu_id?: string; // intervals.icu activity ID (e.g., "i90576713")
  user_id: number;
  external_id?: string; // External ID from other platforms
  
  // Basic activity information
  name: string;
  description?: string;
  activity_type: string; // Ride, Run, etc.
  start_date_local: Date;
  start_date_utc: Date;
  timezone?: string;
  
  // Duration and distance
  elapsed_time: number; // Total elapsed time in seconds
  moving_time: number; // Active moving time in seconds
  recording_time?: number; // Actual recording time from device
  distance?: number; // Distance in meters
  
  // Speed metrics
  average_speed?: number; // m/s
  max_speed?: number; // m/s
  
  // Power metrics (watts)
  has_power_data: boolean;
  device_watts: boolean; // True if power from power meter
  average_watts?: number;
  weighted_avg_watts?: number; // Normalized power
  max_watts?: number;
  ftp_watts?: number; // FTP at time of activity
  normalized_power?: number;
  variability_index?: number; // Power variability
  
  // Heart rate metrics (bpm)
  has_heartrate: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
  athlete_max_hr?: number; // Athlete's max HR setting
  lthr?: number; // Lactate threshold heart rate
  resting_hr?: number;
  
  // Cadence metrics (rpm)
  average_cadence?: number;
  
  // Training load and intensity
  training_load?: number; // TSS equivalent
  intensity_factor?: number; // IF
  training_stress_score?: number; // TSS
  power_load?: number; // Power-based training load
  hr_load?: number; // HR-based training load
  icu_intensity?: number; // intervals.icu intensity score
  polarization_index?: number; // Training polarization
  
  // Energy and physiological
  calories?: number;
  carbs_used?: number; // Estimated carbs burned
  carbs_ingested?: number; // Carbs consumed during activity
  joules?: number; // Total energy in joules
  joules_above_ftp?: number; // Energy above FTP
  
  // Environmental data
  average_temp?: number; // Celsius
  min_temp?: number;
  max_temp?: number;
  elevation_gain?: number; // meters
  elevation_loss?: number; // meters
  average_altitude?: number; // meters
  
  // Power zones time in zone (seconds) - stored as JSON
  power_zone_times?: Record<string, number>; // {"Z1": 473, "Z2": 539, ...}
  hr_zone_times?: number[]; // [1247, 357, 54, 34, 0, 0, 0]
  
  // Device and technical info
  device_name?: string;
  power_meter?: string;
  power_meter_serial?: string;
  power_meter_battery?: string;
  file_type?: string; // fit, tcx, gpx, etc.
  
  // Training context
  trainer: boolean; // Indoor trainer session
  commute: boolean;
  race: boolean;
  perceived_exertion?: number; // RPE 1-10
  session_rpe?: number; // Session RPE
  feel?: number; // How the athlete felt (1-5 scale)
  
  // Compliance and coaching
  compliance?: number; // Compliance percentage if planned workout
  coach_tick: boolean; // Coach approval
  workout_assignment_id?: number; // Link to assigned workout if applicable
  
  // Analysis and achievements
  achievements?: any[]; // intervals.icu achievements
  interval_summary?: string[]; // Array of interval summaries
  
  // External platform integration
  strava_id?: string;
  source: string; // WAHOO, GARMIN, STRAVA, etc.
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  synced_at?: Date; // When synced from external source
  analyzed_at?: Date; // When analysis completed
}

// intervals.icu API response types
export interface IntervalsIcuActivity {
  id: string;
  start_date_local: string;
  type: string;
  icu_ignore_time: boolean;
  icu_pm_cp?: number;
  icu_pm_w_prime?: number;
  icu_pm_p_max?: number;
  icu_pm_ftp?: number;
  icu_pm_ftp_secs?: number;
  icu_pm_ftp_watts?: number;
  icu_ignore_power: boolean;
  icu_rolling_ftp?: number;
  icu_training_load?: number;
  icu_atl?: number;
  icu_ctl?: number;
  icu_ftp?: number;
  icu_joules?: number;
  icu_recording_time?: number;
  elapsed_time: number;
  icu_weighted_avg_watts?: number;
  carbs_used?: number;
  name: string;
  description?: string;
  start_date: string;
  distance?: number;
  icu_distance?: number;
  moving_time: number;
  coasting_time?: number;
  total_elevation_gain?: number;
  total_elevation_loss?: number;
  timezone?: string;
  trainer?: boolean;
  sub_type?: string;
  commute: boolean;
  race: boolean;
  max_speed?: number;
  average_speed?: number;
  device_watts: boolean;
  has_heartrate: boolean;
  max_heartrate?: number;
  average_heartrate?: number;
  average_cadence?: number;
  calories?: number;
  average_temp?: number;
  min_temp?: number;
  max_temp?: number;
  avg_lr_balance?: number;
  perceived_exertion?: number;
  device_name?: string;
  power_meter?: string;
  power_meter_serial?: string;
  power_meter_battery?: string;
  external_id?: string;
  file_type?: string;
  icu_athlete_id: string;
  created: string;
  icu_sync_date?: string;
  analyzed?: string;
  icu_hr_zones?: number[];
  lthr?: number;
  icu_resting_hr?: number;
  icu_weight?: number;
  icu_power_zones?: number[];
  icu_sweet_spot_min?: number;
  icu_sweet_spot_max?: number;
  trimp?: number;
  icu_ignore_hr: boolean;
  ignore_velocity: boolean;
  ignore_pace: boolean;
  icu_training_load_data?: number;
  interval_summary?: string[];
  stream_types?: string[];
  has_weather: boolean;
  has_segments: boolean;
  power_field_names?: string[];
  power_field?: string;
  icu_zone_times?: Array<{
    id: string;
    secs: number;
  }>;
  icu_hr_zone_times?: number[];
  polarization_index?: number;
  icu_achievements?: Array<{
    id: string;
    type: string;
    message?: string;
    watts?: number;
    secs?: number;
    value?: number;
    distance?: number;
    pace?: number;
    point?: {
      start_index: number;
      end_index: number;
      secs: number;
      value: number;
    };
  }>;
  icu_intervals_edited?: string;
  lock_intervals?: boolean;
  icu_lap_count?: number;
  icu_joules_above_ftp?: number;
  icu_max_wbal_depletion?: number;
  icu_hrr?: {
    start_index: number;
    end_index: number;
    start_time: number;
    end_time: number;
    start_bpm: number;
    end_bpm: number;
    average_watts?: number;
    hrr: number;
  };
  icu_sync_error?: string;
  icu_color?: string;
  icu_power_hr_z2?: number;
  icu_power_hr_z2_mins?: number;
  icu_cadence_z2?: number;
  icu_rpe?: number;
  feel?: number;
  kg_lifted?: number;
  decoupling?: number;
  icu_median_time_delta?: number;
  p30s_exponent?: number;
  workout_shift_secs?: number;
  strava_id?: string;
  lengths?: number;
  pool_length?: number;
  compliance?: number;
  coach_tick?: boolean;
  source?: string;
  oauth_client_id?: string;
  oauth_client_name?: string;
  average_altitude?: number;
  min_altitude?: number;
  max_altitude?: number;
  power_load?: number;
  hr_load?: number;
  pace_load?: number;
  hr_load_type?: string;
  pace_load_type?: string;
  tags?: string[];
  attachments?: any[];
  recording_stops?: any[];
  carbs_ingested?: number;
  route_id?: string;
  pace?: number;
  athlete_max_hr?: number;
  group?: string;
  icu_intensity?: number;
  icu_efficiency_factor?: number;
  icu_power_hr?: number;
  session_rpe?: number;
  average_stride?: number;
  icu_average_watts?: number;
  icu_variability_index?: number;
  strain_score?: number;
}

// Request types for activity operations
export interface CreateActivityRequest {
  intervals_icu_id?: string;
  user_id: number;
  external_id?: string;
  name: string;
  description?: string;
  activity_type: string;
  start_date_local: string;
  start_date_utc: string;
  elapsed_time: number;
  moving_time: number;
  distance?: number;
  average_speed?: number;
  max_speed?: number;
  has_power_data?: boolean;
  device_watts?: boolean;
  average_watts?: number;
  weighted_avg_watts?: number;
  max_watts?: number;
  ftp_watts?: number;
  has_heartrate?: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
  average_cadence?: number;
  training_load?: number;
  intensity_factor?: number;
  calories?: number;
  carbs_used?: number;
  average_temp?: number;
  elevation_gain?: number;
  elevation_loss?: number;
  power_zone_times?: Record<string, number>;
  hr_zone_times?: number[];
  device_name?: string;
  power_meter?: string;
  trainer?: boolean;
  commute?: boolean;
  race?: boolean;
  perceived_exertion?: number;
  session_rpe?: number;
  feel?: number;
  compliance?: number;
  workout_assignment_id?: number;
  achievements?: any[];
  interval_summary?: string[];
  strava_id?: string;
  source?: string;
}

export interface ActivityFilters {
  user_id?: number;
  activity_type?: string;
  start_date_from?: string;
  start_date_to?: string;
  has_power_data?: boolean;
  has_heartrate?: boolean;
  min_distance?: number;
  max_distance?: number;
  min_duration?: number;
  max_duration?: number;
  trainer?: boolean;
  source?: string;
  page?: number;
  limit?: number;
  sort_by?: 'start_date_local' | 'distance' | 'moving_time' | 'training_load';
  sort_order?: 'asc' | 'desc';
}

export interface ActivityListResponse {
  success: boolean;
  activities: Activity[];
  total: number;
  page: number;
  limit: number;
  filters: ActivityFilters;
  message: string;
}

export interface ActivityDetailResponse {
  success: boolean;
  activity: Activity;
  message: string;
}

// 🔔 User Notifications
export interface UserNotification {
  id: number;
  user_id: number;
  notification_type: 'achievement' | 'goal_reminder' | 'workout_suggestion' | 'social' | 'system';
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  is_actionable: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expires_at?: Date;
  created_at: Date;
  read_at?: Date;
}

// 🤝 Social Features
export interface UserFollowing {
  id: number;
  follower_id: number;
  following_id: number;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: Date;
  accepted_at?: Date;
}

export interface UserActivity {
  id: number;
  user_id: number;
  activity_type: 'session_completed' | 'goal_achieved' | 'personal_record' | 'level_up' | 'challenge_joined';
  title: string;
  description?: string;
  data?: Record<string, any>;
  is_public: boolean;
  likes_count: number;
  comments_count: number;
  created_at: Date;
}

// 📊 User Preferences and Settings
export interface UserSettings {
  user_id: number;
  language: string;
  timezone: string;
  units: 'metric' | 'imperial';
  privacy_level: 'public' | 'friends' | 'private';
  email_notifications: boolean;
  push_notifications: boolean;
  workout_reminders: boolean;
  social_sharing: boolean;
  data_sharing: boolean;
  theme: 'light' | 'dark' | 'auto';
  dashboard_widgets: string[];
  updated_at: Date;
}

// 🏋️ Training Preferences
export interface UserTrainingPreferences {
  user_id: number;
  preferred_workout_time: string; // HH:MM format
  workout_duration_preference: number; // minutes
  intensity_preference: 'low' | 'moderate' | 'high' | 'variable';
  workout_types: string[]; // ['endurance', 'interval', 'recovery', 'strength']
  rest_day_preference: number; // days per week
  auto_adjust_difficulty: boolean;
  coaching_style: 'encouraging' | 'challenging' | 'analytical' | 'minimal';
  injury_considerations: string[];
  equipment_available: string[];
  location_preferences: string[]; // ['indoor', 'outdoor', 'road', 'trail']
}

// =================================================================
// 🦈 WORKOUT LIBRARY TYPES - SCHOOL OF SHARKS TRAINING SYSTEM ⚡
// =================================================================

// Core workout library enums and types
export type TrainingType = 
  | 'zone2' 
  | 'tempo' 
  | 'interval' 
  | 'vo2max' 
  | 'recovery' 
  | 'threshold' 
  | 'neuromuscular' 
  | 'endurance' 
  | 'sprint';

export type ControlParameter = 'hr' | 'power' | 'cadence' | 'rpe';

export type SegmentType = 
  | 'warmup' 
  | 'main' 
  | 'interval' 
  | 'recovery' 
  | 'cooldown' 
  | 'rest' 
  | 'build' 
  | 'test';

export type DurationType = 'time' | 'distance' | 'until_failure' | 'open' | 'laps';

export type RestType = 'active' | 'complete' | 'easy_spin';

export type AssignmentPriority = 'low' | 'normal' | 'high';

export type AssignmentStatus = 'assigned' | 'started' | 'completed' | 'skipped' | 'modified';

// Main workout library interface
export interface WorkoutLibrary {
  id: number;
  name: string;
  description?: string;
  workout_description?: string; // Detailed workout structure in intervals.icu format
  training_type: TrainingType;
  primary_control_parameter: ControlParameter;
  secondary_control_parameter?: ControlParameter;
  estimated_duration_minutes: number;
  difficulty_level?: number; // 1-10 scale
  tags?: string[];
  created_by?: number;
  is_public: boolean;
  is_active: boolean;
  workoutid_icu?: string; // intervals.icu workout ID for linking external workouts
  created_at: string;
  updated_at: string;
  
  // Related data (populated via joins) - Keep for backward compatibility
  segments?: WorkoutSegment[]; // Deprecated: Use workout_description instead
  categories?: WorkoutCategory[];
  creator?: Pick<User, 'id' | 'username' | 'first_name' | 'last_name'>;
}

// Individual workout segment/interval
export interface WorkoutSegment {
  id: number;
  workout_library_id: number;
  segment_order: number;
  segment_type: SegmentType;
  name: string;
  duration_minutes?: number;
  duration_type: DurationType;
  
  // Heart Rate Parameters (percentage-based)
  hr_min_percent?: number;
  hr_max_percent?: number;
  hr_zone?: string;
  
  // Power Parameters
  power_min_percent?: number;
  power_max_percent?: number;
  power_zone?: string;
  power_watts_min?: number;
  power_watts_max?: number;
  
  // Cadence Parameters (RPM)
  cadence_min?: number;
  cadence_max?: number;
  
  // RPE Parameters (1-10 scale)
  rpe_min?: number;
  rpe_max?: number;
  
  // Interval Configuration
  repetitions: number;
  rest_duration_minutes?: number;
  rest_type: RestType;
  
  // Instructions and notes
  instructions?: string;
  coaching_notes?: string;
  
  created_at: string;
}

// Workout categories for organization
export interface WorkoutCategory {
  id: number;
  name: string;
  description?: string;
  color_hex?: string;
  icon_name?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// Workout assignments from coaches to athletes
export interface WorkoutAssignment {
  id: number;
  workout_library_id: number;
  assigned_to_user_id: number;
  assigned_by_user_id: number;
  scheduled_date: string; // Date string
  priority: AssignmentPriority;
  
  // Personalized adjustments
  intensity_adjustment: number; // 0.5 to 2.0 multiplier
  duration_adjustment: number; // 0.5 to 2.0 multiplier
  custom_notes?: string;
  
  // Status tracking
  status: AssignmentStatus;
  completed_at?: string;
  athlete_feedback?: string;
  coach_review?: string;
  
  created_at: string;
  updated_at: string;
  
  // Related data (populated via joins)
  workout?: WorkoutLibrary;
  athlete?: Pick<User, 'id' | 'username' | 'first_name' | 'last_name'>;
  coach?: Pick<User, 'id' | 'username' | 'first_name' | 'last_name'>;
  execution_result?: WorkoutExecutionResult;
}

// Results when athlete completes a workout
export interface WorkoutExecutionResult {
  id: number;
  workout_assignment_id: number;
  cycling_session_id?: number;
  
  // Overall metrics
  actual_duration_minutes: number;
  perceived_exertion: number; // 1-10 scale
  completion_percentage: number; // 0-100%
  
  // Performance metrics
  avg_heart_rate?: number;
  max_heart_rate?: number;
  avg_power?: number;
  max_power?: number;
  avg_cadence?: number;
  normalized_power?: number;
  training_stress_score?: number;
  
  // Segment-specific results (flexible JSONB structure)
  segment_results?: WorkoutSegmentResult[];
  
  // Athlete feedback
  difficulty_rating: number; // 1-10 scale
  enjoyment_rating: number; // 1-10 scale
  athlete_notes?: string;
  
  created_at: string;
}

// Structure for individual segment results within execution
export interface WorkoutSegmentResult {
  segment_id: number;
  segment_order: number;
  completed: boolean;
  actual_duration_minutes?: number;
  avg_heart_rate?: number;
  avg_power?: number;
  avg_cadence?: number;
  perceived_exertion?: number;
  notes?: string;
}

// =================================================================
// DTOs for API requests and responses
// =================================================================

// Creating a new workout in the library
export interface CreateWorkoutLibraryRequest {
  name: string;
  description?: string;
  workout_description?: string; // Detailed workout structure in intervals.icu format
  training_type: TrainingType;
  primary_control_parameter: ControlParameter;
  secondary_control_parameter?: ControlParameter;
  estimated_duration_minutes: number;
  difficulty_level?: number;
  tags?: string[];
  is_public?: boolean;
  workoutid_icu?: string; // intervals.icu workout ID for linking external workouts
  category_ids?: number[];
  segments?: CreateWorkoutSegmentRequest[]; // Deprecated: Use workout_description instead
}

// Creating workout segments
export interface CreateWorkoutSegmentRequest {
  segment_order: number;
  segment_type: SegmentType;
  name: string;
  duration_minutes?: number;
  duration_type?: DurationType;
  
  // Target parameters
  hr_min_percent?: number;
  hr_max_percent?: number;
  hr_zone?: string;
  power_min_percent?: number;
  power_max_percent?: number;
  power_zone?: string;
  power_watts_min?: number;
  power_watts_max?: number;
  cadence_min?: number;
  cadence_max?: number;
  rpe_min?: number;
  rpe_max?: number;
  
  // Interval config
  repetitions?: number;
  rest_duration_minutes?: number;
  rest_type?: RestType;
  
  instructions?: string;
  coaching_notes?: string;
}

// Updating existing workouts
export interface UpdateWorkoutLibraryRequest extends Partial<CreateWorkoutLibraryRequest> {
  id: number;
}

// Assigning workouts to athletes
export interface CreateWorkoutAssignmentRequest {
  workout_library_id: number;
  assigned_to_user_id: number;
  assigned_by_user_id: number; // Coach/user who assigns the workout
  scheduled_date: string;
  priority?: AssignmentPriority;
  intensity_adjustment?: number;
  duration_adjustment?: number;
  custom_notes?: string;
}

// Recording workout completion
export interface CreateWorkoutExecutionRequest {
  workout_assignment_id: number;
  cycling_session_id?: number;
  actual_duration_minutes: number;
  perceived_exertion: number;
  completion_percentage?: number;
  
  // Performance metrics
  avg_heart_rate?: number;
  max_heart_rate?: number;
  avg_power?: number;
  max_power?: number;
  avg_cadence?: number;
  normalized_power?: number;
  training_stress_score?: number;
  
  // Segment results
  segment_results?: WorkoutSegmentResult[];
  
  // Feedback
  difficulty_rating: number;
  enjoyment_rating: number;
  athlete_notes?: string;
}

// Filtering and searching workouts
export interface WorkoutLibraryFilters {
  training_type?: TrainingType | TrainingType[];
  primary_control_parameter?: ControlParameter;
  min_duration?: number;
  max_duration?: number;
  difficulty_level?: number | number[];
  category_ids?: number[];
  tags?: string[];
  search?: string; // Search in name, description
  created_by?: number;
  is_public?: boolean;
  is_active?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'created_at' | 'duration' | 'difficulty';
  sort_order?: 'asc' | 'desc';
}

// API response types
export interface WorkoutLibraryListResponse {
  success: boolean;
  workouts: WorkoutLibrary[];
  total: number;
  page: number;
  limit: number;
  filters?: WorkoutLibraryFilters;
  message?: string;
}

export interface WorkoutLibraryDetailResponse {
  success: boolean;
  workout: WorkoutLibrary & {
    segments: WorkoutSegment[];
    categories: WorkoutCategory[];
    assignments_count?: number;
    avg_completion_rate?: number;
    avg_rating?: number;
  };
  message?: string;
}

export interface WorkoutAssignmentListResponse {
  success: boolean;
  assignments: WorkoutAssignment[];
  total: number;
  page: number;
  limit: number;
  message?: string;
}
