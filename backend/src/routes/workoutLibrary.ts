import { Router, Request, Response } from 'express';
import { db } from '../server';
import { 
  WorkoutLibrary, 
  WorkoutSegment, 
  WorkoutCategory, 
  WorkoutAssignment,
  WorkoutExecutionResult,
  CreateWorkoutLibraryRequest,
  CreateWorkoutAssignmentRequest,
  CreateWorkoutExecutionRequest,
  WorkoutLibraryFilters,
  WorkoutLibraryListResponse,
  WorkoutLibraryDetailResponse
} from '../models/types';

const router = Router();

// =================================================================
// 🦈 WORKOUT LIBRARY ENDPOINTS - SCHOOL OF SHARKS ⚡
// =================================================================

// Get all workout categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const result = await db.query(`
      SELECT * FROM workout_categories 
      WHERE is_active = true 
      ORDER BY sort_order, name
    `);
    
    res.json({
      success: true,
      categories: result.rows,
      message: '🦈 Workout categories loaded - organize your training arsenal! ⚡'
    });
  } catch (error) {
    console.error('Error fetching workout categories:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch workout categories' 
    });
  }
});

// Get all workout templates with filtering
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const filters: WorkoutLibraryFilters = req.query as any;
    const page = parseInt(String(filters.page || '1')) || 1;
    const limit = parseInt(String(filters.limit || '20')) || 20;
    const offset = (page - 1) * limit;
    
    // Build dynamic WHERE clause
    let whereConditions = ['wl.is_active = true'];
    let queryParams: any[] = [];
    let paramIndex = 1;
    
    if (filters.training_type) {
      if (Array.isArray(filters.training_type)) {
        whereConditions.push(`wl.training_type = ANY($${paramIndex})`);
        queryParams.push(filters.training_type);
      } else {
        whereConditions.push(`wl.training_type = $${paramIndex}`);
        queryParams.push(filters.training_type);
      }
      paramIndex++;
    }
    
    if (filters.difficulty_level) {
      whereConditions.push(`wl.difficulty_level = $${paramIndex}`);
      queryParams.push(filters.difficulty_level);
      paramIndex++;
    }
    
    if (filters.min_duration) {
      whereConditions.push(`wl.estimated_duration_minutes >= $${paramIndex}`);
      queryParams.push(filters.min_duration);
      paramIndex++;
    }
    
    if (filters.max_duration) {
      whereConditions.push(`wl.estimated_duration_minutes <= $${paramIndex}`);
      queryParams.push(filters.max_duration);
      paramIndex++;
    }
    
    if (filters.search) {
      whereConditions.push(`(wl.name ILIKE $${paramIndex} OR wl.description ILIKE $${paramIndex})`);
      queryParams.push(`%${filters.search}%`);
      paramIndex++;
    }
    
    if (filters.is_public !== undefined) {
      whereConditions.push(`wl.is_public = $${paramIndex}`);
      queryParams.push(filters.is_public);
      paramIndex++;
    }
    
    // Build ORDER BY clause
    let orderBy = 'wl.created_at DESC';
    if (filters.sort_by) {
      const sortOrder = filters.sort_order || 'asc';
      switch (filters.sort_by) {
        case 'name':
          orderBy = `wl.name ${sortOrder.toUpperCase()}`;
          break;
        case 'duration':
          orderBy = `wl.estimated_duration_minutes ${sortOrder.toUpperCase()}`;
          break;
        case 'difficulty':
          orderBy = `wl.difficulty_level ${sortOrder.toUpperCase()}`;
          break;
        default:
          orderBy = `wl.created_at ${sortOrder.toUpperCase()}`;
      }
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM workout_library wl
      WHERE ${whereClause}
    `;
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);
    
    // Get workouts with categories
    const workoutsQuery = `
      SELECT 
        wl.*,
        u.username as creator_username,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        array_agg(DISTINCT wc.name) FILTER (WHERE wc.name IS NOT NULL) as categories,
        COUNT(DISTINCT ws.id) as segment_count
      FROM workout_library wl
      LEFT JOIN users u ON wl.created_by = u.id
      LEFT JOIN workout_library_categories wlc ON wl.id = wlc.workout_library_id
      LEFT JOIN workout_categories wc ON wlc.category_id = wc.id
      LEFT JOIN workout_segments ws ON wl.id = ws.workout_library_id
      WHERE ${whereClause}
      GROUP BY wl.id, u.username, u.first_name, u.last_name
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    const workoutsResult = await db.query(workoutsQuery, queryParams);
    
    const response: WorkoutLibraryListResponse = {
      success: true,
      workouts: workoutsResult.rows.map(row => ({
        ...row,
        creator: row.creator_username ? {
          id: row.created_by,
          username: row.creator_username,
          first_name: row.creator_first_name,
          last_name: row.creator_last_name
        } : undefined
      })),
      total,
      page,
      limit,
      filters,
      message: `🦈 Found ${total} workout templates - time to dominate your training! ⚡`
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching workout templates:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch workout templates' 
    });
  }
});

// Get workout template details with segments
router.get('/templates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get workout details
    const workoutResult = await db.query(`
      SELECT 
        wl.*,
        u.username as creator_username,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name
      FROM workout_library wl
      LEFT JOIN users u ON wl.created_by = u.id
      WHERE wl.id = $1 AND wl.is_active = true
    `, [id]);
    
    if (workoutResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Workout template not found' 
      });
    }
    
    // Get workout segments
    const segmentsResult = await db.query(`
      SELECT * FROM workout_segments 
      WHERE workout_library_id = $1 
      ORDER BY segment_order
    `, [id]);
    
    // Get workout categories
    const categoriesResult = await db.query(`
      SELECT wc.* 
      FROM workout_categories wc
      JOIN workout_library_categories wlc ON wc.id = wlc.category_id
      WHERE wlc.workout_library_id = $1
      ORDER BY wc.sort_order
    `, [id]);
    
    // Get assignment statistics
    const statsResult = await db.query(`
      SELECT 
        COUNT(DISTINCT wa.id) as assignments_count,
        COUNT(DISTINCT wer.id) as completions_count,
        AVG(wer.enjoyment_rating) as avg_rating,
        AVG(wer.completion_percentage) as avg_completion_rate
      FROM workout_assignments wa
      LEFT JOIN workout_execution_results wer ON wa.id = wer.workout_assignment_id
      WHERE wa.workout_library_id = $1
    `, [id]);
    
    const workout = workoutResult.rows[0];
    const stats = statsResult.rows[0];
    
    const response: WorkoutLibraryDetailResponse = {
      success: true,
      workout: {
        ...workout,
        segments: segmentsResult.rows,
        categories: categoriesResult.rows,
        creator: workout.creator_username ? {
          id: workout.created_by,
          username: workout.creator_username,
          first_name: workout.creator_first_name,
          last_name: workout.creator_last_name
        } : undefined,
        assignments_count: parseInt(stats.assignments_count) || 0,
        avg_completion_rate: parseFloat(stats.avg_completion_rate) || 0,
        avg_rating: parseFloat(stats.avg_rating) || 0
      },
      message: '🦈 Workout details loaded - time to unleash your inner predator! ⚡'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching workout details:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch workout details' 
    });
  }
});

// Create new workout template
router.post('/templates', async (req: Request, res: Response) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');
    
    const workoutData: CreateWorkoutLibraryRequest = req.body;
    
    // Insert main workout
    const workoutResult = await client.query(`
      INSERT INTO workout_library (
        name, description, training_type, primary_control_parameter,
        secondary_control_parameter, estimated_duration_minutes, difficulty_level,
        tags, is_public, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `, [
      workoutData.name,
      workoutData.description,
      workoutData.training_type,
      workoutData.primary_control_parameter,
      workoutData.secondary_control_parameter,
      workoutData.estimated_duration_minutes,
      workoutData.difficulty_level,
      workoutData.tags,
      workoutData.is_public || false,
      req.body.created_by // Should come from auth middleware
    ]);
    
    const workoutId = workoutResult.rows[0].id;
    
    // Insert segments
    for (const segment of workoutData.segments) {
      await client.query(`
        INSERT INTO workout_segments (
          workout_library_id, segment_order, segment_type, name, duration_minutes,
          duration_type, hr_min_percent, hr_max_percent, hr_zone, power_min_percent,
          power_max_percent, power_zone, power_watts_min, power_watts_max,
          cadence_min, cadence_max, rpe_min, rpe_max, repetitions,
          rest_duration_minutes, rest_type, instructions, coaching_notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      `, [
        workoutId, segment.segment_order, segment.segment_type, segment.name,
        segment.duration_minutes, segment.duration_type, segment.hr_min_percent,
        segment.hr_max_percent, segment.hr_zone, segment.power_min_percent,
        segment.power_max_percent, segment.power_zone, segment.power_watts_min,
        segment.power_watts_max, segment.cadence_min, segment.cadence_max,
        segment.rpe_min, segment.rpe_max, segment.repetitions || 1,
        segment.rest_duration_minutes, segment.rest_type || 'active',
        segment.instructions, segment.coaching_notes
      ]);
    }
    
    // Link categories if provided
    if (workoutData.category_ids && workoutData.category_ids.length > 0) {
      for (const categoryId of workoutData.category_ids) {
        await client.query(`
          INSERT INTO workout_library_categories (workout_library_id, category_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [workoutId, categoryId]);
      }
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({
      success: true,
      workout_id: workoutId,
      message: '🦈 Workout template created successfully - ready to dominate! ⚡'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating workout template:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create workout template' 
    });
  } finally {
    client.release();
  }
});

// Assign workout to athlete
router.post('/assignments', async (req: Request, res: Response) => {
  try {
    const assignmentData: CreateWorkoutAssignmentRequest = req.body;
    
    const result = await db.query(`
      INSERT INTO workout_assignments (
        workout_library_id, assigned_to_user_id, assigned_by_user_id,
        scheduled_date, priority, intensity_adjustment, duration_adjustment,
        custom_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      assignmentData.workout_library_id,
      assignmentData.assigned_to_user_id,
      req.body.assigned_by_user_id, // Should come from auth middleware
      assignmentData.scheduled_date,
      assignmentData.priority || 'normal',
      assignmentData.intensity_adjustment || 1.0,
      assignmentData.duration_adjustment || 1.0,
      assignmentData.custom_notes
    ]);
    
    res.status(201).json({
      success: true,
      assignment_id: result.rows[0].id,
      message: '🦈 Workout assigned successfully - let the training begin! ⚡'
    });
    
  } catch (error) {
    console.error('Error creating workout assignment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create workout assignment' 
    });
  }
});

// Get workout assignments with filtering
router.get('/assignments', async (req: Request, res: Response) => {
  try {
    const {
      assigned_to_user_id,
      assigned_by_user_id,
      status,
      priority,
      training_type,
      scheduled_date_from,
      scheduled_date_to,
      difficulty_min,
      difficulty_max,
      page = 1,
      limit = 20
    } = req.query;

    let whereConditions = ['1=1'];
    let queryParams: any[] = [];
    let paramIndex = 1;

    // Add filters
    if (assigned_to_user_id) {
      whereConditions.push(`wa.assigned_to_user_id = $${paramIndex}`);
      queryParams.push(assigned_to_user_id);
      paramIndex++;
    }

    if (assigned_by_user_id) {
      whereConditions.push(`wa.assigned_by_user_id = $${paramIndex}`);
      queryParams.push(assigned_by_user_id);
      paramIndex++;
    }

    if (status) {
      whereConditions.push(`wa.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (priority) {
      whereConditions.push(`wa.priority = $${paramIndex}`);
      queryParams.push(priority);
      paramIndex++;
    }

    if (training_type) {
      whereConditions.push(`wl.training_type = $${paramIndex}`);
      queryParams.push(training_type);
      paramIndex++;
    }

    if (scheduled_date_from) {
      whereConditions.push(`wa.scheduled_date >= $${paramIndex}`);
      queryParams.push(scheduled_date_from);
      paramIndex++;
    }

    if (scheduled_date_to) {
      whereConditions.push(`wa.scheduled_date <= $${paramIndex}`);
      queryParams.push(scheduled_date_to);
      paramIndex++;
    }

    if (difficulty_min) {
      whereConditions.push(`wl.difficulty_level >= $${paramIndex}`);
      queryParams.push(difficulty_min);
      paramIndex++;
    }

    if (difficulty_max) {
      whereConditions.push(`wl.difficulty_level <= $${paramIndex}`);
      queryParams.push(difficulty_max);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');
    const offset = (Number(page) - 1) * Number(limit);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM workout_assignments wa
      JOIN workout_library wl ON wa.workout_library_id = wl.id
      WHERE ${whereClause}
    `;
    const countResult = await db.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get assignments with full details
    const assignmentsQuery = `
      SELECT 
        wa.id,
        wa.workout_library_id,
        wa.assigned_to_user_id,
        wa.assigned_by_user_id,
        wa.scheduled_date,
        wa.status,
        wa.priority,
        wa.intensity_adjustment,
        wa.duration_adjustment,
        wa.custom_notes,
        wa.completed_at,
        wa.athlete_feedback,
        wa.coach_review,
        wa.created_at,
        wa.updated_at,
        wl.name as workout_name,
        wl.description as workout_description,
        wl.training_type as workout_training_type,
        wl.estimated_duration_minutes as workout_duration,
        wl.difficulty_level as workout_difficulty,
        athlete.username as athlete_username,
        athlete.first_name as athlete_first_name,
        athlete.last_name as athlete_last_name,
        coach.username as coach_username,
        coach.first_name as coach_first_name,
        coach.last_name as coach_last_name
      FROM workout_assignments wa
      JOIN workout_library wl ON wa.workout_library_id = wl.id
      JOIN users athlete ON wa.assigned_to_user_id = athlete.id
      JOIN users coach ON wa.assigned_by_user_id = coach.id
      WHERE ${whereClause}
      ORDER BY wa.scheduled_date DESC, wa.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(Number(limit), offset);
    const assignmentsResult = await db.query(assignmentsQuery, queryParams);

    res.json({
      success: true,
      assignments: assignmentsResult.rows,
      total,
      page: Number(page),
      limit: Number(limit),
      message: `🦈 Found ${total} workout assignments - dominate your training schedule! ⚡`
    });

  } catch (error) {
    console.error('Error fetching workout assignments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch workout assignments' 
    });
  }
});

// Get assignments for a user
router.get('/assignments/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status, from_date, to_date } = req.query;
    
    let whereConditions = ['wa.assigned_to_user_id = $1'];
    let queryParams: any[] = [userId];
    let paramIndex = 2;
    
    if (status) {
      whereConditions.push(`wa.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }
    
    if (from_date) {
      whereConditions.push(`wa.scheduled_date >= $${paramIndex}`);
      queryParams.push(from_date);
      paramIndex++;
    }
    
    if (to_date) {
      whereConditions.push(`wa.scheduled_date <= $${paramIndex}`);
      queryParams.push(to_date);
      paramIndex++;
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    const result = await db.query(`
      SELECT 
        wa.*,
        wl.name as workout_name,
        wl.description as workout_description,
        wl.training_type,
        wl.estimated_duration_minutes,
        wl.difficulty_level,
        coach.username as coach_username,
        coach.first_name as coach_first_name,
        coach.last_name as coach_last_name,
        wer.id as execution_id,
        wer.completion_percentage,
        wer.enjoyment_rating
      FROM workout_assignments wa
      JOIN workout_library wl ON wa.workout_library_id = wl.id
      LEFT JOIN users coach ON wa.assigned_by_user_id = coach.id
      LEFT JOIN workout_execution_results wer ON wa.id = wer.workout_assignment_id
      WHERE ${whereClause}
      ORDER BY wa.scheduled_date DESC, wa.created_at DESC
    `, queryParams);
    
    res.json({
      success: true,
      assignments: result.rows.map(row => ({
        ...row,
        workout: {
          id: row.workout_library_id,
          name: row.workout_name,
          description: row.workout_description,
          training_type: row.training_type,
          estimated_duration_minutes: row.estimated_duration_minutes,
          difficulty_level: row.difficulty_level
        },
        coach: row.coach_username ? {
          id: row.assigned_by_user_id,
          username: row.coach_username,
          first_name: row.coach_first_name,
          last_name: row.coach_last_name
        } : undefined,
        execution_result: row.execution_id ? {
          id: row.execution_id,
          completion_percentage: row.completion_percentage,
          enjoyment_rating: row.enjoyment_rating
        } : undefined
      })),
      total: result.rows.length,
      message: `🦈 Found ${result.rows.length} workout assignments - time to conquer your training! ⚡`
    });
    
  } catch (error) {
    console.error('Error fetching workout assignments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch workout assignments' 
    });
  }
});

// Update assignment status
router.patch('/assignments/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, completion_notes, completion_date } = req.body;

    const validStatuses = ['assigned', 'started', 'completed', 'skipped', 'modified'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Prepare update data
    const updates: any = {
      status,
      updated_at: new Date()
    };

    if (status === 'completed') {
      updates.completed_at = completion_date || new Date();
    }

    if (completion_notes) {
      updates.athlete_feedback = completion_notes;
    }

    // Build dynamic update query
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [id, ...Object.values(updates)];

    const updateQuery = `
      UPDATE workout_assignments 
      SET ${setClause}
      WHERE id = $1
      RETURNING id, status, completed_at, updated_at
    `;

    const result = await db.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Workout assignment not found'
      });
    }

    res.json({
      success: true,
      assignment: result.rows[0],
      message: `🦈 Assignment status updated to ${status} - keep crushing it! ⚡`
    });

  } catch (error) {
    console.error('Error updating assignment status:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update assignment status' 
    });
  }
});

// Record workout completion
router.post('/executions', async (req: Request, res: Response) => {
  try {
    const executionData: CreateWorkoutExecutionRequest = req.body;
    
    const result = await db.query(`
      INSERT INTO workout_execution_results (
        workout_assignment_id, cycling_session_id, actual_duration_minutes,
        perceived_exertion, completion_percentage, avg_heart_rate, max_heart_rate,
        avg_power, max_power, avg_cadence, normalized_power, training_stress_score,
        segment_results, difficulty_rating, enjoyment_rating, athlete_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id
    `, [
      executionData.workout_assignment_id,
      executionData.cycling_session_id,
      executionData.actual_duration_minutes,
      executionData.perceived_exertion,
      executionData.completion_percentage || 100,
      executionData.avg_heart_rate,
      executionData.max_heart_rate,
      executionData.avg_power,
      executionData.max_power,
      executionData.avg_cadence,
      executionData.normalized_power,
      executionData.training_stress_score,
      JSON.stringify(executionData.segment_results),
      executionData.difficulty_rating,
      executionData.enjoyment_rating,
      executionData.athlete_notes
    ]);
    
    // Update assignment status to completed
    await db.query(`
      UPDATE workout_assignments 
      SET status = 'completed', completed_at = NOW()
      WHERE id = $1
    `, [executionData.workout_assignment_id]);
    
    res.status(201).json({
      success: true,
      execution_id: result.rows[0].id,
      message: '🦈 Workout completed successfully - apex predator performance recorded! ⚡'
    });
    
  } catch (error) {
    console.error('Error recording workout execution:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to record workout execution' 
    });
  }
});

export default router;
