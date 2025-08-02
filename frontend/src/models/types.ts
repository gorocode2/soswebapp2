// Matches the backend User model
export interface User {
  id: number;
  uuid: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  weight?: string;
  height?: number;
  avatarUrl?: string;
  createdAt: string;
  intervalsIcuId?: string; // intervals.icu account ID for 3rd party integration
}

// For user registration
export type RegisterData = Omit<User, 'id' | 'uuid' | 'createdAt'> & {
  password?: string;
};

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
  creator?: Pick<User, 'id' | 'username' | 'firstName' | 'lastName'>;
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

// Junction table for workout-category relationships
export interface WorkoutLibraryCategory {
  workout_library_id: number;
  category_id: number;
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
  athlete?: Pick<User, 'id' | 'username' | 'firstName' | 'lastName'>;
  coach?: Pick<User, 'id' | 'username' | 'firstName' | 'lastName'>;
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
  workouts: WorkoutLibrary[];
  total: number;
  page: number;
  limit: number;
  filters?: WorkoutLibraryFilters;
}

export interface WorkoutLibraryDetailResponse extends WorkoutLibrary {
  segments: WorkoutSegment[];
  categories: WorkoutCategory[];
  assignments_count?: number; // How many times this workout has been assigned
  avg_completion_rate?: number; // Success rate percentage
  avg_rating?: number; // Average athlete enjoyment rating
}

export interface WorkoutAssignmentListResponse {
  assignments: WorkoutAssignment[];
  total: number;
  page: number;
  limit: number;
}

// Dashboard/analytics types for coaches and athletes
export interface WorkoutAnalytics {
  total_workouts_created?: number;
  total_workouts_assigned?: number;
  total_workouts_completed?: number;
  avg_completion_rate?: number;
  avg_difficulty_rating?: number;
  avg_enjoyment_rating?: number;
  popular_training_types?: Array<{
    training_type: TrainingType;
    count: number;
  }>;
  recent_activity?: Array<{
    type: 'created' | 'assigned' | 'completed';
    workout_name: string;
    user_name?: string;
    date: string;
  }>;
}

export interface AthleteWorkoutDashboard {
  upcoming_workouts: WorkoutAssignment[];
  completed_this_week: number;
  completed_this_month: number;
  current_streak: number; // Consecutive days with completed workouts
  favorite_training_types?: Array<{
    training_type: TrainingType;
    count: number;
  }>;
  recent_results: WorkoutExecutionResult[];
}
