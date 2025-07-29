// backend/src/migrations/add_intervals_icu_with_index.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables following project guidelines
dotenv.config({ path: '.env.production.dev' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // VPS connection settings
  ssl: false, // As per your dev environment
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '5000'),
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
  max: parseInt(process.env.DB_POOL_MAX || '10'),
  min: parseInt(process.env.DB_POOL_MIN || '2'),
});

async function addIntervalsIcuWithOptimizedIndex() {
  const client = await pool.connect();
  
  try {
    console.log('🦈 Connecting to School of Sharks VPS database...');
    console.log(`📡 Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`🗄️  Database: ${process.env.DB_NAME}`);
    
    // Step 1: Check if column exists
    const checkColumn = await client.query(`
      SELECT column_name, is_nullable, data_type
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'intervals_icu_id'
      AND table_schema = 'public';
    `);
    
    let columnExists = checkColumn.rows.length > 0;
    
    if (!columnExists) {
      console.log('📋 Adding intervals_icu_id column...');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN intervals_icu_id VARCHAR(100) UNIQUE;
      `);
      console.log('✅ Column added successfully');
    } else {
      console.log('✅ intervals_icu_id column already exists');
    }
    
    // Step 2: Check existing indexes on the column
    const checkIndexes = await client.query(`
      SELECT 
        i.relname as index_name,
        am.amname as index_type,
        ix.indisunique as is_unique,
        ix.indisprimary as is_primary
      FROM pg_class i
      JOIN pg_index ix ON i.oid = ix.indexrelid
      JOIN pg_class t ON ix.indrelid = t.oid
      JOIN pg_am am ON i.relam = am.oid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      WHERE t.relname = 'users'
      AND a.attname = 'intervals_icu_id';
    `);
    
    console.log('📊 Current indexes on intervals_icu_id:');
    checkIndexes.rows.forEach(idx => {
      console.log(`   - ${idx.index_name} (${idx.index_type}, unique: ${idx.is_unique})`);
    });
    
    // Step 3: Create optimized index if needed
    const hasOptimizedIndex = checkIndexes.rows.some(idx => 
      idx.index_name === 'idx_users_intervals_icu_id_btree'
    );
    
    if (!hasOptimizedIndex && checkIndexes.rows.length === 0) {
      console.log('🔧 Creating optimized B-tree index for intervals.icu lookups...');
      await client.query(`
        CREATE INDEX CONCURRENTLY idx_users_intervals_icu_id_btree 
        ON users USING btree (intervals_icu_id) 
        WHERE intervals_icu_id IS NOT NULL;
      `);
      console.log('✅ Optimized index created');
    } else if (checkIndexes.rows.length > 0) {
      console.log('✅ Index already exists (created by UNIQUE constraint)');
    }
    
    // Step 4: Analyze table for query planner optimization
    console.log('📈 Updating table statistics for query optimization...');
    await client.query('ANALYZE users;');
    
    // Step 5: Performance verification query
    const performanceTest = await client.query(`
      EXPLAIN (ANALYZE, BUFFERS) 
      SELECT id, email, intervals_icu_id 
      FROM users 
      WHERE intervals_icu_id = 'test_performance_query';
    `);
    
    console.log('🎯 Query performance analysis:');
    performanceTest.rows.forEach(row => {
      console.log(`   ${row['QUERY PLAN']}`);
    });
    
    // Step 6: Summary statistics
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(intervals_icu_id) as users_with_intervals_icu,
        ROUND(
          (COUNT(intervals_icu_id)::decimal / COUNT(*)) * 100, 2
        ) as integration_percentage
      FROM users;
    `);
    
    const { total_users, users_with_intervals_icu, integration_percentage } = stats.rows[0];
    
    console.log('\n🦈 School of Sharks Integration Summary:');
    console.log(`   📊 Total Users: ${total_users}`);
    console.log(`   🔗 Users with intervals.icu: ${users_with_intervals_icu}`);
    console.log(`   📈 Integration Rate: ${integration_percentage}%`);
    
  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    
    // Enhanced error handling following project guidelines
    if (error.code === 'ENOTFOUND') {
      console.error('🚨 Cannot connect to VPS database. Check DB_HOST in .env.production.dev');
    } else if (error.code === '28P01') {
      console.error('🚨 Authentication failed. Check DB_USER and DB_PASSWORD');
    } else if (error.code === '42P07') {
      console.error('🚨 Index already exists. This is normal on re-runs.');
    } else if (error.code === '25P02') {
      console.error('🚨 Transaction aborted. Database might be busy.');
    }
    
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Execute migration following School of Sharks conventions
addIntervalsIcuWithOptimizedIndex()
  .then(() => {
    console.log('\n🦈 School of Sharks intervals.icu integration migration completed!');
    console.log('⚡ Database optimized for third-party platform integrations');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });