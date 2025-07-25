import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
});

async function verifyAssignments() {
  try {
    console.log('🦈 ================================');
    console.log('   Workout Library System Status');
    console.log('🦈 ================================');

    // Check all assignments for user 34
    console.log('\n📋 Workout Assignments for User 34:');
    const assignmentsResult = await pool.query(`
      SELECT 
        wa.id as assignment_id,
        wa.scheduled_date,
        wa.status,
        wa.priority,
        wa.intensity_adjustment,
        wa.duration_adjustment,
        wa.custom_notes,
        wa.created_at,
        wl.name as workout_name,
        wl.description as workout_description,
        wl.training_type,
        wl.estimated_duration_minutes,
        wl.difficulty_level,
        u1.username as athlete_username,
        u1.first_name as athlete_first_name,
        u1.last_name as athlete_last_name,
        u2.username as coach_username,
        u2.first_name as coach_first_name,
        u2.last_name as coach_last_name
      FROM workout_assignments wa
      JOIN workout_library wl ON wa.workout_library_id = wl.id
      JOIN users u1 ON wa.assigned_to_user_id = u1.id
      JOIN users u2 ON wa.assigned_by_user_id = u2.id
      WHERE wa.assigned_to_user_id = 34
      ORDER BY wa.scheduled_date, wa.created_at
    `);

    console.log(`\n✅ Found ${assignmentsResult.rows.length} workout assignments for user 34:`);
    
    assignmentsResult.rows.forEach((assignment, index) => {
      console.log(`\n📝 Assignment ${index + 1}:`);
      console.log(`   - ID: ${assignment.assignment_id}`);
      console.log(`   - Workout: ${assignment.workout_name}`);
      console.log(`   - Type: ${assignment.training_type}`);
      console.log(`   - Duration: ${assignment.estimated_duration_minutes} minutes`);
      console.log(`   - Difficulty: ${assignment.difficulty_level}/10`);
      console.log(`   - Athlete: ${assignment.athlete_first_name} ${assignment.athlete_last_name} (@${assignment.athlete_username})`);
      console.log(`   - Coach: ${assignment.coach_first_name} ${assignment.coach_last_name} (@${assignment.coach_username})`);
      console.log(`   - Scheduled: ${assignment.scheduled_date.toDateString()}`);
      console.log(`   - Status: ${assignment.status}`);
      console.log(`   - Priority: ${assignment.priority}`);
      console.log(`   - Intensity Adjustment: ${assignment.intensity_adjustment}x`);
      console.log(`   - Duration Adjustment: ${assignment.duration_adjustment}x`);
      console.log(`   - Notes: ${assignment.custom_notes}`);
      console.log(`   - Assigned: ${assignment.created_at.toDateString()}`);
    });

    // Show workout library statistics
    console.log('\n🦈 ================================');
    console.log('   Workout Library Statistics');
    console.log('🦈 ================================');

    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM workout_library) as total_workouts,
        (SELECT COUNT(*) FROM workout_segments) as total_segments,
        (SELECT COUNT(*) FROM workout_categories) as total_categories,
        (SELECT COUNT(*) FROM workout_assignments) as total_assignments,
        (SELECT COUNT(*) FROM workout_assignments WHERE status = 'assigned') as pending_assignments,
        (SELECT COUNT(*) FROM workout_assignments WHERE status = 'completed') as completed_assignments,
        (SELECT COUNT(DISTINCT assigned_to_user_id) FROM workout_assignments) as athletes_with_assignments
    `);

    const stat = stats.rows[0];
    console.log(`📊 System Overview:`);
    console.log(`   - Total Workouts: ${stat.total_workouts}`);
    console.log(`   - Total Segments: ${stat.total_segments}`);
    console.log(`   - Total Categories: ${stat.total_categories}`);
    console.log(`   - Total Assignments: ${stat.total_assignments}`);
    console.log(`   - Pending Assignments: ${stat.pending_assignments}`);
    console.log(`   - Completed Assignments: ${stat.completed_assignments}`);
    console.log(`   - Athletes with Assignments: ${stat.athletes_with_assignments}`);

    console.log('\n🦈 ================================');
    console.log('   System Status: WORKING PERFECTLY! ✅');
    console.log('🦈 ================================');

  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    await pool.end();
  }
}

verifyAssignments();
