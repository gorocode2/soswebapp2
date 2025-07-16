#!/bin/bash

echo "🦈 Emergency School of Sharks Route Fix..."

# Navigate to project
cd ~/soswebapp2

# Stop crashing backend
pm2 stop sharks-backend

# Create emergency minimal server
cat > backend/src/server-minimal.ts << 'EOF'
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
    message: '🦈 School of Sharks API - Emergency Mode',
    status: 'operational',
    version: '1.0.0-emergency'
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
      message: '🦈 School of Sharks API - Emergency Mode Ready!',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      services: {
        database: dbStatus,
        mode: 'emergency'
      }
    });
  } catch (error) {
    res.status(200).json({
      status: 'partial',
      message: '🦈 School of Sharks API - Running without database',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        mode: 'emergency'
      }
    });
  }
});

app.get('/api/health', async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'apex',
    message: '🦈 Emergency API unleashed and ready!',
    timestamp: new Date().toISOString(),
    mode: 'emergency'
  });
});

// Basic API endpoints
app.get('/api/users', (req: Request, res: Response) => {
  res.json({ message: 'Users endpoint - Emergency mode' });
});

app.get('/api/cycling', (req: Request, res: Response) => {
  res.json({ message: 'Cycling endpoint - Emergency mode' });
});

app.get('/api/training', (req: Request, res: Response) => {
  res.json({ message: 'Training endpoint - Emergency mode' });
});

// Safe 404 handler - NO WILDCARDS
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: '🦈 Endpoint not found - Emergency mode',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Emergency server error:', err);
  res.status(500).json({
    error: 'Emergency server error',
    message: 'Something went wrong in emergency mode'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🦈 Emergency School of Sharks API running on port ${PORT}`);
  console.log(`🚨 Running in emergency mode - basic functionality only`);
});

export default app;
EOF

# Build emergency server
cd backend
npm run build
cp dist/server.js dist/server-original.js
cp dist/server-minimal.js dist/server.js

# Start emergency server
cd ..
pm2 start backend/dist/server.js --name sharks-backend-emergency

echo "Emergency server started!"
sleep 5
curl -s http://localhost:5000/health | jq -r '.message'
EOF

chmod +x emergency-fix.sh
