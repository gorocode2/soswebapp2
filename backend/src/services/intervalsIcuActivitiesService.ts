import { IntervalsIcuActivity, Activity, CreateActivityRequest } from '../models/types';

interface IntervalsIcuActivitiesResponse {
  success: boolean;
  activities?: IntervalsIcuActivity[];
  message: string;
  count?: number;
}

interface SyncActivitiesResult {
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

class IntervalsIcuActivitiesService {
  private apiKey: string | undefined;
  private baseUrl = 'https://intervals.icu/api/v1';

  constructor() {
    this.apiKey = process.env.INTERVALS_ICU_API_KEY;
  }

  public isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get activities for an athlete from intervals.icu
   */
  public async getActivities(
    athleteId: string, 
    dateRange?: { oldest?: string; newest?: string }
  ): Promise<IntervalsIcuActivitiesResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'intervals.icu API key not configured'
      };
    }

    try {
      const params = new URLSearchParams();
      if (dateRange?.oldest) params.append('oldest', dateRange.oldest);
      if (dateRange?.newest) params.append('newest', dateRange.newest);
      
      const queryString = params.toString();
      const url = `${this.baseUrl}/athlete/${athleteId}/activities${queryString ? `?${queryString}` : ''}`;
      
      console.log('🦈 Fetching activities from intervals.icu:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Authorization': `Basic ${Buffer.from(`API_KEY:${this.apiKey}`).toString('base64')}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ intervals.icu API error:', response.status, errorText);
        return {
          success: false,
          message: `intervals.icu API error: ${response.status} ${response.statusText}`
        };
      }

      const activities = await response.json() as IntervalsIcuActivity[];
      
      console.log(`✅ Successfully fetched ${activities.length} activities from intervals.icu`);
      
      return {
        success: true,
        activities,
        count: activities.length,
        message: `Successfully fetched ${activities.length} activities`
      };

    } catch (error) {
      console.error('❌ Error fetching activities from intervals.icu:', error);
      return {
        success: false,
        message: `Error fetching activities: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Convert intervals.icu activity to our database format
   */
  public mapIntervalsIcuActivity(icuActivity: IntervalsIcuActivity, userId: number): CreateActivityRequest {
    // Parse power zone times
    let powerZoneTimes: Record<string, number> = {};
    if (icuActivity.icu_zone_times) {
      icuActivity.icu_zone_times.forEach(zone => {
        powerZoneTimes[zone.id] = zone.secs;
      });
    }

    // Parse date
    const startDateLocal = new Date(icuActivity.start_date_local);
    const startDateUtc = new Date(icuActivity.start_date);

    return {
      intervals_icu_id: icuActivity.id,
      user_id: userId,
      external_id: icuActivity.external_id,
      name: icuActivity.name || 'Cycling Activity',
      description: icuActivity.description,
      activity_type: icuActivity.type || 'Ride',
      start_date_local: startDateLocal,
      start_date_utc: startDateUtc,
      elapsed_time: icuActivity.elapsed_time,
      moving_time: icuActivity.moving_time,
      distance: icuActivity.distance,
      average_speed: icuActivity.average_speed,
      max_speed: icuActivity.max_speed,
      has_power_data: icuActivity.device_watts || false,
      device_watts: icuActivity.device_watts || false,
      average_watts: icuActivity.icu_average_watts,
      weighted_avg_watts: icuActivity.icu_weighted_avg_watts,
      max_watts: icuActivity.icu_pm_p_max,
      ftp_watts: icuActivity.icu_ftp,
      has_heartrate: icuActivity.has_heartrate || false,
      average_heartrate: icuActivity.average_heartrate,
      max_heartrate: icuActivity.max_heartrate,
      average_cadence: icuActivity.average_cadence,
      training_load: icuActivity.icu_training_load,
      intensity_factor: icuActivity.icu_intensity ? icuActivity.icu_intensity / 100 : undefined,
      calories: icuActivity.calories,
      carbs_used: icuActivity.carbs_used,
      average_temp: icuActivity.average_temp,
      elevation_gain: icuActivity.total_elevation_gain,
      elevation_loss: icuActivity.total_elevation_loss,
      power_zone_times: Object.keys(powerZoneTimes).length > 0 ? powerZoneTimes : undefined,
      hr_zone_times: icuActivity.icu_hr_zone_times,
      device_name: icuActivity.device_name,
      power_meter: icuActivity.power_meter,
      trainer: icuActivity.trainer || false,
      commute: icuActivity.commute || false,
      race: icuActivity.race || false,
      perceived_exertion: icuActivity.perceived_exertion,
      session_rpe: icuActivity.session_rpe,
      feel: icuActivity.feel,
      compliance: icuActivity.compliance,
      achievements: icuActivity.icu_achievements,
      interval_summary: icuActivity.interval_summary,
      strava_id: icuActivity.strava_id,
      source: icuActivity.source || 'INTERVALS_ICU'
    };
  }
}

export const intervalsIcuActivitiesService = new IntervalsIcuActivitiesService();
export default IntervalsIcuActivitiesService;
