// TypeScript interfaces for School of Sharks data models

export interface User {
  id: number;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  passwordHash: string;
  avatarUrl?: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  weight?: number; // in kg
  height?: number; // in cm
  dateOfBirth?: Date;
  createdAt: Date;
  updatedAt: Date;
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
