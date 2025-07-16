import { Router } from 'express';
import cyclingRoutes from './cycling';
import userRoutes from './users';
import trainingRoutes from './training';

const router = Router();

// API version info
router.get('/', (req, res) => {
  res.json({
    name: 'School of Sharks API',
    version: '1.0.0',
    description: 'High-tech AI cycling training platform',
    endpoints: [
      '/api/users - User management',
      '/api/cycling - Cycling data and analytics',
      '/api/training - AI training programs',
    ],
  });
});

// Route modules
router.use('/users', userRoutes);
router.use('/cycling', cyclingRoutes);
router.use('/training', trainingRoutes);

export default router;
