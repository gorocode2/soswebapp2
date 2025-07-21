import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

// 🦈 School of Sharks Database Configuration
const getDatabaseConfig = (): DatabaseConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Use DATABASE_URL if available (Heroku/Railway style)
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      const config = {
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        database: url.pathname.slice(1), // Remove leading slash
        user: url.username,
        password: url.password,
        ssl: isProduction ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      };
      
      console.log(`🔗 Using DATABASE_URL: ${url.hostname}:${config.port}/${config.database}`);
      return config;
    } catch (error) {
      console.error('❌ Invalid DATABASE_URL format:', error);
    }
  }
  
  // Use individual environment variables
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'school_of_sharks',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
  
  console.log(`🔗 Using individual DB config: ${config.host}:${config.port}/${config.database}`);
  return config;
};

// Create connection pool for apex performance 🦈
const config = getDatabaseConfig();

export const db = new Pool(config);

// Connection event handlers
db.on('connect', (client) => {
  console.log('🦈 New database client connected');
});

db.on('error', (err, client) => {
  console.error('❌ Unexpected database error:', err);
});

// Test connection on startup
const testConnection = async (): Promise<void> => {
  try {
    const client = await db.connect();
    
    // Test query to verify connection
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    const { current_time, pg_version } = result.rows[0];
    
    console.log('🦈 ================================');
    console.log('   School of Sharks Database');
    console.log('🦈 ================================');
    console.log(`✅ Status: CONNECTED & READY`);
    console.log(`🏠 Host: ${config.host}:${config.port}`);
    console.log(`🗄️  Database: ${config.database}`);
    console.log(`👤 User: ${config.user}`);
    console.log(`🕐 Server Time: ${current_time}`);
    console.log(`📊 PostgreSQL: ${pg_version.split(' ')[0]}`);
    console.log(`🔒 SSL: ${config.ssl ? 'Enabled' : 'Disabled'}`);
    console.log('🦈 ================================');
    
    client.release();
  } catch (err) {
    console.error('🦈 ================================');
    console.error('   Database Connection FAILED');
    console.error('🦈 ================================');
    console.error('❌ Error:', err instanceof Error ? err.message : 'Unknown error');
    console.error(`🏠 Attempted Host: ${config.host}:${config.port}`);
    console.error(`🗄️  Attempted Database: ${config.database}`);
    console.error(`👤 Attempted User: ${config.user}`);
    console.error('🦈 ================================');
    
    // In development, continue with fallback
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️  Continuing in development mode with database fallbacks...');
      return;
    }
    
    // In production, exit
    console.error('💀 Production requires database connection. Exiting...');
    process.exit(1);
  }
};

// Initialize connection test
testConnection();

// Graceful shutdown
const gracefulShutdown = async (): Promise<void> => {
  console.log('🦈 Shutting down database connections...');
  try {
    await db.end();
    console.log('🦈 Database pool closed gracefully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during database shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Export for use in other modules
export default db;

// Helper function to check if database is connected
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

// Helper function to get database status
export const getDatabaseStatus = async (): Promise<{
  connected: boolean;
  host: string;
  database: string;
  version?: string;
  server_time?: Date;
}> => {
  try {
    const client = await db.connect();
    const result = await client.query('SELECT NOW() as server_time, version() as pg_version');
    client.release();
    
    return {
      connected: true,
      host: config.host,
      database: config.database,
      version: result.rows[0].pg_version.split(' ')[0],
      server_time: result.rows[0].server_time
    };
  } catch (error) {
    return {
      connected: false,
      host: config.host,
      database: config.database
    };
  }
};
