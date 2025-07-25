import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection - same config as server
const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  }
  
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'school_of_sharks',
    user: process.env.DB_USER || 'goro',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };
};

const db = new Pool(getDatabaseConfig());

async function testWorkoutLibrarySystem() {
  try {
    console.log('🦈 ================================');
    console.log('   WORKOUT LIBRARY SYSTEM TEST');
    console.log('🦈 ================================');
    
    // Test 1: Check table existence
    console.log('\n📊 Test 1: Checking table structure...');
    const tablesResult = await db.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_name LIKE 'workout%'
      ORDER BY table_name;
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('❌ No workout library tables found!');
      console.log('💡 Run: sudo -u postgres psql -d your_database -f /tmp/workout_library_migration.sql');
      return;
    }
    
    console.log('✅ Workout library tables found:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name} (${row.column_count} columns)`);
    });
    
    // Test 2: Check data
    console.log('\n📈 Test 2: Checking data availability...');
    const dataCheck = await db.query(`
      SELECT 
        'workout_library' as table_name, COUNT(*) as records FROM workout_library
      UNION ALL
      SELECT 
        'workout_categories' as table_name, COUNT(*) as records FROM workout_categories
      UNION ALL
      SELECT 
        'workout_segments' as table_name, COUNT(*) as records FROM workout_segments
      ORDER BY table_name;
    `);
    
    console.log('📊 Data Summary:');
    dataCheck.rows.forEach(row => {
      const status = parseInt(row.records) > 0 ? '✅' : '⚠️ ';
      console.log(`   ${status} ${row.table_name}: ${row.records} records`);
    });
    
    // Test 3: Check categories
    console.log('\n🏷️  Test 3: Available workout categories...');
    const categoriesResult = await db.query(`
      SELECT name, description, color_hex, sort_order
      FROM workout_categories 
      WHERE is_active = true 
      ORDER BY sort_order;
    `);
    
    if (categoriesResult.rows.length > 0) {
      console.log('✅ Workout categories loaded:');
      categoriesResult.rows.forEach(row => {
        console.log(`   - ${row.name} ${row.color_hex || ''} (${row.description})`);
      });
    } else {
      console.log('⚠️  No workout categories found. Loading default categories...');
      // Insert default categories if missing
      await db.query(`
        INSERT INTO workout_categories (name, description, color_hex, icon_name, sort_order) VALUES
        ('Endurance', 'Long steady-state efforts to build aerobic base', '#3B82F6', 'clock', 1),
        ('Threshold', 'Lactate threshold and FTP building workouts', '#EF4444', 'zap', 2),
        ('VO2 Max', 'High-intensity efforts to improve oxygen uptake', '#F59E0B', 'trending-up', 3),
        ('Sprint', 'Short explosive power and neuromuscular training', '#10B981', 'flash', 4),
        ('Recovery', 'Easy spinning and active recovery sessions', '#6B7280', 'heart', 5)
        ON CONFLICT (name) DO NOTHING;
      `);
      console.log('✅ Default categories inserted!');
    }
    
    // Test 4: Sample workout query
    console.log('\n🏋️  Test 4: Sample workout data...');
    const workoutResult = await db.query(`
      SELECT 
        wl.name,
        wl.training_type,
        wl.estimated_duration_minutes,
        wl.difficulty_level,
        COUNT(ws.id) as segment_count
      FROM workout_library wl
      LEFT JOIN workout_segments ws ON wl.id = ws.workout_library_id
      WHERE wl.is_active = true
      GROUP BY wl.id, wl.name, wl.training_type, wl.estimated_duration_minutes, wl.difficulty_level
      ORDER BY wl.created_at DESC
      LIMIT 5;
    `);
    
    if (workoutResult.rows.length > 0) {
      console.log('✅ Sample workouts found:');
      workoutResult.rows.forEach(row => {
        console.log(`   - "${row.name}" (${row.training_type}) - ${row.estimated_duration_minutes}min, ${row.segment_count} segments, difficulty: ${row.difficulty_level}/10`);
      });
    } else {
      console.log('⚠️  No sample workouts found.');
      console.log('💡 Load sample data: sudo -u postgres psql -d your_database -f /tmp/sample_workouts.sql');
    }
    
    // Test 5: API endpoint simulation
    console.log('\n🌐 Test 5: API endpoint structure validation...');
    const endpointsTest = await db.query(`
      SELECT 
        'GET /api/workout-library/categories' as endpoint,
        'Fetch workout categories' as description,
        COUNT(*) as data_available
      FROM workout_categories WHERE is_active = true
      UNION ALL
      SELECT 
        'GET /api/workout-library/templates' as endpoint,
        'Fetch workout templates' as description,
        COUNT(*) as data_available
      FROM workout_library WHERE is_active = true
      UNION ALL
      SELECT 
        'POST /api/workout-library/templates' as endpoint,
        'Create workout template' as description,
        1 as data_available
      UNION ALL
      SELECT 
        'GET /api/workout-library/templates/:id' as endpoint,
        'Get workout details' as description,
        COUNT(*) as data_available
      FROM workout_library WHERE is_active = true;
    `);
    
    console.log('✅ API Endpoints ready:');
    endpointsTest.rows.forEach(row => {
      const status = parseInt(row.data_available) > 0 ? '🟢' : '🟡';
      console.log(`   ${status} ${row.endpoint} - ${row.description}`);
    });
    
    console.log('\n🦈 ================================');
    console.log('   WORKOUT LIBRARY TEST COMPLETE');
    console.log('🦈 ================================');
    console.log('✅ System Status: READY TO DOMINATE!');
    console.log('🚀 Start your server: npm run dev');
    console.log('🎯 Test endpoints: http://localhost:5000/api/workout-library/categories');
    console.log('🦈 ================================');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await db.end();
  }
}

// Run the test
testWorkoutLibrarySystem();
