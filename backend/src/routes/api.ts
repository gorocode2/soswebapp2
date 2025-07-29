import { Router } from 'express';
import authRoutes from './auth';
import cyclingRoutes from './cycling';
import userRoutes from './users';
import trainingRoutes from './training';
import coachRoutes from './coach';

const router = Router();

// API version info
router.get('/', (req, res) => {
  res.json({
    name: 'School of Sharks API',
    version: '1.0.0',
    description: 'High-tech AI cycling training platform',
    endpoints: [
      '/api/auth - Authentication and registration',
      '/api/users - User management',
      '/api/cycling - Cycling data and analytics',
      '/api/training - AI training programs',
      '/api/coach - Coach dashboard and athlete management',
    ],
  });
});

// Route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cycling', cyclingRoutes);
router.use('/training', trainingRoutes);
router.use('/coach', coachRoutes);

export default router;
