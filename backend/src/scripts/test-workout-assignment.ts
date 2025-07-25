import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
});

async function testWorkoutAssignment() {
  try {
    console.log('🦈 ================================');
    console.log('   Testing Workout Assignment');
    console.log('🦈 ================================');

    // First, check if users exist
    const usersResult = await pool.query('SELECT id, username, first_name, last_name FROM users LIMIT 5');
    console.log(`👥 Found ${usersResult.rows.length} users in database:`);
    usersResult.rows.forEach(user => {
      console.log(`   - User ID ${user.id}: ${user.username} (${user.first_name} ${user.last_name})`);
    });

    // If no users exist, create test users
    if (usersResult.rows.length === 0) {
      console.log('\n🔧 Creating test users...');
      
      // Create coach (user ID 1)
      await pool.query(`
        INSERT INTO users (id, username, email, first_name, last_name, user_type) 
        VALUES (1, 'coach_shark', 'coach@schoolofsharks.com', 'Coach', 'Shark', 'coach')
        ON CONFLICT (id) DO NOTHING
      `);
      
      // Create athlete (user ID 34)
      await pool.query(`
        INSERT INTO users (id, username, email, first_name, last_name, user_type) 
        VALUES (34, 'athlete_34', 'athlete34@schoolofsharks.com', 'Athlete', 'ThirtyFour', 'athlete')
        ON CONFLICT (id) DO NOTHING
      `);
      
      console.log('✅ Test users created!');
    }

    // Now test the workout assignment
    console.log('\n🏋️‍♂️ Testing workout assignment...');
    
    const assignmentResult = await pool.query(`
      INSERT INTO workout_assignments (
        workout_library_id, assigned_to_user_id, assigned_by_user_id,
        scheduled_date, priority, intensity_adjustment, duration_adjustment,
        custom_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, workout_library_id, assigned_to_user_id, assigned_by_user_id, scheduled_date
    `, [
      1, // Threshold Development workout
      34, // Athlete user ID (goro2 goronin)
      33, // Coach user ID (goroman - using existing user as coach)
      '2025-07-26',
      'normal',
      1.0,
      1.0,
      'Test assignment - Threshold workout for user 34. Focus on maintaining steady power output during intervals.'
    ]);

    console.log('✅ Workout assignment successful!');
    console.log(`📝 Assignment ID: ${assignmentResult.rows[0].id}`);
    console.log(`🏋️‍♂️ Workout ID: ${assignmentResult.rows[0].workout_library_id}`);
    console.log(`👤 Assigned to User: ${assignmentResult.rows[0].assigned_to_user_id}`);
    console.log(`👨‍🏫 Assigned by User: ${assignmentResult.rows[0].assigned_by_user_id}`);
    console.log(`📅 Scheduled Date: ${assignmentResult.rows[0].scheduled_date}`);

    // Verify the assignment with workout details
    console.log('\n🔍 Verifying assignment with workout details...');
    const verifyResult = await pool.query(`
      SELECT 
        wa.id as assignment_id,
        wa.scheduled_date,
        wa.status,
        wa.custom_notes,
        wl.name as workout_name,
        wl.description as workout_description,
        wl.estimated_duration_minutes,
        u1.username as athlete_username,
        u2.username as coach_username
      FROM workout_assignments wa
      JOIN workout_library wl ON wa.workout_library_id = wl.id
      JOIN users u1 ON wa.assigned_to_user_id = u1.id
      JOIN users u2 ON wa.assigned_by_user_id = u2.id
      WHERE wa.id = $1
    `, [assignmentResult.rows[0].id]);

    const assignment = verifyResult.rows[0];
    console.log('📊 Assignment Details:');
    console.log(`   - Assignment ID: ${assignment.assignment_id}`);
    console.log(`   - Workout: ${assignment.workout_name}`);
    console.log(`   - Duration: ${assignment.estimated_duration_minutes} minutes`);
    console.log(`   - Athlete: ${assignment.athlete_username}`);
    console.log(`   - Coach: ${assignment.coach_username}`);
    console.log(`   - Scheduled: ${assignment.scheduled_date}`);
    console.log(`   - Status: ${assignment.status}`);
    console.log(`   - Notes: ${assignment.custom_notes}`);

    console.log('\n🦈 ================================');
    console.log('   Workout Assignment Test COMPLETE');
    console.log('🦈 ================================');

  } catch (error) {
    console.error('❌ Error during workout assignment test:', error);
  } finally {
    await pool.end();
  }
}

testWorkoutAssignment();
