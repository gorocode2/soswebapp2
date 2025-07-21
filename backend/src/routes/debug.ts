import { Router, Request, Response } from 'express';
import { db } from '../config/database';

const router = Router();

/**
 * 🦈 Debug endpoint to check database status
 */
router.get('/database-status', async (req: Request, res: Response) => {
  try {
    // Test database connection
    const connectionTest = await db.query('SELECT NOW() as current_time, current_database() as database_name, current_user as current_user');
    
    // Count users
    const userCount = await db.query('SELECT COUNT(*) as total_users FROM users');
    
    // Get recent registrations
    const recentUsers = await db.query(`
      SELECT id, uuid, email, username, first_name, last_name, cycling_experience, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    // Database configuration info (without sensitive data)
    const dbConfig = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      // Don't expose password
    };

    res.json({
      success: true,
      message: '🦈 Database connection successful',
      database_info: {
        current_time: connectionTest.rows[0].current_time,
        database_name: connectionTest.rows[0].database_name,
        current_user: connectionTest.rows[0].current_user,
        total_users: parseInt(userCount.rows[0].total_users),
        config: dbConfig
      },
      recent_users: recentUsers.rows,
      environment: process.env.NODE_ENV
    });

  } catch (error: any) {
    console.error('🚨 Database debug error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      config: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
      },
      environment: process.env.NODE_ENV
    });
  }
});

/**
 * 🦈 Debug endpoint to test user creation with detailed logging
 */
router.post('/test-user-creation', async (req: Request, res: Response) => {
  try {
    const testUserData = {
      email: `debug.test.${Date.now()}@soscycling.com`,
      username: `debug_user_${Date.now()}`,
      password: 'DebugTest123!',
      first_name: 'Debug',
      last_name: 'Tester',
      cycling_experience: 'intermediate',
      weight_kg: 70,
      height_cm: 175
    };

    console.log('🔍 Debug: Testing user creation with data:', {
      ...testUserData,
      password: '[HIDDEN]'
    });

    // Hash password
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(testUserData.password, 12);

    // Insert user
    const insertUserQuery = `
      INSERT INTO users (
        email, 
        username, 
        first_name, 
        last_name, 
        password_hash, 
        cycling_experience, 
        weight_kg, 
        height_cm
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, uuid, email, username, first_name, last_name, cycling_experience, created_at
    `;

    const values = [
      testUserData.email.toLowerCase().trim(),
      testUserData.username.trim(),
      testUserData.first_name,
      testUserData.last_name,
      passwordHash,
      testUserData.cycling_experience,
      testUserData.weight_kg,
      testUserData.height_cm
    ];

    console.log('🔍 Debug: Executing SQL with values:', {
      query: insertUserQuery,
      values: values.map((v, i) => i === 4 ? '[PASSWORD_HASH]' : v)
    });

    const result = await db.query(insertUserQuery, values);
    const newUser = result.rows[0];

    console.log('🎉 Debug: User created successfully:', newUser);

    res.json({
      success: true,
      message: '🦈 Debug user creation successful',
      user: newUser,
      sql_query: insertUserQuery,
      values_used: values.map((v, i) => i === 4 ? '[PASSWORD_HASH]' : v)
    });

  } catch (error: any) {
    console.error('🚨 Debug user creation failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Debug user creation failed',
      error: error.message,
      stack: error.stack
    });
  }
});

/**
 * 🦈 Debug endpoint to check auth route behavior
 */
router.post('/test-auth-route', async (req: Request, res: Response) => {
  try {
    const testData = req.body;
    
    console.log('🔍 Debug: Received auth test data:', {
      ...testData,
      password: testData.password ? '[HIDDEN]' : 'NOT_PROVIDED'
    });

    // Validate required fields
    const requiredFields = ['email', 'username', 'password'];
    const missingFields = requiredFields.filter(field => !testData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        received_fields: Object.keys(testData),
        missing_fields: missingFields
      });
    }

    // Check for existing user
    const existingUserQuery = `
      SELECT id, email, username 
      FROM users 
      WHERE email = $1 OR username = $2
    `;
    const existingUser = await db.query(existingUserQuery, [testData.email, testData.username]);

    console.log('🔍 Debug: Existing user check:', {
      email: testData.email,
      username: testData.username,
      found: existingUser.rows.length > 0,
      existing_user: existingUser.rows[0]
    });

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
        existing_user: existingUser.rows[0]
      });
    }

    res.json({
      success: true,
      message: '🦈 Auth route test successful - ready for user creation',
      received_data: {
        ...testData,
        password: '[HIDDEN]'
      },
      validation: {
        has_email: !!testData.email,
        has_username: !!testData.username,
        has_password: !!testData.password,
        has_first_name: !!testData.first_name,
        has_last_name: !!testData.last_name
      }
    });

  } catch (error: any) {
    console.error('🚨 Auth route test failed:', error);
    
    res.status(500).json({
      success: false,
      message: 'Auth route test failed',
      error: error.message
    });
  }
});

export default router;
