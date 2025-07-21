import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';
import { User, CreateUserRequest, UserResponse } from '../models/types';

const router = Router();

/**
 * 🦈 School of Sharks - User Registration
 * Create new apex cyclist account
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const {
      email,
      username,
      password,
      firstName,
      lastName,
      fitnessLevel,
      weight,
      height,
      dateOfBirth
    }: CreateUserRequest = req.body;

    // 🛡️ Validation
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, username, and password are required for apex cyclists!'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters for maximum security'
      });
    }

    // 🔍 Check if user already exists
    const existingUserQuery = `
      SELECT id, email, username 
      FROM users 
      WHERE email = $1 OR username = $2
    `;
    const existingUser = await db.query(existingUserQuery, [email, username]);

    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0];
      const field = existing.email === email ? 'email' : 'username';
      return res.status(409).json({
        success: false,
        message: `This ${field} is already taken by another apex cyclist!`
      });
    }

    // 🔒 Hash password for security
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 🦈 Create new apex cyclist
    const insertUserQuery = `
      INSERT INTO users (
        email, 
        username, 
        first_name, 
        last_name, 
        password_hash, 
        cycling_experience, 
        weight_kg, 
        height_cm, 
        date_of_birth
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, uuid, email, username, first_name, last_name, cycling_experience, weight_kg, height_cm, created_at
    `;

    const values = [
      email.toLowerCase().trim(),
      username.trim(),
      firstName?.trim() || null,
      lastName?.trim() || null,
      passwordHash,
      fitnessLevel || 'beginner',
      weight || null,
      height || null,
      dateOfBirth || null
    ];

    const result = await db.query(insertUserQuery, values);
    const newUser = result.rows[0];

    // 🎯 Generate JWT token for immediate login
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        username: newUser.username 
      },
      process.env.JWT_SECRET || 'school_of_sharks_jwt_secret_change_in_production',
      { expiresIn: '7d' }
    );

    // 🏆 Success response
    const userResponse: UserResponse = {
      id: newUser.id,
      uuid: newUser.uuid,
      email: newUser.email,
      username: newUser.username,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      fitnessLevel: newUser.cycling_experience,
      weight: newUser.weight_kg,
      height: newUser.height_cm,
      createdAt: newUser.created_at,
      avatarUrl: undefined // Default avatar can be added later
    };

    res.status(201).json({
      success: true,
      message: '🦈 Welcome to School of Sharks! Your apex cyclist account has been created!',
      data: {
        user: userResponse,
        token,
        expiresIn: '7d'
      }
    });

    // 📊 Log successful registration
    console.log(`🦈 New apex cyclist registered: ${username} (${email})`);

  } catch (error: any) {
    console.error('🚨 Registration failed:', error);
    
    // Handle specific database errors
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        success: false,
        message: 'Email or username already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * 🔐 School of Sharks - User Login
 * Authenticate apex cyclist
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 🛡️ Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // 🔍 Find user by email
    const userQuery = `
      SELECT 
        id, uuid, email, username, first_name, last_name, 
        password_hash, cycling_experience, weight_kg, height_cm, 
        avatar_url, created_at, updated_at
      FROM users 
      WHERE email = $1
    `;
    const userResult = await db.query(userQuery, [email.toLowerCase().trim()]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = userResult.rows[0];

    // 🔒 Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // 🎯 Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        username: user.username 
      },
      process.env.JWT_SECRET || 'school_of_sharks_jwt_secret_change_in_production',
      { expiresIn: '7d' }
    );

    // 🏆 Success response
    const userResponse: UserResponse = {
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      fitnessLevel: user.cycling_experience,
      weight: user.weight_kg,
      height: user.height_cm,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at
    };

    res.json({
      success: true,
      message: `🦈 Welcome back, ${user.username}! Ready to dominate the road?`,
      data: {
        user: userResponse,
        token,
        expiresIn: '7d'
      }
    });

    console.log(`🦈 Apex cyclist logged in: ${user.username} (${user.email})`);

  } catch (error: any) {
    console.error('🚨 Login failed:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * 🚪 School of Sharks - User Logout
 * Sign out apex cyclist (client-side token removal)
 */
router.post('/logout', async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: '🦈 Logged out successfully. Keep training like an apex predator!'
  });
});

export default router;
