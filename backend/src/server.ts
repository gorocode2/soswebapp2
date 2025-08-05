import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Import routes
import apiRoutes from './routes/api';
import debugRoutes from './routes/debug';
import debugActivitiesRoutes from './routes/debug-activities';
import workoutLibraryRoutes from './routes/workoutLibrary';
import activitiesRoutes from './routes/activities';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: envFile });

console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔧 Loading config from: ${envFile}`);

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 5000;

// 🦈 Database Configuration
const getDatabaseConfig = () => {
  // Try DATABASE_URL first (preferred)
  if (process.env.DATABASE_URL) {
    console.log(`🔗 Using DATABASE_URL connection`);
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      min: parseInt(process.env.DB_POOL_MIN || '2'),
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
      connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '5000'),
    };
  }
  
  // Fallback to individual DB_* variables
  console.log(`🔗 Using individual DB config`);
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'school_of_sharks',
    user: process.env.DB_USER || 'goro',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: parseInt(process.env.DB_POOL_MAX || '20'),
    min: parseInt(process.env.DB_POOL_MIN || '2'),
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
    connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '5000'),
  };
};

// Database connection
export const db = new Pool(getDatabaseConfig());

// Test database connection with better error handling
const testDatabaseConnection = async () => {
  try {
    const client = await db.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    const { current_time, pg_version } = result.rows[0];
    
    console.log('🦈 ================================');
    console.log('   Database Connection SUCCESS');
    console.log('🦈 ================================');
    console.log(`✅ Connected to PostgreSQL`);
    console.log(`🕐 Server Time: ${current_time}`);
    console.log(`📊 PostgreSQL: ${pg_version.split(' ')[0]}`);
    console.log('🦈 ================================');
    
    client.release();
    return true;
  } catch (err) {
    console.log('🦈 ================================');
    console.log('   Database Connection FAILED');
    console.log('🦈 ================================');
    console.error('❌ Database connection error:', err);
    console.log('🦈 ================================');
    
    if (process.env.NODE_ENV === 'production') {
      console.log('💀 Production requires database connection. Exiting...');
      process.exit(1);
    }
    return false;
  }
};

// Test workout library tables
const testWorkoutLibraryTables = async () => {
  try {
    const client = await db.connect();
    
    // Check if workout library tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'workout%'
      ORDER BY table_name;
    `);
    
    const workoutTables = tablesResult.rows.map(row => row.table_name);
    const expectedTables = [
      'workout_assignments',
      'workout_categories', 
      'workout_execution_results',
      'workout_library',
      'workout_library_categories',
      'workout_segments'
    ];
    
    const missingTables = expectedTables.filter(table => !workoutTables.includes(table));
    
    console.log('🦈 ================================');
    console.log('   Workout Library Tables Check');
    console.log('🦈 ================================');
    
    if (missingTables.length === 0) {
      console.log('✅ All workout library tables found!');
      
      // Get some basic stats
      const statsResult = await client.query(`
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
      
      console.log('📊 Table Statistics:');
      statsResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}: ${row.records} records`);
      });
    } else {
      console.log('⚠️  Missing workout library tables:');
      missingTables.forEach(table => console.log(`   - ${table}`));
      console.log('💡 Run the workout_library_migration.sql script to create these tables');
    }
    
    console.log('🦈 ================================');
    
    client.release();
    return missingTables.length === 0;
  } catch (err) {
    console.log('🦈 ================================');
    console.log('   Workout Library Check FAILED');
    console.log('🦈 ================================');
    console.error('❌ Workout library check error:', err);
    console.log('🦈 ================================');
    return false;
  }
};

// Test database connection and workout library
testDatabaseConnection().then(() => {
  testWorkoutLibraryTables();
});

// 🦈 Security Middleware - Production Grade
if (process.env.NODE_ENV === 'production') {
  // Rate limiting for production
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  app.use(limiter);
  
  // Enhanced security headers for production
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", process.env.CORS_ORIGIN || "https://soscycling.com"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));
} else {
  // Basic helmet for development
  app.use(helmet());
}

app.use(compression()); // Compress responses
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev')); // Logging

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.CORS_ORIGIN || 'https://soscycling.com']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 📊 Welcome endpoint for School of Sharks API
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '🦈 Welcome to School of Sharks API',
    tagline: 'Unleash your inner predator with AI-powered cycling training',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api_health: '/api/health',
      docs: '/api/docs'
    },
    features: [
      '🚴‍♂️ AI-powered cycling analytics',
      '📊 Real-time performance tracking',
      '🎯 Personalized training programs',
      '⚡ Advanced metrics and insights'
    ]
  });
});

// 🦈 Enhanced Health check endpoint for apex performance monitoring
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Test database connection
    const dbResult = await db.query('SELECT NOW() as current_time');
    const dbStatus = dbResult.rows.length > 0 ? 'connected' : 'disconnected';
    
    res.status(200).json({
      status: 'success',
      message: '🦈 School of Sharks API - Apex Performance Ready!',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: dbStatus,
        ai_engine: 'ready',
        analytics: 'operational'
      },
      performance: {
        memory_usage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        memory_limit: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        cpu_load: process.cpuUsage()
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: '🦈 School of Sharks API experiencing issues',
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'development' ? error : 'Service temporarily unavailable'
    });
  }
});

// 🚴‍♂️ API health check (alternative endpoint for nginx routing)
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const dbResult = await db.query('SELECT 1 as test');
    res.status(200).json({
      status: 'apex',
      message: '🦈 Cycling API unleashed and ready to dominate!',
      timestamp: new Date().toISOString(),
      database: dbResult.rows.length > 0 ? 'connected' : 'disconnected',
      endpoints: {
        users: '/api/users',
        cycling: '/api/cycling',
        training: '/api/training',
        workout_library: '/api/workout-library'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'API health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// API routes
app.use('/api', apiRoutes);
app.use('/api/workout-library', workoutLibraryRoutes);
app.use('/api/activities', activitiesRoutes);

// Debug routes (only in development)
if (process.env.NODE_ENV === 'development' || process.env.ENABLE_DEBUG === 'true') {
  app.use('/api/debug', debugRoutes);
  console.log('🔍 Debug routes enabled at /api/debug/*');
}

// 🦈 404 handler for School of Sharks API
app.use('/*', (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: '🦈 Endpoint not found in the School of Sharks!',
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    available_endpoints: [
      '/health - API health check',
      '/api/health - API specific health',
      '/api/users - User management',
      '/api/cycling - Cycling analytics',
      '/api/training - Training programs',
      '/api/workout-library - Workout library system'
    ]
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 School of Sharks API server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
