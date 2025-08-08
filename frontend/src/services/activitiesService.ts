/**
 * 🦈 Activities Service - School of Sharks AI Platform
 * Manages communication with activities API endpoints
 */

// Activity type definition (matching backend types)
export interface PowerZoneTimes {
  [zone: string]: number;
}

export interface HeartRateZoneTimes {
  [zone: string]: number;
}

export interface Achievements {
  [achievement: string]: boolean | string;
}

export interface Activity {
  id: number;
  intervals_icu_id: string;
  user_id: number;
  external_id?: string;
  name: string;
  description?: string;
  activity_type: string;
  start_date_local: string;
  start_date_utc: string;
  timezone?: string;
  elapsed_time?: number;
  moving_time?: number;
  recording_time?: number;
  distance?: number;
  average_speed?: number;
  max_speed?: number;
  has_power_data: boolean;
  device_watts?: number;
  average_watts?: number;
  weighted_avg_watts?: number;
  max_watts?: number;
  ftp_watts?: number;
  normalized_power?: number;
  variability_index?: number;
  has_heartrate: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
  athlete_max_hr?: number;
  lthr?: number;
  resting_hr?: number;
  average_cadence?: number;
  training_load?: number;
  intensity_factor?: number;
  training_stress_score?: number;
  power_load?: number;
  hr_load?: number;
  icu_intensity?: number;
  polarization_index?: number;
  calories?: number;
  carbs_used?: number;
  carbs_ingested?: number;
  joules?: number;
  joules_above_ftp?: number;
  average_temp?: number;
  min_temp?: number;
  max_temp?: number;
  elevation_gain?: number;
  elevation_loss?: number;
  average_altitude?: number;
  power_zone_times?: PowerZoneTimes;
  hr_zone_times?: HeartRateZoneTimes;
  device_name?: string;
  power_meter?: string;
  power_meter_serial?: string;
  power_meter_battery?: number;
  file_type?: string;
  trainer?: boolean;
  commute?: boolean;
  race?: boolean;
  perceived_exertion?: number;
  session_rpe?: number;
  feel?: number;
  compliance?: number;
  coach_tick?: boolean;
  achievements?: Achievements;
  interval_summary?: string;
  strava_id?: string;
  source: string;
  analyzed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ActivityFilters {
  activity_type?: string;
  start_date_from?: string;
  start_date_to?: string;
  has_power_data?: boolean;
  trainer?: boolean;
  source?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
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

export interface SyncResponse {
  success: boolean;
  message: string;
  stats: {
    total_fetched: number;
    added: number;
    skipped: number;
    errors: number;
  };
  errors?: string[];
}

class ActivitiesService {
  private baseUrl = '/api/activities';

  /**
   * Get activities for a specific user with optional filtering
   */
  async getActivities(userId: number, filters?: ActivityFilters): Promise<ActivityListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });
      }

      const url = `${this.baseUrl}/user/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('🦈 Error fetching activities:', error);
      throw error;
    }
  }

  /**
   * Get activities for a specific date range (useful for calendar views)
   */
  async getActivitiesForDateRange(
    userId: number, 
    startDate: string, 
    endDate: string,
    additionalFilters?: Omit<ActivityFilters, 'start_date_from' | 'start_date_to'>
  ): Promise<Activity[]> {
    try {
      const filters: ActivityFilters = {
        start_date_from: startDate,
        start_date_to: endDate,
        limit: 1000, // Get all activities in the range
        ...additionalFilters
      };

      const response = await this.getActivities(userId, filters);
      return response.activities;
    } catch (error) {
      console.error('🦈 Error fetching activities for date range:', error);
      return [];
    }
  }

  /**
   * Get activities for a specific month (for calendar month view)
   */
  async getActivitiesForMonth(userId: number, year: number, month: number): Promise<Activity[]> {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    return this.getActivitiesForDateRange(userId, startDate, endDate);
  }

  /**
   * Get activities for a specific week (for calendar week view)
   */
  async getActivitiesForWeek(userId: number, weekStart: string): Promise<Activity[]> {
    const weekStartDate = new Date(weekStart);
    const startDate = weekStart;
    const endDate = new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return this.getActivitiesForDateRange(userId, startDate, endDate);
  }

  /**
   * Get a specific activity by ID
   */
  async getActivity(activityId: number): Promise<Activity> {
    try {
      const response = await fetch(`${this.baseUrl}/${activityId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch activity: ${response.statusText}`);
      }

      const data = await response.json();
      return data.activity;
    } catch (error) {
      console.error('🦈 Error fetching activity details:', error);
      throw error;
    }
  }

  /**
   * Sync activities from intervals.icu for a specific athlete
   */
  async syncFromIntervalsIcu(
    athleteId: string, 
    dateRange?: { oldest?: string; newest?: string }
  ): Promise<SyncResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/sync-intervals-icu/${athleteId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dateRange }),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync activities: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('🦈 Error syncing activities from intervals.icu:', error);
      throw error;
    }
  }

  /**
   * Group activities by date for calendar display
   */
  groupActivitiesByDate(activities: Activity[]): Record<string, Activity[]> {
    const grouped: Record<string, Activity[]> = {};
    
    activities.forEach(activity => {
      const date = activity.start_date_local.split('T')[0]; // Get YYYY-MM-DD format
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(activity);
    });

    return grouped;
  }

  /**
   * Format activity duration for display
   */
  formatDuration(seconds?: number): string {
    if (!seconds) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}h`;
    }
    return `${minutes}min`;
  }

  /**
   * Format distance for display
   */
  formatDistance(meters?: number): string {
    if (!meters) return '0km';
    
    const km = meters / 1000;
    return `${km.toFixed(1)}km`;
  }

  /**
   * Get activity type icon/emoji
   */
  getActivityIcon(activityType: string): string {
    const icons: Record<string, string> = {
      'Ride': '🚴',
      'Cycling': '🚴',
      'Run': '🏃',
      'Running': '🏃',
      'Swim': '🏊',
      'Swimming': '🏊',
      'Walk': '🚶',
      'Walking': '🚶',
      'Workout': '💪',
      'CrossTraining': '🏋️',
      'default': '🦈'
    };

    return icons[activityType] || icons.default;
  }

  /**
   * Get activity type color for calendar display
   */
  getActivityColor(activityType: string): string {
    const colors: Record<string, string> = {
      'Ride': 'bg-blue-500',
      'Cycling': 'bg-blue-500',
      'Run': 'bg-red-500',
      'Running': 'bg-red-500',
      'Swim': 'bg-cyan-500',
      'Swimming': 'bg-cyan-500',
      'Walk': 'bg-green-500',
      'Walking': 'bg-green-500',
      'Workout': 'bg-purple-500',
      'CrossTraining': 'bg-orange-500',
      'default': 'bg-gray-500'
    };

    return colors[activityType] || colors.default;
  }
}

// Export singleton instance
export const activitiesService = new ActivitiesService();
export default activitiesService;
