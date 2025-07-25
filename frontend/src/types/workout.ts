// Workout Library Types for Frontend
export interface WorkoutTemplate {
  id: number;
  name: string;
  description: string;
  training_type: string;
  primary_control_parameter: string;
  secondary_control_parameter?: string;
  estimated_duration_minutes: number;
  difficulty_level: number;
  tags: string[];
  created_by?: number;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  creator_username?: string;
  creator_first_name?: string;
  creator_last_name?: string;
  categories: string[];
  segment_count: string;
}

export interface WorkoutAssignment {
  id: number;
  workout_library_id: number;
  assigned_to_user_id: number;
  assigned_by_user_id: number;
  scheduled_date: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'skipped' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  intensity_adjustment: number;
  duration_adjustment: number;
  custom_notes?: string;
  completion_date?: string;
  actual_duration_minutes?: number;
  completion_notes?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data from workout_library
  workout_name: string;
  workout_description: string;
  workout_training_type: string;
  workout_duration: number;
  workout_difficulty: number;
  
  // Joined data from users
  athlete_username: string;
  athlete_first_name: string;
  athlete_last_name: string;
  coach_username: string;
  coach_first_name: string;
  coach_last_name: string;
}

export interface WorkoutSegment {
  id: number;
  workout_library_id: number;
  segment_order: number;
  segment_type: 'warmup' | 'work' | 'rest' | 'cooldown' | 'ramp' | 'test';
  duration_minutes: number;
  target_power_watts?: number;
  target_power_percentage?: number;
  target_hr_bpm?: number;
  target_hr_percentage?: number;
  target_cadence_rpm?: number;
  target_rpe?: number;
  instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkoutAssignmentRequest {
  workout_library_id: number;
  assigned_to_user_id: number;
  assigned_by_user_id: number;
  scheduled_date: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  intensity_adjustment?: number;
  duration_adjustment?: number;
  custom_notes?: string;
}

export interface WorkoutAssignmentFilters {
  assigned_to_user_id?: number;
  assigned_by_user_id?: number;
  status?: string;
  priority?: string;
  training_type?: string;
  scheduled_date_from?: string;
  scheduled_date_to?: string;
  difficulty_min?: number;
  difficulty_max?: number;
}

// Calendar view types
export interface CalendarWorkout {
  id: number;
  assignment_id: number;
  date: string;
  name: string;
  type: string;
  duration: number;
  difficulty: number;
  status: 'assigned' | 'in_progress' | 'completed' | 'skipped' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
}

export interface MonthlyPlan {
  year: number;
  month: number;
  workouts: CalendarWorkout[];
}

export interface WeeklyPlan {
  weekStart: string;
  weekEnd: string;
  workouts: CalendarWorkout[];
}
