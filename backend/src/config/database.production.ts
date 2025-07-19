import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load production environment - check for .env.production.dev first for local testing
if (process.env.NODE_ENV === 'production' && !process.env.CI) {
  // Try production.dev first for local testing, fallback to production
  try {
    dotenv.config({ path: '.env.production.dev' });
    console.log('🔧 Using .env.production.dev for local production testing');
  } catch {
    dotenv.config({ path: '.env.production' });
    console.log('🔧 Using .env.production for actual production');
  }
} else {
  dotenv.config({ path: '.env.production' });
}

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  max?: number;
  min?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  application_name?: string;
}

/**
 * 🦈 School of Sharks Production Database Configuration
 * Optimized for apex performance on VPS
 */
const getProductionDatabaseConfig = (): DatabaseConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // For production on VPS, use localhost since database is on same server
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      return {
        host: url.hostname === '127.0.0.1' || url.hostname === 'localhost' ? 'localhost' : url.hostname,
        port: parseInt(url.port) || 5432,
        database: url.pathname.slice(1),
        user: url.username,
        password: url.password,
        ssl: false, // No SSL needed for localhost connections
        max: parseInt(process.env.DB_POOL_MAX || '20'),
        min: parseInt(process.env.DB_POOL_MIN || '2'),
        idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
        connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '5000'),
        application_name: 'school_of_sharks_production'
      };
    } catch (error) {
      console.error('🦈 Invalid DATABASE_URL format:', error);
    }
  }
  
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'school_of_sharks',
    user: process.env.DB_USER || 'goro',
    password: process.env.DB_PASSWORD || '',
    ssl: false,
    max: parseInt(process.env.DB_POOL_MAX || '20'),
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
    connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '5000'),
    application_name: 'school_of_sharks_production'
  };
};

const config = getProductionDatabaseConfig();

console.log('🦈 Production Database Configuration:', {
  host: config.host,
  port: config.port,
  database: config.database,
  user: config.user,
  ssl: config.ssl,
  pool_max: config.max,
  pool_min: config.min
});

export const db = new Pool({
  ...config,
  // Production-optimized settings
  statement_timeout: 30000, // 30 second timeout for complex queries
  query_timeout: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

// Connection event handlers for production monitoring
db.on('connect', (client) => {
  console.log('🦈 Production database client connected');
});

db.on('error', (err, client) => {
  console.error('❌ Production database error:', err);
});

db.on('remove', (client) => {
  console.log('🔄 Production database client removed from pool');
});

/**
 * 🦈 Production database health monitoring
 */
export const monitorDatabaseHealth = async () => {
  try {
    const client = await db.connect();
    const result = await client.query(`
      SELECT 
        current_database() as database,
        current_user as user,
        version() as version,
        now() as timestamp,
        (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()) as active_connections,
        (SELECT setting FROM pg_settings WHERE name = 'max_connections') as max_connections
    `);
    
    client.release();
    
    const stats = result.rows[0];
    
    console.log('🦈 Production Database Health Check:');
    console.log(`   ✅ Database: ${stats.database}`);
    console.log(`   👤 User: ${stats.user}`);
    console.log(`   🔗 Active Connections: ${stats.active_connections}/${stats.max_connections}`);
    console.log(`   ⏰ Server Time: ${stats.timestamp}`);
    console.log(`   📊 PostgreSQL: ${stats.version.split(' ')[0]}`);
    
    return {
      connected: true,
      database: stats.database,
      user: stats.user,
      active_connections: stats.active_connections,
      max_connections: stats.max_connections,
      server_time: stats.timestamp,
      version: stats.version.split(' ')[0]
    };
  } catch (error: any) {
    console.error('❌ Production Database Health Check Failed:', error.message);
    return {
      connected: false,
      error: error.message,
      host: config.host,
      database: config.database
    };
  }
};

/**
 * 🦈 Test production database connection with detailed reporting
 */
export const testProductionConnection = async (): Promise<boolean> => {
  try {
    console.log('\n🦈 ================================');
    console.log('   Production Database Test');
    console.log('🦈 ================================');
    
    const client = await db.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    
    console.log('✅ Production Database: CONNECTED');
    console.log(`🎯 Host: ${config.host}:${config.port}/${config.database}`);
    console.log(`👤 User: ${config.user}`);
    console.log(`⏰ Server Time: ${result.rows[0].current_time}`);
    console.log(`📊 PostgreSQL: ${result.rows[0].pg_version.split(' ')[0]}`);
    console.log(`🏊 Pool Size: ${config.min}-${config.max} connections`);
    
    client.release();
    return true;
  } catch (error: any) {
    console.log('\n🦈 ================================');
    console.log('   Production Database FAILED');
    console.log('🦈 ================================');
    console.error(`❌ Error: ${error.message}`);
    console.log(`🏠 Attempted: ${config.host}:${config.port}/${config.database}`);
    console.log(`👤 User: ${config.user}`);
    
    if (process.env.NODE_ENV === 'production') {
      console.error('💀 Production requires database connection. Exiting...');
      
      // Only exit in actual production, not local production testing
      if (process.env.DB_HOST === 'localhost') {
        process.exit(1);
      } else {
        console.warn('⚠️  Local production testing - continuing with fallbacks...');
      }
    }
    
    return false;
  }
};

/**
 * 🦈 Check if database is connected and ready
 */
export const isDatabaseConnected = async (): Promise<boolean> => {
  try {
    const client = await db.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch {
    return false;
  }
};

/**
 * 🦈 Get database connection status for health checks
 */
export const getDatabaseStatus = async () => {
  try {
    const healthData = await monitorDatabaseHealth();
    return healthData;
  } catch (error: any) {
    return {
      connected: false,
      error: error.message,
      host: config.host,
      database: config.database
    };
  }
};

// Test connection on startup
testProductionConnection();

// Monitor database health every 5 minutes in production
if (process.env.NODE_ENV === 'production') {
  setInterval(monitorDatabaseHealth, 5 * 60 * 1000);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🦈 SIGTERM received, closing database pool...');
  db.end(() => {
    console.log('🦈 Production database pool closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🦈 SIGINT received, closing database pool...');
  db.end(() => {
    console.log('🦈 Production database pool closed');
    process.exit(0);
  });
});

export default db;
