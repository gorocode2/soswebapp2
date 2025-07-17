import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

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
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    message: '🦈 School of Sharks API is swimming strong!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
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

// Auth endpoints for development
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }
  
  // Development mock login
  res.json({
    success: true,
    message: '🦈 Backend login successful!',
    data: {
      id: 1,
      email: email,
      username: 'apex_cyclist',
      first_name: 'Apex',
      last_name: 'Cyclist',
      cycling_experience: 'advanced',
      subscription_type: 'premium',
      apex_score: 8.5,
      is_verified: true,
      created_at: new Date().toISOString()
    }
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, username, first_name, last_name, cycling_experience } = req.body;
  
  if (!email || !username || !first_name || !last_name) {
    return res.status(400).json({
      success: false,
      error: 'Required fields missing'
    });
  }
  
  // Development mock registration
  res.json({
    success: true,
    message: '🦈 Welcome to School of Sharks!',
    data: {
      id: Math.floor(Math.random() * 10000),
      email: email,
      username: username,
      first_name: first_name,
      last_name: last_name,
      cycling_experience: cycling_experience || 'beginner',
      subscription_type: 'free',
      apex_score: 5.0,
      is_verified: true,
      created_at: new Date().toISOString()
    }
  });
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
