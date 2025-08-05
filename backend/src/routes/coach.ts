import express from 'express';
import { Pool } from 'pg';
import { IntervalsIcuService } from '../services/intervalsIcuService';

const router = express.Router();

// Initialize intervals.icu service
const intervalsIcuService = new IntervalsIcuService();

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// GET /api/coach/athletes - Get all athletes for a coach
router.get('/athletes', async (req, res) => {
  try {
    const client = await pool.connect();
    
    // First, let's check what columns actually exist in the users table
    const columnCheckResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
    `);
    
    const availableColumns = columnCheckResult.rows.map(row => row.column_name);
    console.log('Available columns in users table:', availableColumns);
    
    // Build the query based on available columns
    const baseColumns = ['id', 'email', 'username', 'created_at', 'updated_at'];
    const optionalColumns = ['first_name', 'last_name', 'avatar_url', 'cycling_experience', 'weight_kg', 'height_cm', 'ftp_watts', 'max_heart_rate', 'intervals_icu_id'];
    
    const columnsToSelect = [
      ...baseColumns,
      ...optionalColumns.filter(col => availableColumns.includes(col))
    ];
    
    // Get all users (athletes) - in a real system, you'd filter by coach relationship
    const result = await client.query(`
      SELECT ${columnsToSelect.join(', ')}
      FROM users 
      ORDER BY ${availableColumns.includes('first_name') ? 'first_name, last_name,' : ''} username
      LIMIT 50
    `);
    
    console.log(`Found ${result.rows.length} users in database`);
    
    // Map database fields to frontend interface
    const athletes = result.rows.map(row => ({
      id: row.id,
      uuid: `user-${row.id}`, // Generate UUID-like string
      email: row.email,
      username: row.username,
      firstName: row.first_name || null,
      lastName: row.last_name || null,
      avatarUrl: row.avatar_url || null,
      fitnessLevel: row.cycling_experience || 'beginner',
      weight: row.weight_kg || null,
      height: row.height_cm || null,
      joinedDate: row.created_at,
      lastActivity: null, // This would need to be calculated from sessions/workouts
      ftp: row.ftp_watts || null,
      maxHeartRate: row.max_heart_rate || null,
      restHeartRate: null, // This would need to be calculated or stored separately
      intervalsIcuId: row.intervals_icu_id || null // Add intervals.icu ID for activity sync
    }));
    
    client.release();
    
    res.json({
      success: true,
      data: athletes,
      message: `Found ${athletes.length} athletes`
    });
  } catch (error) {
    console.error('Error fetching athletes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch athletes',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/coach/athletes/:athleteId/workouts - Get workout assignments for a specific athlete
router.get('/athletes/:athleteId/workouts', async (req, res) => {
  try {
    const { athleteId } = req.params;
    const client = await pool.connect();
    
    // Get workout assignments with related workout library data
    const result = await client.query(`
      SELECT 
        wa.id,
        wa.workout_library_id,
        wa.scheduled_date,
        wa.status,
        wa.priority,
        wa.intensity_adjustment,
        wa.duration_adjustment,
        wa.custom_notes,
        wa.completed_at,
        wa.athlete_feedback,
        wa.coach_review,
        wa.intervals_icu_event_id,
        wa.created_at,
        wa.updated_at,
        
        -- Workout library details
        wl.name as workout_name,
        wl.description as workout_description,
        wl.training_type,
        wl.estimated_duration_minutes,
        wl.difficulty_level,
        wl.primary_control_parameter,
        wl.secondary_control_parameter,
        
        -- Coach information
        coach.username as coach_username,
        coach.first_name as coach_first_name,
        coach.last_name as coach_last_name
        
      FROM workout_assignments wa
      JOIN workout_library wl ON wa.workout_library_id = wl.id
      JOIN users coach ON wa.assigned_by_user_id = coach.id
      WHERE wa.assigned_to_user_id = $1
      ORDER BY wa.scheduled_date DESC
    `, [athleteId]);
    
    console.log(`🔍 Backend - Found ${result.rows.length} workout assignments for athlete ${athleteId}`);
    
    // Map to frontend format
    const workouts = result.rows.map(row => {
      console.log('🔍 Backend - Processing workout row:', {
        id: row.id,
        scheduled_date: row.scheduled_date,
        scheduled_date_type: typeof row.scheduled_date,
        workout_name: row.workout_name
      });
      
      // Since scheduled_date is now VARCHAR, use it directly without any conversion
      let dateString: string;
      if (typeof row.scheduled_date === 'string') {
        // Use the raw string date directly - no timezone conversion needed
        dateString = row.scheduled_date.split('T')[0]; // Remove time part if present
      } else if (row.scheduled_date instanceof Date) {
        // Legacy fallback in case some old data still comes as Date
        dateString = row.scheduled_date.toISOString().split('T')[0];
      } else {
        console.error('❌ Unexpected date format:', row.scheduled_date);
        dateString = '2025-07-29'; // Fallback
      }
      
      console.log('🔍 Backend - Using raw date string:', dateString);
      
      return {
        id: row.workout_library_id, // Use workout_library_id for details fetching
        assignment_id: row.id, // Add assignment_id for deletion functionality
        date: dateString,
        name: row.workout_name,
        type: row.training_type || 'endurance',
        status: row.status,
        duration: Math.round(row.estimated_duration_minutes * (row.duration_adjustment || 1)),
        targetPower: null, // TODO: Calculate from workout segments and user FTP
        actualPower: null, // TODO: Get from execution results
        targetHeartRate: null, // TODO: Calculate from workout segments and user zones
        actualHeartRate: null, // TODO: Get from execution results
        notes: row.athlete_feedback,
        coachNotes: row.custom_notes || row.coach_review,
        priority: row.priority,
        intensityAdjustment: row.intensity_adjustment,
        durationAdjustment: row.duration_adjustment,
        completedAt: row.completed_at,
        description: row.workout_description,
        difficultyLevel: row.difficulty_level,
        controlParameter: row.primary_control_parameter,
        intervals_icu_event_id: row.intervals_icu_event_id, // Add for intervals.icu tracking
        coachInfo: {
          username: row.coach_username,
          firstName: row.coach_first_name,
          lastName: row.coach_last_name
        }
      };
    });
    
    client.release();
    res.json({
      success: true,
      data: workouts
    });
    
  } catch (error) {
    console.error('Error fetching athlete workouts:', error);
    const err = error as Error;
    res.status(500).json({
      success: false,
      message: 'Failed to fetch athlete workouts',
      error: err.message
    });
  }
});

// GET /api/coach/stats - Get coach dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Get total athletes count
    const athletesResult = await client.query(`
      SELECT COUNT(*) as total_athletes
      FROM users
    `);
    
    // Get active workouts count
    const activeWorkoutsResult = await client.query(`
      SELECT COUNT(*) as active_workouts
      FROM workout_assignments wa
      WHERE wa.status IN ('assigned', 'started')
    `);
    
    // Get completed workouts this week
    const completedThisWeekResult = await client.query(`
      SELECT COUNT(*) as completed_this_week
      FROM workout_assignments wa
      WHERE wa.status = 'completed'
      AND wa.completed_at >= date_trunc('week', CURRENT_DATE)
    `);
    
    client.release();
    
    res.json({
      success: true,
      data: {
        totalAthletes: parseInt(athletesResult.rows[0].total_athletes),
        activeWorkouts: parseInt(activeWorkoutsResult.rows[0].active_workouts),
        completedThisWeek: parseInt(completedThisWeekResult.rows[0].completed_this_week)
      }
    });
    
  } catch (error) {
    console.error('Error fetching coach stats:', error);
    const err = error as Error;
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coach statistics',
      error: err.message
    });
  }
});

// GET /api/coach/athletes/:athleteId/profile - Get detailed athlete profile
router.get('/athletes/:athleteId/profile', async (req, res) => {
  try {
    const { athleteId } = req.params;
    const client = await pool.connect();
    
    // Get athlete profile with additional stats
    const result = await client.query(`
      SELECT 
        u.id,
        u.email,
        u.username,
        u.first_name,
        u.last_name,
        u.avatar_url,
        u.fitness_level,
        u.weight,
        u.height,
        u.date_of_birth,
        u.created_at,
        u.intervals_icu_id,
        
        -- Calculate last activity from cycling sessions
        MAX(cs.session_date) as last_activity,
        
        -- Calculate some basic stats
        COUNT(cs.id) as total_sessions,
        COALESCE(SUM(cs.distance), 0) as total_distance,
        COALESCE(AVG(cs.power_avg), 0) as avg_power,
        COALESCE(MAX(cs.power_max), 0) as max_power
        
      FROM users u
      LEFT JOIN cycling_sessions cs ON u.id = cs.user_id
      WHERE u.id = $1
      GROUP BY u.id
    `, [athleteId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Athlete not found'
      });
    }
    
    const row = result.rows[0];
    const athlete = {
      id: row.id,
      uuid: `user-${row.id}`,
      email: row.email,
      username: row.username,
      firstName: row.first_name,
      lastName: row.last_name,
      avatarUrl: row.avatar_url,
      fitnessLevel: row.fitness_level,
      weight: row.weight,
      height: row.height,
      dateOfBirth: row.date_of_birth,
      joinedDate: row.created_at,
      lastActivity: row.last_activity,
      intervalsIcuId: row.intervals_icu_id,
      
      // Additional stats
      stats: {
        totalSessions: parseInt(row.total_sessions),
        totalDistance: parseFloat(row.total_distance),
        avgPower: Math.round(parseFloat(row.avg_power) || 0),
        maxPower: parseInt(row.max_power) || 0
      }
    };
    
    client.release();
    res.json({
      success: true,
      data: athlete
    });
    
  } catch (error) {
    console.error('Error fetching athlete profile:', error);
    const err = error as Error;
    res.status(500).json({
      success: false,
      message: 'Failed to fetch athlete profile',
      error: err.message
    });
  }
});

// DELETE /api/coach/workout-assignments/:assignmentId - Remove a workout assignment
router.delete('/workout-assignments/:assignmentId', async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const client = await pool.connect();
    
    // First, get the assignment details including intervals.icu event ID and athlete's intervals.icu ID
    const assignmentResult = await client.query(`
      SELECT 
        wa.id,
        wa.intervals_icu_event_id,
        wl.name as workout_name,
        u.username as athlete_username,
        u.intervals_icu_id as athlete_intervals_icu_id
      FROM workout_assignments wa
      JOIN workout_library wl ON wa.workout_library_id = wl.id
      JOIN users u ON wa.assigned_to_user_id = u.id
      WHERE wa.id = $1
    `, [assignmentId]);
    
    if (assignmentResult.rows.length === 0) {
      client.release();
      return res.status(404).json({
        success: false,
        message: 'Workout assignment not found'
      });
    }
    
    const assignment = assignmentResult.rows[0];
    console.log(`🔍 Coach - Removing workout assignment: ${assignment.workout_name} for ${assignment.athlete_username}`);
    
    // Remove from intervals.icu if intervals_icu_event_id exists
    let intervalsIcuResult = null;
    if (assignment.intervals_icu_event_id && assignment.athlete_intervals_icu_id) {
      console.log(`🔗 Removing intervals.icu event: ${assignment.intervals_icu_event_id} for athlete: ${assignment.athlete_intervals_icu_id}`);
      
      try {
        intervalsIcuResult = await intervalsIcuService.deleteWorkout(
          assignment.athlete_intervals_icu_id,
          assignment.intervals_icu_event_id
        );
        
        if (intervalsIcuResult.success) {
          console.log('✅ Successfully removed workout from intervals.icu');
        } else {
          console.warn('⚠️ Failed to remove workout from intervals.icu:', intervalsIcuResult.message);
        }
      } catch (error) {
        console.error('❌ Error removing workout from intervals.icu:', error);
        intervalsIcuResult = {
          success: false,
          message: 'Error communicating with intervals.icu'
        };
      }
    } else if (assignment.intervals_icu_event_id) {
      console.warn('⚠️ Workout has intervals.icu event ID but athlete has no intervals.icu ID configured');
    }
    
    // Delete the workout assignment from our database
    const deleteResult = await client.query(`
      DELETE FROM workout_assignments 
      WHERE id = $1
      RETURNING id
    `, [assignmentId]);
    
    if (deleteResult.rows.length === 0) {
      client.release();
      return res.status(500).json({
        success: false,
        message: 'Failed to delete workout assignment'
      });
    }
    
    client.release();
    
    console.log(`✅ Coach - Successfully removed workout assignment ${assignmentId}`);
    
    // Prepare response message
    let message = 'Workout assignment removed successfully';
    if (intervalsIcuResult) {
      if (intervalsIcuResult.success) {
        message += ' and removed from intervals.icu';
      } else {
        message += ` (Warning: Failed to remove from intervals.icu: ${intervalsIcuResult.message})`;
      }
    }
    
    res.json({
      success: true,
      message,
      data: {
        deletedId: assignmentId,
        workoutName: assignment.workout_name,
        athleteUsername: assignment.athlete_username,
        intervalsIcu: intervalsIcuResult ? {
          removed: intervalsIcuResult.success,
          message: intervalsIcuResult.message
        } : null
      }
    });
    
  } catch (error) {
    console.error('Error removing workout assignment:', error);
    const err = error as Error;
    res.status(500).json({
      success: false,
      message: 'Failed to remove workout assignment',
      error: err.message
    });
  }
});

// DEBUG endpoint to check workout assignment data integrity
router.get('/debug/workout-assignments/:athleteId', async (req, res) => {
  try {
    const { athleteId } = req.params;
    const client = await pool.connect();
    
    // Check workout assignments and their workout library references
    const result = await client.query(`
      SELECT 
        wa.id as assignment_id,
        wa.workout_library_id,
        wa.assigned_to_user_id,
        wa.scheduled_date,
        wa.status,
        wl.id as library_id_exists,
        wl.name as library_name,
        CASE WHEN wl.id IS NULL THEN 'MISSING' ELSE 'EXISTS' END as library_status
      FROM workout_assignments wa
      LEFT JOIN workout_library wl ON wa.workout_library_id = wl.id
      WHERE wa.assigned_to_user_id = $1
      ORDER BY wa.id DESC
    `, [athleteId]);
    
    client.release();
    
    res.json({
      success: true,
      data: result.rows,
      summary: {
        total_assignments: result.rows.length,
        missing_libraries: result.rows.filter(row => row.library_status === 'MISSING').length,
        valid_assignments: result.rows.filter(row => row.library_status === 'EXISTS').length
      }
    });
    
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Debug query failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
