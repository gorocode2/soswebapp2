// Node.js built-in fetch (available in Node 18+) or use undici for compatibility

export interface IntervalsIcuWorkout {
  category: 'WORKOUT';
  type: string;
  start_date_local: string;
  name: string;
  description: string;
}

export class IntervalsIcuService {
  private readonly baseUrl = 'https://intervals.icu/api/v1';
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.INTERVALS_ICU_API_KEY || '';

    if (!this.apiKey) {
      console.warn('⚠️ Intervals.icu API key not configured. Some features may not work.');
    }
  }

  /**
   * Add a workout to intervals.icu athlete calendar
   */
  async addWorkout(athleteIntervalsIcuId: string, workout: {
    name: string;
    description: string;
    date: string; // YYYY-MM-DD format
    type?: string;
  }): Promise<{ success: boolean; message: string; intervalId?: string }> {
    if (!this.apiKey) {
      return {
        success: false,
        message: 'Intervals.icu API key not configured'
      };
    }

    if (!athleteIntervalsIcuId) {
      return {
        success: false,
        message: 'Athlete does not have intervals.icu ID configured'
      };
    }

    try {
      // Format the date with time
      const workoutDateTime = `${workout.date}T00:00:00`;
      
      // Prepare the workout data
      const workoutData: IntervalsIcuWorkout = {
        category: 'WORKOUT',
        type: workout.type || 'Ride',
        start_date_local: workoutDateTime,
        name: workout.name,
        description: workout.description
      };

      console.log('🦈 Adding workout to intervals.icu:', {
        athlete: athleteIntervalsIcuId,
        date: workout.date,
        name: workout.name,
        apiKeyLength: this.apiKey ? this.apiKey.length : 0,
        authHeader: `Basic ${Buffer.from(`API_KEY:${this.apiKey}`).toString('base64')}`
      });

      // Make API call to intervals.icu
      const response = await fetch(`${this.baseUrl}/athlete/${athleteIntervalsIcuId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`API_KEY:${this.apiKey}`).toString('base64')}`
        },
        body: JSON.stringify(workoutData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🦈 Intervals.icu API error:', response.status, errorText);
        
        return {
          success: false,
          message: `Intervals.icu API error: ${response.status} ${response.statusText}`
        };
      }

      const result = await response.json() as any;
      
      console.log('🦈 Successfully added workout to intervals.icu:', result?.id);
      
      return {
        success: true,
        message: 'Workout successfully added to intervals.icu',
        intervalId: result?.id?.toString()
      };

    } catch (error) {
      console.error('🦈 Error adding workout to intervals.icu:', error);
      
      return {
        success: false,
        message: `Failed to add workout to intervals.icu: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Update intervals.icu workout
   */
  async updateWorkout(athleteIntervalsIcuId: string, intervalId: string, workout: {
    name?: string;
    description?: string;
    date?: string;
    type?: string;
  }): Promise<{ success: boolean; message: string }> {
    if (!this.apiKey) {
      return {
        success: false,
        message: 'Intervals.icu API key not configured'
      };
    }

    if (!athleteIntervalsIcuId) {
      return {
        success: false,
        message: 'Athlete does not have intervals.icu ID configured'
      };
    }

    try {
      const updateData: Partial<IntervalsIcuWorkout> = {};
      
      if (workout.name) updateData.name = workout.name;
      if (workout.description) updateData.description = workout.description;
      if (workout.type) updateData.type = workout.type;
      if (workout.date) updateData.start_date_local = `${workout.date}T00:00:00`;

      const response = await fetch(`${this.baseUrl}/athlete/${athleteIntervalsIcuId}/events/${intervalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`API_KEY:${this.apiKey}`).toString('base64')}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🦈 Intervals.icu update error:', response.status, errorText);
        
        return {
          success: false,
          message: `Failed to update workout on intervals.icu: ${response.status} ${response.statusText}`
        };
      }

      return {
        success: true,
        message: 'Workout successfully updated on intervals.icu'
      };

    } catch (error) {
      console.error('🦈 Error updating workout on intervals.icu:', error);
      
      return {
        success: false,
        message: `Failed to update workout on intervals.icu: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Delete intervals.icu workout
   */
  async deleteWorkout(athleteIntervalsIcuId: string, intervalId: string): Promise<{ success: boolean; message: string }> {
    if (!this.apiKey) {
      return {
        success: false,
        message: 'Intervals.icu API key not configured'
      };
    }

    if (!athleteIntervalsIcuId) {
      return {
        success: false,
        message: 'Athlete does not have intervals.icu ID configured'
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/athlete/${athleteIntervalsIcuId}/events/${intervalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${Buffer.from(`API_KEY:${this.apiKey}`).toString('base64')}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🦈 Intervals.icu delete error:', response.status, errorText);
        
        return {
          success: false,
          message: `Failed to delete workout from intervals.icu: ${response.status} ${response.statusText}`
        };
      }

      return {
        success: true,
        message: 'Workout successfully deleted from intervals.icu'
      };

    } catch (error) {
      console.error('🦈 Error deleting workout from intervals.icu:', error);
      
      return {
        success: false,
        message: `Failed to delete workout from intervals.icu: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get events from intervals.icu for a date range
   */
  async getEvents(athleteIntervalsIcuId: string, oldestDate: string, newestDate: string): Promise<{ success: boolean; events?: any[]; message: string }> {
    if (!this.apiKey) {
      return {
        success: false,
        message: 'Intervals.icu API key not configured'
      };
    }

    if (!athleteIntervalsIcuId) {
      return {
        success: false,
        message: 'Athlete does not have intervals.icu ID configured'
      };
    }

    try {
      const url = `${this.baseUrl}/athlete/${athleteIntervalsIcuId}/events?oldest=${oldestDate}&newest=${newestDate}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Authorization': `Basic ${Buffer.from(`API_KEY:${this.apiKey}`).toString('base64')}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🦈 Intervals.icu get events error:', response.status, errorText);
        
        return {
          success: false,
          message: `Failed to get events from intervals.icu: ${response.status} ${response.statusText}`
        };
      }

      const events = await response.json() as any[];
      
      return {
        success: true,
        events,
        message: 'Events retrieved successfully'
      };

    } catch (error) {
      console.error('🦈 Error getting events from intervals.icu:', error);
      
      return {
        success: false,
        message: `Failed to get events from intervals.icu: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Check if intervals.icu is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const intervalsIcuService = new IntervalsIcuService();
