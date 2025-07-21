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
  unlocked_at: Date;
  is_featured: boolean;
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
