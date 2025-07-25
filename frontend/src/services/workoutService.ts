import { 
  WorkoutAssignment, 
  WorkoutTemplate, 
  WorkoutAssignmentFilters, 
  CreateWorkoutAssignmentRequest,
  CalendarWorkout,
  MonthlyPlan,
  WeeklyPlan
} from '@/types/workout';
import { WorkoutLibraryDetailResponse } from '@/models/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

class WorkoutService {
  private cache = new Map<string, { data: unknown; timestamp: number }>();
  private cacheTimeout = 30000; // 30 seconds cache
  private pendingRequests = new Map<string, Promise<unknown>>();

  private getCacheKey(endpoint: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body || '';
    return `${method}_${endpoint}_${body}`;
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const cacheKey = this.getCacheKey(endpoint, options);
    
    // Only cache GET requests
    if (!options?.method || options.method === 'GET') {
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached && this.isCacheValid(cached.timestamp)) {
        return cached.data as T;
      }

      // Check if request is already pending to prevent duplicate calls
      if (this.pendingRequests.has(cacheKey)) {
        return this.pendingRequests.get(cacheKey) as Promise<T>;
      }
    }

    return this._executeRequest<T>(endpoint, options, cacheKey);
  }

  private async _executeRequest<T>(endpoint: string, options?: RequestInit, cacheKey?: string): Promise<T> {
    if (!cacheKey) {
      cacheKey = this.getCacheKey(endpoint, options);
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const requestPromise = fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      signal: controller.signal,
      ...options,
    }).then(async (response) => {
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`🦈 API Error for ${endpoint}:`, response.status, response.statusText);
        
        // For 500 errors, try to get more error details
        if (response.status === 500) {
          try {
            const errorText = await response.text();
            console.error('🦈 Server error details:', errorText);
          } catch (e) {
            console.error('🦈 Could not read server error details:', e);
          }
        }
        
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    }).catch((error) => {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: Server took too long to respond');
      }
      throw error;
    });

    // Store pending request for GET calls
    if (!options?.method || options.method === 'GET') {
      this.pendingRequests.set(cacheKey!, requestPromise);
    }

    try {
      const data = await requestPromise;
      
      // Only cache GET requests
      if (!options?.method || options.method === 'GET') {
        this.cache.set(cacheKey!, { data, timestamp: Date.now() });
        this.pendingRequests.delete(cacheKey!);
      }
      
      return data;
    } catch (error) {
      // Remove failed request from pending
      if (!options?.method || options.method === 'GET') {
        this.pendingRequests.delete(cacheKey!);
      }
      throw error;
    }
  }

  // Clear all cached data and pending requests
  clearCache(): void {
    console.log('🦈 Clearing workout service cache');
    this.cache.clear();
    this.pendingRequests.clear();
  }  // Get all workout templates
  async getWorkoutTemplates(): Promise<{ workouts: WorkoutTemplate[]; total: number }> {
    return this.fetchApi('/workout-library/templates');
  }

  // Get workout assignments with filters
  async getWorkoutAssignments(filters?: WorkoutAssignmentFilters): Promise<{ assignments: WorkoutAssignment[]; total: number }> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    const endpoint = `/workout-library/assignments${queryString ? `?${queryString}` : ''}`;
    
    return this.fetchApi(endpoint);
  }

  // Get assignments for a specific user
  async getUserAssignments(userId: number, filters?: Omit<WorkoutAssignmentFilters, 'assigned_to_user_id'>): Promise<{ assignments: WorkoutAssignment[]; total: number }> {
    return this.getWorkoutAssignments({
      ...filters,
      assigned_to_user_id: userId,
    });
  }

  // Get workout assignments with date range
  async getAssignmentsByDateRange(userId: number, startDate: string, endDate: string, retryCount = 0): Promise<{assignments: WorkoutAssignment[], total: number}> {
    const maxRetries = 2;
    
    try {
      const response = await this.fetchApi<{assignments: WorkoutAssignment[], total: number}>(`/workout-library/assignments?assigned_to_user_id=${userId}&scheduled_date_from=${startDate}&scheduled_date_to=${endDate}`);
      return response;
    } catch (error) {
      console.error(`🦈 Error fetching assignments (attempt ${retryCount + 1}):`, error);
      
      // Retry on 500 errors or network issues
      if (retryCount < maxRetries && (
        error instanceof Error && (
          error.message.includes('500') || 
          error.message.includes('timeout') ||
          error.message.includes('network')
        )
      )) {
        console.log(`🦈 Retrying in ${(retryCount + 1) * 1000}ms...`);
        await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
        return this.getAssignmentsByDateRange(userId, startDate, endDate, retryCount + 1);
      }
      
      // If all retries failed, return empty result instead of throwing
      console.warn('🦈 All retry attempts failed, returning empty assignments');
      return { assignments: [], total: 0 };
    }
  }

  // Create a new workout assignment
  async createAssignment(assignment: CreateWorkoutAssignmentRequest): Promise<{ assignment_id: number; message: string }> {
    return this.fetchApi('/workout-library/assignments', {
      method: 'POST',
      body: JSON.stringify(assignment),
    });
  }

  // Update assignment status
  async updateAssignmentStatus(
    assignmentId: number, 
    status: 'assigned' | 'in_progress' | 'completed' | 'skipped' | 'cancelled',
    completionNotes?: string
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.fetchApi<{ success: boolean; message: string }>(`/workout-library/assignments/${assignmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ 
        status, 
        completion_notes: completionNotes,
        completion_date: status === 'completed' ? new Date().toISOString() : undefined
      }),
    });
    
    // Clear cache after updating to ensure fresh data
    this.clearCache();
    
    return result;
  }

  // Helper function to convert UTC timestamp to Bangkok timezone date
  private convertToBangkokDate(utcTimestamp: string): string {
    const utcDate = new Date(utcTimestamp);
    // Convert to Bangkok timezone (GMT+7)
    const bangkokDate = new Date(utcDate.getTime() + (7 * 60 * 60 * 1000));
    // Return YYYY-MM-DD format
    return bangkokDate.toISOString().split('T')[0];
  }

  // Helper function to format assignments for calendar view
  private formatAssignmentsForCalendar(assignments: WorkoutAssignment[]): CalendarWorkout[] {
    console.log('🦈 Formatting assignments for calendar:', assignments.length, 'assignments');
    
    const formatted = assignments.map(assignment => {
      const bangkokDate = this.convertToBangkokDate(assignment.scheduled_date);
      console.log('🦈 Assignment:', assignment.workout_name, 'UTC:', assignment.scheduled_date, '→ Bangkok:', bangkokDate);
      
      return {
        id: assignment.workout_library_id,
        assignment_id: assignment.id,
        date: bangkokDate, // Use Bangkok timezone date
        name: assignment.workout_name,
        type: assignment.workout_training_type,
        duration: Math.round(assignment.workout_duration * assignment.duration_adjustment),
        difficulty: assignment.workout_difficulty,
        status: assignment.status,
        priority: assignment.priority,
        notes: assignment.custom_notes,
      };
    });
    
    console.log('🦈 Formatted workouts for calendar:', formatted);
    return formatted;
  }

  // Get monthly workout plan
  async getMonthlyPlan(userId: number, year: number, month: number): Promise<MonthlyPlan> {
    // Calculate start and end dates for the month
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    const { assignments } = await this.getAssignmentsByDateRange(userId, startDate, endDate);
    
    return {
      year,
      month,
      workouts: this.formatAssignmentsForCalendar(assignments),
    };
  }

  // Get weekly workout plan
  async getWeeklyPlan(userId: number, weekStart: Date): Promise<WeeklyPlan> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const startDate = weekStart.toISOString().split('T')[0];
    const endDate = weekEnd.toISOString().split('T')[0];
    
    const { assignments } = await this.getAssignmentsByDateRange(userId, startDate, endDate);
    
    return {
      weekStart: startDate,
      weekEnd: endDate,
      workouts: this.formatAssignmentsForCalendar(assignments),
    };
  }

  // Get workout assignments for a specific date
  async getDayWorkouts(userId: number, date: string): Promise<CalendarWorkout[]> {
    const { assignments } = await this.getAssignmentsByDateRange(userId, date, date);
    return this.formatAssignmentsForCalendar(assignments);
  }

  // Helper function to get week dates
  getWeekDates(date: Date): { start: Date; end: Date; dates: Date[] } {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day; // Adjust to start from Sunday
    start.setDate(diff);
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      dates.push(currentDate);
    }
    
    return { start, end, dates };
  }

  // Get detailed workout information with segments
  async getWorkoutDetails(workoutId: number): Promise<WorkoutLibraryDetailResponse> {
    const response = await this.fetchApi<{ success: boolean; workout: WorkoutLibraryDetailResponse; message: string }>(`/workout-library/templates/${workoutId}`);
    return response.workout;
  }

  // Get workout statistics
  async getWorkoutStats(userId: number, dateFrom?: string, dateTo?: string): Promise<{
    total_assigned: number;
    completed: number;
    in_progress: number;
    completion_rate: number;
    total_training_time: number;
    by_type: Record<string, number>;
  }> {
    const filters: WorkoutAssignmentFilters = { assigned_to_user_id: userId };
    if (dateFrom) filters.scheduled_date_from = dateFrom;
    if (dateTo) filters.scheduled_date_to = dateTo;
    
    const { assignments } = await this.getWorkoutAssignments(filters);
    
    const stats = assignments.reduce((acc, assignment) => {
      acc.total_assigned++;
      
      if (assignment.status === 'completed') {
        acc.completed++;
        acc.total_training_time += assignment.actual_duration_minutes || assignment.workout_duration;
      } else if (assignment.status === 'in_progress') {
        acc.in_progress++;
      }
      
      // Count by training type
      if (!acc.by_type[assignment.workout_training_type]) {
        acc.by_type[assignment.workout_training_type] = 0;
      }
      acc.by_type[assignment.workout_training_type]++;
      
      return acc;
    }, {
      total_assigned: 0,
      completed: 0,
      in_progress: 0,
      total_training_time: 0,
      by_type: {} as Record<string, number>,
    });
    
    return {
      ...stats,
      completion_rate: stats.total_assigned > 0 ? (stats.completed / stats.total_assigned) * 100 : 0,
    };
  }
}

export const workoutService = new WorkoutService();
export default workoutService;
