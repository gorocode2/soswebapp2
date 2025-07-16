import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Import routes
import apiRoutes from './routes/api';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 5000;

// Database connection
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test database connection
db.connect()
  .then(() => console.log('✅ Connected to PostgreSQL database'))
  .catch((err) => console.error('❌ Database connection error:', err));

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan('combined')); // Logging
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
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
        training: '/api/training'
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
      '/api/training - Training programs'
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
