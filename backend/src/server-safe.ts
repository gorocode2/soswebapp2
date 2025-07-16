import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 5000;

// Database connection (with fallback)
let db: Pool;
try {
  db = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/school_of_sharks',
    ssl: false,
  });
} catch (error) {
  console.log('Database connection will be mocked');
}

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Welcome endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '🦈 School of Sharks API - Apex Performance Mode',
    status: 'operational',
    version: '1.0.0',
    features: ['Cycling Analytics', 'AI Training', 'Performance Tracking']
  });
});

// Health endpoints
app.get('/health', async (req: Request, res: Response) => {
  try {
    let dbStatus = 'unknown';
    if (db) {
      const dbResult = await db.query('SELECT NOW() as current_time');
      dbStatus = dbResult.rows.length > 0 ? 'connected' : 'disconnected';
    }
    
    res.status(200).json({
      status: 'success',
      message: '🦈 School of Sharks API - Dominating the waters!',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      services: {
        database: dbStatus,
        api: 'operational',
        ai_engine: 'ready'
      },
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'partial',
      message: '🦈 Running on backup power',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        api: 'operational'
      }
    });
  }
});

app.get('/api/health', async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'apex',
    message: '🦈 API unleashed and ready to dominate!',
    timestamp: new Date().toISOString(),
    features: {
      users: 'active',
      cycling: 'tracking',
      training: 'ai_ready'
    }
  });
});

// API Routes - Simple and safe
app.get('/api/users', (req: Request, res: Response) => {
  res.json({
    message: '🦈 Users ready to unleash their inner predator',
    status: 'active',
    features: ['profile_management', 'performance_tracking', 'social_features']
  });
});

app.get('/api/users/profile', (req: Request, res: Response) => {
  res.json({
    message: '🦈 Profile endpoint ready',
    status: 'active'
  });
});

app.get('/api/cycling', (req: Request, res: Response) => {
  res.json({
    message: '🚴‍♂️ Cycling analytics ready to track apex performance',
    status: 'tracking',
    features: ['session_recording', 'performance_analytics', 'route_optimization']
  });
});

app.get('/api/cycling/sessions', (req: Request, res: Response) => {
  res.json({
    message: '🦈 Sessions tracking active',
    status: 'recording',
    sessions: []
  });
});

app.post('/api/cycling/sessions', (req: Request, res: Response) => {
  res.json({
    message: '🦈 Session recorded successfully',
    status: 'success',
    session_id: 'session_' + Date.now()
  });
});

app.get('/api/training', (req: Request, res: Response) => {
  res.json({
    message: '🤖 AI training programs ready to forge apex predators',
    status: 'ai_ready',
    features: ['personalized_training', 'performance_optimization', 'adaptive_coaching']
  });
});

app.get('/api/training/programs', (req: Request, res: Response) => {
  res.json({
    message: '🦈 Training programs ready',
    status: 'active',
    programs: [
      {
        id: 'beginner_shark',
        name: 'Beginner Shark',
        description: 'Start your predator journey',
        duration: '4 weeks'
      },
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Unleash your speed',
        duration: '6 weeks'
      },
      {
        id: 'apex_predator',
        name: 'Apex Predator',
        description: 'Dominate the cycling world',
        duration: '12 weeks'
      }
    ]
  });
});

// Safe 404 handler - NO complex patterns
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: '🦈 Endpoint not found in these waters',
    path: req.originalUrl,
    method: req.method,
    suggestion: 'Check /api/health for available endpoints'
  });
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: '🦈 The shark encountered turbulent waters',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🦈 School of Sharks API dominating port ${PORT}`);
  console.log(`⚡ Ready to unleash apex cycling performance!`);
});

export default app;
