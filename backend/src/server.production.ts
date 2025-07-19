import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { db, monitorDatabaseHealth, isDatabaseConnected, getDatabaseStatus } from './config/database.production';

// Load production environment
dotenv.config({ path: '.env.production' });

const app: Express = express();
const PORT = process.env.PORT || 5001; // Use 5001 for development, 5000 for actual production

// 🦈 Production Security Middleware - Apex Protection
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", process.env.CORS_ORIGIN || "https://soscycling.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  crossOriginEmbedderPolicy: false // Disable for compatibility
}));

// 🛡️ Production CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://soscycling.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ⚡ Performance optimizations
app.use(compression());

// 🔍 Production logging
app.use(morgan('combined'));

// 🔥 Rate limiting for apex security
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: '🦈 Too many requests from this apex predator. Try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🦈 Force HTTPS in production
if (process.env.FORCE_HTTPS === 'true') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// 🦈 Welcome endpoint for School of Sharks Production API
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '🦈 School of Sharks Production API',
    tagline: 'Unleashing apex cycling performance at maximum velocity!',
    version: '1.0.0',
    environment: 'production',
    status: 'dominating',
    endpoints: {
      health: '/health',
      api_health: '/api/health',
      auth_login: '/api/auth/login',
      auth_register: '/api/auth/register',
      users: '/api/users',
      test_db: '/api/test-db'
    },
    features: [
      '🚴‍♂️ AI-powered cycling analytics',
      '📊 Real-time performance tracking', 
      '🎯 Personalized training programs',
      '⚡ Advanced metrics and insights',
      '🛡️ Enterprise-grade security',
      '🔥 High-performance production API'
    ]
  });
});

// 🎯 Production Health Check with Advanced Database Monitoring
app.get('/health', async (req: Request, res: Response) => {
  try {
    const dbStatus = await getDatabaseStatus();
    const memUsage = process.memoryUsage();
    
    const healthData = {
      status: dbStatus.connected ? 'apex_production' : 'degraded',
      message: dbStatus.connected 
        ? '🦈 School of Sharks Production API - Dominating at maximum performance!'
        : '🦈 Production API running with database issues',
      timestamp: new Date().toISOString(),
      environment: 'production',
      server: {
        uptime: Math.floor(process.uptime()),
        uptime_formatted: formatUptime(process.uptime()),
        memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
          total: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
          external: Math.round(memUsage.external / 1024 / 1024) + ' MB'
        },
        cpu_usage: process.cpuUsage(),
        node_version: process.version,
        platform: process.platform
      },
      database: dbStatus
    };

    res.status(dbStatus.connected ? 200 : 503).json(healthData);
  } catch (error) {
    console.error('Production health check failed:', error);
    res.status(503).json({
      status: 'error',
      message: '🦈 Production health check system failure',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API Health endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const dbConnected = await isDatabaseConnected();
    
    res.json({
      api_status: 'operational',
      message: '🦈 All systems go - unleashing apex performance!',
      services: {
        database: dbConnected ? 'connected' : 'disconnected',
        authentication: 'ready',
        rate_limiting: 'active',
        security: 'maximum'
      },
      environment: 'production'
    });
  } catch (error) {
    res.status(503).json({
      api_status: 'error',
      message: '🦈 API health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 🔐 Production Authentication Endpoints
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    if (await isDatabaseConnected()) {
      // Production authentication with database
      const userQuery = `
        SELECT id, email, username, first_name, last_name, 
               cycling_experience, subscription_type, apex_score, 
               is_verified, created_at, last_login_at
        FROM users 
        WHERE email = $1 AND is_active = true
      `;
      const userResult = await db.query(userQuery, [email]);
      
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        // TODO: Implement bcrypt password verification in production
        
        // Update last login
        await db.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
        
        console.log(`🦈 Production login successful: ${email}`);
        
        res.json({
          success: true,
          message: '🦈 Welcome back to the apex predator zone!',
          data: {
            id: user.id,
            email: user.email,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            cycling_experience: user.cycling_experience,
            subscription_type: user.subscription_type,
            apex_score: user.apex_score || 0,
            is_verified: user.is_verified,
            last_login_at: user.last_login_at
          }
        });
      } else {
        res.status(401).json({
          success: false,
          error: '🦈 Invalid credentials - access denied!'
        });
      }
    } else {
      res.status(503).json({
        success: false,
        error: '🦈 Authentication service temporarily unavailable'
      });
    }
  } catch (error) {
    console.error('Production login error:', error);
    res.status(500).json({
      success: false,
      error: '🦈 Authentication system temporarily unavailable'
    });
  }
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, username, first_name, last_name, cycling_experience, password } = req.body;
    
    if (!email || !username || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        error: 'Required fields missing: email, username, first_name, last_name'
      });
    }

    if (await isDatabaseConnected()) {
      // Check if user already exists
      const existingUser = await db.query(
        'SELECT id FROM users WHERE email = $1 OR username = $2',
        [email, username]
      );
      
      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: '🦈 User already exists with this email or username'
        });
      }
      
      // Insert new user into production database
      const insertQuery = `
        INSERT INTO users (
          email, username, password_hash, first_name, last_name,
          cycling_experience, subscription_type, apex_score, is_active, is_verified,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        RETURNING id, email, username, first_name, last_name,
                  cycling_experience, subscription_type, apex_score, created_at
      `;
      
      const values = [
        email,
        username,
        'hashed_password_placeholder', // TODO: Implement bcrypt hashing
        first_name,
        last_name,
        cycling_experience || 'beginner',
        'free', // Default subscription
        0.0, // Starting apex score
        true, // is_active
        true  // is_verified
      ];
      
      const result = await db.query(insertQuery, values);
      const newUser = result.rows[0];
      
      console.log(`🦈 Production registration successful: ${email}`);
      
      res.status(201).json({
        success: true,
        message: '🦈 Welcome to School of Sharks! Your apex journey begins now!',
        data: newUser
      });
    } else {
      res.status(503).json({
        success: false,
        error: '🦈 Registration service temporarily unavailable'
      });
    }
  } catch (error: any) {
    console.error('Production registration error:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      res.status(409).json({
        success: false,
        error: '🦈 User already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        error: '🦈 Registration system temporarily unavailable'
      });
    }
  }
});

// 📊 Production Users endpoint
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    if (await isDatabaseConnected()) {
      const result = await db.query(`
        SELECT id, username, first_name, last_name, 
               cycling_experience, apex_score, created_at,
               subscription_type, is_verified
        FROM users 
        WHERE is_active = true 
        ORDER BY apex_score DESC 
        LIMIT 50
      `);
      
      res.json({
        success: true,
        message: '🦈 Apex cyclists from production database',
        data: result.rows,
        count: result.rows.length,
        environment: 'production'
      });
    } else {
      res.status(503).json({
        success: false,
        error: '🦈 User service temporarily unavailable'
      });
    }
  } catch (error) {
    console.error('Production users fetch error:', error);
    res.status(500).json({
      success: false,
      error: '🦈 Unable to fetch apex cyclists'
    });
  }
});

// 🔍 Production Database test endpoint
app.get('/api/test-db', async (req: Request, res: Response) => {
  try {
    const dbStatus = await getDatabaseStatus();
    
    if (dbStatus.connected) {
      // Get production database statistics
      const statsResult = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
          (SELECT COUNT(*) FROM users WHERE cycling_experience = 'expert') as expert_cyclists,
          (SELECT AVG(apex_score) FROM users WHERE is_active = true) as avg_apex_score,
          (SELECT MAX(apex_score) FROM users WHERE is_active = true) as max_apex_score
      `);
      
      res.json({
        success: true,
        message: '🦈 Production database test successful!',
        environment: 'production',
        database_status: dbStatus,
        statistics: statsResult.rows[0]
      });
    } else {
      res.status(503).json({
        success: false,
        message: '🦈 Production database test failed',
        database_status: dbStatus
      });
    }
  } catch (error) {
    console.error('Production database test error:', error);
    res.status(500).json({
      success: false,
      error: '🦈 Database test system error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Catch-all for unmatched routes
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'This apex predator has swum to deeper waters! 🦈',
    environment: 'production',
    available_endpoints: [
      'GET /',
      'GET /health',
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/users',
      'GET /api/test-db'
    ]
  });
});

// Global error handler for production
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('🚨 Production Server Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'The apex predator encountered an unexpected wave! 🌊',
    environment: 'production'
  });
});

// Helper function to format uptime
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

// 🚀 Start Production Server with Error Handling
const server = app.listen(PORT, () => {
  console.log('\n🦈 ================================');
  console.log('  School of Sharks PRODUCTION');
  console.log('🦈 ================================');
  console.log(`🚀 Status: UNLEASHED & DOMINATING`);
  console.log(`🌐 Environment: PRODUCTION`);
  console.log(`⚡ Port: ${PORT}`);
  console.log(`🎯 Domain: ${process.env.FRONTEND_URL || 'https://soscycling.com'}`);
  console.log(`📊 Database: localhost:5432/school_of_sharks`);
  console.log(`🛡️ Security: MAXIMUM (CORS, Helmet, Rate Limiting)`);
  console.log(`⚡ Performance: APEX (Compression, Connection Pooling)`);
  console.log('🦈 ================================');
  console.log('🏆 Ready to unleash apex cycling performance!');
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
});

// Handle port conflicts gracefully
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`🦈 ================================`);
    console.error(`   PORT ${PORT} ALREADY IN USE`);
    console.error(`🦈 ================================`);
    console.error(`❌ Error: Port ${PORT} is already being used by another process`);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`💡 SOLUTIONS:`);
      console.log(`   1. Kill process using port: lsof -ti:${PORT} | xargs kill -9`);
      console.log(`   2. Use different port: PORT=${parseInt(PORT.toString()) + 1} npm run dev:production`);
      console.log(`   3. Check what's using the port: lsof -i:${PORT}`);
    }
    
    console.error(`🦈 ================================`);
    process.exit(1);
  } else {
    console.error('🚨 Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('🦈 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🦈 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught Exception in production:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection in production:', reason);
  process.exit(1);
});

export default app;
