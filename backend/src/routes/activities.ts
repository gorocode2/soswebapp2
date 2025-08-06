import { Router, Request, Response } from 'express';
import { db } from '../server';
import { intervalsIcuActivitiesService } from '../services/intervalsIcuActivitiesService';
import { Activity, CreateActivityRequest, ActivityFilters, ActivityListResponse } from '../models/types';

const router = Router();

// =================================================================
// 🦈 ACTIVITIES ENDPOINTS - SCHOOL OF SHARKS ⚡
// =================================================================

// Get activities for a user with filtering
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const filters: ActivityFilters = req.query as any;
    const page = parseInt(String(filters.page || '1')) || 1;
    const limit = parseInt(String(filters.limit || '20')) || 20;
    const offset = (page - 1) * limit;
    
    // Build dynamic WHERE clause
    let whereConditions = ['user_id = $1'];
    let queryParams: any[] = [userId];
    let paramIndex = 2;
    
    if (filters.activity_type) {
      whereConditions.push(`activity_type = $${paramIndex}`);
      queryParams.push(filters.activity_type);
      paramIndex++;
    }
    
    if (filters.start_date_from) {
      whereConditions.push(`start_date_local >= $${paramIndex}`);
      queryParams.push(filters.start_date_from);
      paramIndex++;
    }
    
    if (filters.start_date_to) {
      whereConditions.push(`start_date_local <= $${paramIndex}`);
      queryParams.push(filters.start_date_to);
      paramIndex++;
    }
    
    if (filters.has_power_data !== undefined) {
      whereConditions.push(`has_power_data = $${paramIndex}`);
      queryParams.push(filters.has_power_data);
      paramIndex++;
    }
    
    if (filters.trainer !== undefined) {
      whereConditions.push(`trainer = $${paramIndex}`);
      queryParams.push(filters.trainer);
      paramIndex++;
    }
    
    if (filters.source) {
      whereConditions.push(`source = $${paramIndex}`);
      queryParams.push(filters.source);
      paramIndex++;
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Build ORDER BY clause
    let orderBy = 'start_date_local DESC';
    if (filters.sort_by) {
      const sortOrder = filters.sort_order || 'desc';
      orderBy = `${filters.sort_by} ${sortOrder.toUpperCase()}`;
    }
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM activities WHERE ${whereClause}`;
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);
    
    // Get activities
    const activitiesQuery = `
      SELECT * FROM activities 
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    const activitiesResult = await db.query(activitiesQuery, queryParams);
    
    const response: ActivityListResponse = {
      success: true,
      activities: activitiesResult.rows,
      total,
      page,
      limit,
      filters,
      message: `🦈 Found ${total} activities - dominate your training data! ⚡`
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Sync activities from intervals.icu for a specific athlete
router.post('/sync-intervals-icu/:athleteId', async (req: Request, res: Response) => {
  try {
    const { athleteId } = req.params;
    const { dateRange } = req.body; // Optional: { oldest: 'YYYY-MM-DD', newest: 'YYYY-MM-DD' }
    
    console.log('🦈 Starting activity sync for athlete:', athleteId);
    
    // Get user from our database using intervals.icu ID
    const userResult = await db.query(
      'SELECT id, intervals_icu_id, first_name, last_name FROM users WHERE intervals_icu_id = $1',
      [athleteId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No user found with intervals.icu ID: ${athleteId}`
      });
    }
    
    const user = userResult.rows[0];
    console.log(`🦈 Found user: ${user.first_name} ${user.last_name} (ID: ${user.id})`);
    
    // Fetch activities from intervals.icu
    const icuResult = await intervalsIcuActivitiesService.getActivities(athleteId, dateRange);
    
    if (!icuResult.success || !icuResult.activities) {
      return res.status(500).json({
        success: false,
        message: icuResult.message
      });
    }
    
    const activities = icuResult.activities;
    let addedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];
    
    console.log(`🦈 Processing ${activities.length} activities from intervals.icu`);
    
    for (const icuActivity of activities) {
      try {
        // Check if activity already exists
        const existingActivity = await db.query(
          'SELECT id FROM activities WHERE intervals_icu_id = $1 AND user_id = $2',
          [icuActivity.id, user.id]
        );
        
        if (existingActivity.rows.length > 0) {
          skippedCount++;
          continue;
        }
        
        // Map intervals.icu activity to our format
        const activityData = intervalsIcuActivitiesService.mapIntervalsIcuActivity(icuActivity, user.id);
        
        // Insert activity into database
        const insertResult = await db.query(`
          INSERT INTO activities (
            intervals_icu_id, user_id, external_id, name, description, activity_type,
            start_date_local, start_date_utc, timezone, elapsed_time, moving_time, 
            recording_time, distance, average_speed, max_speed, has_power_data, 
            device_watts, average_watts, weighted_avg_watts, max_watts, ftp_watts,
            normalized_power, variability_index, has_heartrate, average_heartrate,
            max_heartrate, athlete_max_hr, lthr, resting_hr, average_cadence,
            training_load, intensity_factor, training_stress_score, power_load,
            hr_load, icu_intensity, polarization_index, calories, carbs_used,
            carbs_ingested, joules, joules_above_ftp, average_temp, min_temp,
            max_temp, elevation_gain, elevation_loss, average_altitude,
            power_zone_times, hr_zone_times, device_name, power_meter,
            power_meter_serial, power_meter_battery, file_type, trainer,
            commute, race, perceived_exertion, session_rpe, feel, compliance,
            coach_tick, achievements, interval_summary, strava_id, source,
            analyzed_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
            $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
            $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41,
            $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54,
            $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67,
            $68
          ) RETURNING id
        `, [
          activityData.intervals_icu_id,
          activityData.user_id,
          activityData.external_id,
          activityData.name,
          activityData.description,
          activityData.activity_type,
          activityData.start_date_local,
          activityData.start_date_utc,
          icuActivity.timezone,
          activityData.elapsed_time,
          activityData.moving_time,
          icuActivity.icu_recording_time,
          activityData.distance,
          activityData.average_speed,
          activityData.max_speed,
          activityData.has_power_data,
          activityData.device_watts,
          activityData.average_watts,
          activityData.weighted_avg_watts,
          activityData.max_watts,
          activityData.ftp_watts,
          icuActivity.icu_pm_ftp_watts,
          icuActivity.icu_variability_index,
          activityData.has_heartrate,
          activityData.average_heartrate,
          activityData.max_heartrate,
          icuActivity.athlete_max_hr,
          icuActivity.lthr,
          icuActivity.icu_resting_hr,
          activityData.average_cadence,
          activityData.training_load,
          activityData.intensity_factor,
          icuActivity.icu_training_load,
          icuActivity.power_load,
          icuActivity.hr_load,
          icuActivity.icu_intensity,
          icuActivity.polarization_index,
          activityData.calories,
          activityData.carbs_used,
          icuActivity.carbs_ingested,
          icuActivity.icu_joules,
          icuActivity.icu_joules_above_ftp,
          activityData.average_temp,
          icuActivity.min_temp,
          icuActivity.max_temp,
          activityData.elevation_gain,
          activityData.elevation_loss,
          icuActivity.average_altitude,
          JSON.stringify(activityData.power_zone_times),
          JSON.stringify(activityData.hr_zone_times),
          activityData.device_name,
          activityData.power_meter,
          icuActivity.power_meter_serial,
          icuActivity.power_meter_battery,
          icuActivity.file_type,
          activityData.trainer,
          activityData.commute,
          activityData.race,
          activityData.perceived_exertion,
          activityData.session_rpe,
          activityData.feel,
          activityData.compliance,
          icuActivity.coach_tick || false,
          JSON.stringify(activityData.achievements),
          activityData.interval_summary,
          activityData.strava_id,
          activityData.source,
          icuActivity.analyzed
        ]);
        
        addedCount++;
        console.log(`🦈 Added activity: ${activityData.name} (${activityData.intervals_icu_id})`);
        
      } catch (error) {
        const errorMsg = `Failed to import activity "${icuActivity.name}" (${icuActivity.id}): ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error('🦈 Error importing activity:', errorMsg);
      }
    }
    
    res.json({
      success: true,
      message: `🦈 Activity sync complete! Added ${addedCount} new activities, skipped ${skippedCount} existing ones`,
      stats: {
        total_fetched: activities.length,
        added: addedCount,
        skipped: skippedCount,
        errors: errors.length
      },
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Error syncing activities from intervals.icu:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync activities from intervals.icu',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get activity details by ID
router.get('/:activityId', async (req: Request, res: Response) => {
  try {
    const { activityId } = req.params;
    
    const result = await db.query('SELECT * FROM activities WHERE id = $1', [activityId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }
    
    res.json({
      success: true,
      activity: result.rows[0],
      message: '🦈 Activity details loaded - analyze your predator performance! ⚡'
    });
    
  } catch (error) {
    console.error('Error fetching activity details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
