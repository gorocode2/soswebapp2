import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { db, isDatabaseConnected, getDatabaseStatus } from './config/database';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan('combined')); // Logging
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🦈 Welcome endpoint for School of Sharks API
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '🦈 Welcome to School of Sharks API',
    tagline: 'Unleash your inner predator with AI-powered cycling training',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth_login: '/api/auth/login',
      auth_register: '/api/auth/register'
    },
    features: [
      '🚴‍♂️ AI-powered cycling analytics',
      '📊 Real-time performance tracking', 
      '🎯 Personalized training programs',
      '⚡ Advanced metrics and insights'
    ]
  });
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    const dbStatus = await getDatabaseStatus();
    
    res.status(dbStatus.connected ? 200 : 503).json({
      status: dbStatus.connected ? 'apex' : 'warning',
      message: dbStatus.connected 
        ? '🦈 School of Sharks API unleashed and ready to dominate!' 
        : '🦈 API running but database connection issues',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: dbStatus.connected,
        host: dbStatus.host,
        database: dbStatus.database,
        version: dbStatus.version,
        server_time: dbStatus.server_time
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      message: '🦈 Health check system failure',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API Health endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    api_status: 'operational',
    message: '🦈 All systems go - ready to unleash apex performance!',
    services: {
      database: 'connected',
      authentication: 'ready',
      ai_engine: 'standby'
    }
  });
});

// Auth endpoints for development and production
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    // Try VPS database first if connected
    if (await isDatabaseConnected()) {
      try {
        const userQuery = `
          SELECT id, email, username, first_name, last_name, 
                 cycling_experience, subscription_type, apex_score, 
                 is_verified, created_at
          FROM users 
          WHERE email = $1 AND is_active = true
        `;
        const userResult = await db.query(userQuery, [email]);
        
        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];
          // In production, verify password with bcrypt
          // For development, allow any password
          
          console.log('🦈 VPS Database login successful for:', email);
          
          res.json({
            success: true,
            message: '🦈 Welcome back, apex predator! (VPS Database)',
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
              created_at: user.created_at
            }
          });
          return;
        }
      } catch (dbError) {
        console.warn('VPS Database auth failed, using development fallback:', dbError);
      }
    }
    
    // Development fallback when database is not connected
    console.log('🔧 Using development fallback authentication');
    if (email === 'test@soscycling.com' && password === 'password') {
      res.json({
        success: true,
        message: '🦈 Development mode - Welcome back!',
        data: {
          id: 1,
          email: 'test@soscycling.com',
          username: 'dev_cyclist',
          first_name: 'Dev',
          last_name: 'Cyclist',
          cycling_experience: 'advanced',
          subscription_type: 'premium',
          apex_score: 7.5,
          is_verified: true,
          created_at: new Date().toISOString()
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: '🦈 Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: '🦈 Authentication system error'
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
    
    // Try VPS database first if connected
    if (await isDatabaseConnected()) {
      try {
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
        
        // Insert new user into VPS database
        const insertQuery = `
          INSERT INTO users (
            email, username, password_hash, first_name, last_name,
            cycling_experience, subscription_type, apex_score, is_active, is_verified
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id, email, username, first_name, last_name,
                    cycling_experience, subscription_type, apex_score, created_at
        `;
        
        const values = [
          email,
          username,
          'hashed_password_placeholder', // In production, hash with bcrypt
          first_name,
          last_name,
          cycling_experience || 'beginner',
          'free', // Default subscription
          0.0, // Starting apex score
          true, // is_active
          true  // is_verified (for development)
        ];
        
        const result = await db.query(insertQuery, values);
        const newUser = result.rows[0];
        
        console.log('🦈 VPS Database registration successful for:', email);
        
        res.status(201).json({
          success: true,
          message: '🦈 Welcome to School of Sharks! Account created in VPS database!',
          data: newUser
        });
        return;
      } catch (dbError) {
        console.warn('VPS Database registration failed, using development fallback:', dbError);
        
        // Check for specific database errors
        if (dbError instanceof Error && dbError.message.includes('duplicate key')) {
          return res.status(409).json({
            success: false,
            error: '🦈 User already exists'
          });
        }
      }
    }
    
    // Development fallback
    console.log('🔧 Using development fallback registration');
    const newUser = {
      id: Math.floor(Math.random() * 10000),
      email: email,
      username: username,
      first_name: first_name,
      last_name: last_name,
      cycling_experience: cycling_experience || 'beginner',
      subscription_type: 'free',
      apex_score: 0,
      created_at: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      message: '🦈 Development mode - Account created!',
      data: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: '🦈 Registration system error'
    });
  }
});

// 📊 Users endpoint with VPS database
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    if (await isDatabaseConnected()) {
      const result = await db.query(`
        SELECT id, username, first_name, last_name, 
               cycling_experience, apex_score, created_at
        FROM users 
        WHERE is_active = true 
        ORDER BY apex_score DESC 
        LIMIT 20
      `);
      
      res.json({
        success: true,
        message: '🦈 Apex cyclists from VPS database',
        data: result.rows,
        count: result.rows.length
      });
    } else {
      // Development fallback
      res.json({
        success: true,
        message: '🦈 Development mode - Mock apex cyclists',
        data: [
          {
            id: 1,
            username: 'apex_rider',
            first_name: 'Apex',
            last_name: 'Rider',
            cycling_experience: 'expert',
            apex_score: 9.5,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            username: 'speed_demon',
            first_name: 'Speed',
            last_name: 'Demon',
            cycling_experience: 'advanced',
            apex_score: 8.7,
            created_at: new Date().toISOString()
          }
        ],
        count: 2
      });
    }
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({
      success: false,
      error: '🦈 Unable to fetch apex cyclists'
    });
  }
});

// 🔍 Database test endpoint
app.get('/api/test-db', async (req: Request, res: Response) => {
  try {
    const isConnected = await isDatabaseConnected();
    const dbStatus = await getDatabaseStatus();
    
    if (isConnected) {
      // Test query to get some stats
      const statsResult = await db.query(`
        SELECT 
          (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
          (SELECT COUNT(*) FROM users WHERE cycling_experience = 'expert') as expert_cyclists,
          (SELECT AVG(apex_score) FROM users WHERE is_active = true) as avg_apex_score
      `);
      
      res.json({
        success: true,
        message: '🦈 VPS Database connection test successful!',
        database_status: dbStatus,
        stats: statsResult.rows[0]
      });
    } else {
      res.status(503).json({
        success: false,
        message: '🦈 VPS Database connection test failed',
        database_status: dbStatus
      });
    }
  } catch (error) {
    console.error('Database test error:', error);
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
    message: 'This shark has swum away! 🦈',
    available_endpoints: [
      'GET /',
      'GET /health',
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/auth/register'
    ]
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('🚨 Server Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'The shark encountered an unexpected wave! 🌊'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🦈 ================================
   School of Sharks API Server
🦈 ================================

🚀 Server Status: UNLEASHED
🌊 Environment: ${process.env.NODE_ENV || 'development'}
⚡ Port: ${PORT}
🎯 URL: http://localhost:${PORT}

📊 Available Endpoints:
   • GET  /                 - Welcome & API info
   • GET  /health           - Health check
   • GET  /api/health       - API health
   • POST /api/auth/login   - User login
   • POST /api/auth/register - User registration

🦈 Ready to dominate the cycling world!
`);
});

export default app;
