import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import { 
  User, 
  CreateUserRequest, 
  UserResponse, 
  UserUpdateRequest,
  UserModelInterface,
  UserStats 
} from './types';
import { db as defaultDb } from '../config/database';

/**
 * 🦈 School of Sharks User Management Model
 * High-performance database operations for apex cycling predators
 */
export class UserModel implements UserModelInterface {
  private db: Pool;

  constructor(database?: Pool) {
    this.db = database || defaultDb;
  }

  /**
   * 🚀 Create new cycling predator account
   */
  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    const {
      email,
      username,
      password,
      first_name,
      last_name,
      date_of_birth,
      gender,
      cycling_experience = 'beginner',
      weight_kg,
      height_cm,
      country,
      city
    } = userData;

    // Hash password for apex security
    const password_hash = await bcrypt.hash(password, 12);

    const query = `
      INSERT INTO users (
        email, username, password_hash, first_name, last_name,
        date_of_birth, gender, cycling_experience, weight_kg, height_cm,
        country, city
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, uuid, email, username, first_name, last_name,
                cycling_experience, subscription_type, apex_score,
                is_verified, avatar_url, created_at
    `;

    const values = [
      email, username, password_hash, first_name, last_name,
      date_of_birth, gender, cycling_experience, weight_kg, height_cm,
      country, city
    ];

    try {
      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint violation
        if (error.constraint === 'users_email_key') {
          throw new Error('Email already exists');
        }
        if (error.constraint === 'users_username_key') {
          throw new Error('Username already exists');
        }
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * 🔍 Find user by email for authentication
   */
  async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true AND deleted_at IS NULL';
    const result = await this.db.query(query, [email.toLowerCase()]);
    return result.rows[0] || null;
  }

  /**
   * 🔍 Find user by ID
   */
  async findById(id: number): Promise<UserResponse | null> {
    const query = `
      SELECT id, uuid, email, username, first_name, last_name,
             cycling_experience, subscription_type, apex_score,
             is_verified, avatar_url, created_at
      FROM users 
      WHERE id = $1 AND is_active = true AND deleted_at IS NULL
    `;
    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * 🔍 Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE username = $1 AND is_active = true AND deleted_at IS NULL';
    const result = await this.db.query(query, [username]);
    return result.rows[0] || null;
  }

  /**
   * ✏️ Update user profile
   */
  async updateUser(id: number, userData: UserUpdateRequest): Promise<UserResponse> {
    const setClause: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined) {
        if (typeof value === 'object' && value !== null) {
          setClause.push(`${key} = $${paramIndex}::jsonb`);
          values.push(JSON.stringify(value));
        } else {
          setClause.push(`${key} = $${paramIndex}`);
          values.push(value);
        }
        paramIndex++;
      }
    });

    if (setClause.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const query = `
      UPDATE users 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex} AND is_active = true AND deleted_at IS NULL
      RETURNING id, uuid, email, username, first_name, last_name,
                cycling_experience, subscription_type, apex_score,
                is_verified, avatar_url, created_at
    `;

    const result = await this.db.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('User not found or update failed');
    }
    return result.rows[0];
  }

  /**
   * ⚡ Update user's apex score
   */
  async updateApexScore(userId: number, newScore: number): Promise<void> {
    const query = 'UPDATE users SET apex_score = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    await this.db.query(query, [newScore, userId]);
  }

  /**
   * 📊 Update training metrics
   */
  async updateTrainingMetrics(
    userId: number, 
    sessions: number, 
    distance: number, 
    hours: number
  ): Promise<void> {
    const query = `
      UPDATE users 
      SET total_sessions = total_sessions + $1,
          total_distance_km = total_distance_km + $2,
          total_training_hours = total_training_hours + $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `;
    await this.db.query(query, [sessions, distance, hours, userId]);
  }

  /**
   * 🔒 Verify password for authentication
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * 📧 Email verification
   */
  async verifyEmail(userId: number): Promise<void> {
    const query = `
      UPDATE users 
      SET email_verified = true, verification_token = null, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    await this.db.query(query, [userId]);
  }

  /**
   * 🔄 Update last login
   */
  async updateLastLogin(userId: number): Promise<void> {
    const query = `
      UPDATE users 
      SET last_login_at = CURRENT_TIMESTAMP, login_attempts = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    await this.db.query(query, [userId]);
  }

  /**
   * 🏆 Get leaderboard (top apex cyclists)
   */
  async getApexLeaderboard(limit: number = 10): Promise<UserResponse[]> {
    const query = `
      SELECT id, uuid, username, first_name, last_name,
             cycling_experience, apex_score, avatar_url, created_at
      FROM users 
      WHERE is_active = true AND deleted_at IS NULL
      ORDER BY apex_score DESC, total_training_hours DESC, created_at ASC
      LIMIT $1
    `;
    const result = await this.db.query(query, [limit]);
    return result.rows;
  }

  /**
   * 🗑️ Soft delete user
   */
  async softDeleteUser(userId: number): Promise<void> {
    const query = `
      UPDATE users 
      SET is_active = false, deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    await this.db.query(query, [userId]);
  }

  /**
   * 🔐 Update password
   */
  async updatePassword(userId: number, newPasswordHash: string): Promise<void> {
    const query = `
      UPDATE users 
      SET password_hash = $1, password_reset_token = null, password_reset_expires = null, 
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    await this.db.query(query, [newPasswordHash, userId]);
  }

  /**
   * 🔑 Set password reset token
   */
  async setPasswordResetToken(email: string, token: string, expires: Date): Promise<void> {
    const query = `
      UPDATE users 
      SET password_reset_token = $1, password_reset_expires = $2, updated_at = CURRENT_TIMESTAMP
      WHERE email = $3 AND is_active = true AND deleted_at IS NULL
    `;
    await this.db.query(query, [token, expires, email.toLowerCase()]);
  }

  /**
   * ✅ Validate password reset token
   */
  async validatePasswordResetToken(token: string): Promise<User | null> {
    const query = `
      SELECT * FROM users 
      WHERE password_reset_token = $1 
        AND password_reset_expires > CURRENT_TIMESTAMP 
        AND is_active = true 
        AND deleted_at IS NULL
    `;
    const result = await this.db.query(query, [token]);
    return result.rows[0] || null;
  }

  /**
   * 🔒 Increment login attempts
   */
  async incrementLoginAttempts(email: string): Promise<void> {
    const query = `
      UPDATE users 
      SET login_attempts = login_attempts + 1, updated_at = CURRENT_TIMESTAMP
      WHERE email = $1
    `;
    await this.db.query(query, [email.toLowerCase()]);
  }

  /**
   * 🔓 Reset login attempts
   */
  async resetLoginAttempts(email: string): Promise<void> {
    const query = `
      UPDATE users 
      SET login_attempts = 0, locked_until = null, updated_at = CURRENT_TIMESTAMP
      WHERE email = $1
    `;
    await this.db.query(query, [email.toLowerCase()]);
  }

  /**
   * 🔐 Lock account temporarily
   */
  async lockAccount(email: string, lockUntil: Date): Promise<void> {
    const query = `
      UPDATE users 
      SET locked_until = $1, updated_at = CURRENT_TIMESTAMP
      WHERE email = $2
    `;
    await this.db.query(query, [lockUntil, email.toLowerCase()]);
  }

  /**
   * 📊 Get user statistics
   */
  async getUserStats(userId: number): Promise<UserStats | null> {
    const query = `
      SELECT 
        id as user_id,
        total_sessions,
        total_distance_km,
        total_training_hours,
        CASE 
          WHEN total_sessions > 0 THEN (total_training_hours * 60 / total_sessions)::numeric(10,2)
          ELSE 0 
        END as avg_session_duration,
        CASE 
          WHEN total_training_hours > 0 THEN (total_distance_km / total_training_hours)::numeric(10,2)
          ELSE 0 
        END as avg_speed_kmh,
        ftp_watts as best_ftp,
        apex_score,
        last_login_at as last_activity_date,
        CASE 
          WHEN apex_score >= 8 THEN 'improving'
          WHEN apex_score >= 5 THEN 'stable'
          ELSE 'declining'
        END as improvement_trend
      FROM users 
      WHERE id = $1 AND is_active = true AND deleted_at IS NULL
    `;
    const result = await this.db.query(query, [userId]);
    return result.rows[0] || null;
  }

  /**
   * 🔍 Search users by username or name
   */
  async searchUsers(searchTerm: string, limit: number = 20): Promise<UserResponse[]> {
    const query = `
      SELECT id, uuid, username, first_name, last_name,
             cycling_experience, apex_score, avatar_url, created_at
      FROM users 
      WHERE (username ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1)
        AND is_active = true AND deleted_at IS NULL
      ORDER BY apex_score DESC, username ASC
      LIMIT $2
    `;
    const result = await this.db.query(query, [`%${searchTerm}%`, limit]);
    return result.rows;
  }

  /**
   * 📈 Get users by experience level
   */
  async getUsersByExperience(experience: string, limit: number = 50): Promise<UserResponse[]> {
    const query = `
      SELECT id, uuid, username, first_name, last_name,
             cycling_experience, apex_score, avatar_url, created_at
      FROM users 
      WHERE cycling_experience = $1 AND is_active = true AND deleted_at IS NULL
      ORDER BY apex_score DESC, created_at DESC
      LIMIT $2
    `;
    const result = await this.db.query(query, [experience, limit]);
    return result.rows;
  }

  /**
   * 🔐 Hash password with salt
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  /**
   * 📧 Generate email verification token
   */
  async generateVerificationToken(userId: number): Promise<string> {
    const token = require('crypto').randomBytes(32).toString('hex');
    const query = `
      UPDATE users 
      SET verification_token = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING verification_token
    `;
    
    const result = await this.db.query(query, [token, userId]);
    return result.rows[0].verification_token;
  }

  /**
   * ✅ Verify email with token
   */
  async verifyEmailWithToken(token: string): Promise<User | null> {
    const query = `
      UPDATE users 
      SET email_verified = true, verification_token = null, updated_at = CURRENT_TIMESTAMP
      WHERE verification_token = $1 AND is_active = true AND deleted_at IS NULL
      RETURNING *
    `;
    
    const result = await this.db.query(query, [token]);
    return result.rows[0] || null;
  }

  /**
   * 🔑 Generate password reset token with expiry
   */
  async generatePasswordResetToken(email: string): Promise<string | null> {
    const token = require('crypto').randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour from now
    
    const query = `
      UPDATE users 
      SET password_reset_token = $1, password_reset_expires = $2, updated_at = CURRENT_TIMESTAMP
      WHERE email = $3 AND is_active = true AND deleted_at IS NULL
      RETURNING email
    `;
    
    const result = await this.db.query(query, [token, expires, email.toLowerCase()]);
    return result.rows.length > 0 ? token : null;
  }

  /**
   * 🔄 Reset password with token
   */
  async resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
    const user = await this.validatePasswordResetToken(token);
    if (!user) {
      return false;
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await this.updatePassword(user.id, hashedPassword);
    return true;
  }

  /**
   * 🚫 Check if account is locked
   */
  async isAccountLocked(email: string): Promise<boolean> {
    const query = `
      SELECT locked_until, login_attempts 
      FROM users 
      WHERE email = $1
    `;
    
    const result = await this.db.query(query, [email.toLowerCase()]);
    if (result.rows.length === 0) return false;

    const { locked_until, login_attempts } = result.rows[0];
    
    // Check if account is temporarily locked
    if (locked_until && new Date(locked_until) > new Date()) {
      return true;
    }
    
    // Auto-unlock if lock period has expired
    if (locked_until && new Date(locked_until) <= new Date()) {
      await this.resetLoginAttempts(email);
    }
    
    return false;
  }

  /**
   * 📊 Get platform statistics
   */
  async getPlatformStats(): Promise<{
    total_users: number;
    active_users: number;
    verified_users: number;
    premium_users: number;
    total_sessions: number;
    total_distance: number;
    avg_apex_score: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true AND deleted_at IS NULL THEN 1 END) as active_users,
        COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users,
        COUNT(CASE WHEN subscription_type IN ('premium', 'apex_predator') THEN 1 END) as premium_users,
        SUM(total_sessions) as total_sessions,
        SUM(total_distance_km) as total_distance,
        AVG(apex_score)::numeric(4,2) as avg_apex_score
      FROM users
      WHERE deleted_at IS NULL
    `;
    
    const result = await this.db.query(query);
    return result.rows[0];
  }

  /**
   * 🔄 Bulk update apex scores (for AI processing)
   */
  async bulkUpdateApexScores(updates: Array<{ user_id: number; apex_score: number }>): Promise<number> {
    if (updates.length === 0) return 0;

    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      
      let updatedCount = 0;
      for (const update of updates) {
        const query = `
          UPDATE users 
          SET apex_score = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2 AND is_active = true AND deleted_at IS NULL
        `;
        
        const result = await client.query(query, [update.apex_score, update.user_id]);
        if (result.rowCount && result.rowCount > 0) updatedCount++;
      }
      
      await client.query('COMMIT');
      return updatedCount;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 📈 Get users with recent activity for engagement analysis
   */
  async getUsersWithRecentActivity(days: number = 7, limit: number = 100): Promise<UserResponse[]> {
    const query = `
      SELECT id, uuid, username, first_name, last_name,
             cycling_experience, subscription_type, apex_score,
             is_verified, avatar_url, created_at, last_login_at
      FROM users 
      WHERE is_active = true 
        AND deleted_at IS NULL
        AND last_login_at >= CURRENT_TIMESTAMP - INTERVAL '${days} days'
      ORDER BY last_login_at DESC
      LIMIT $1
    `;
    
    const result = await this.db.query(query, [limit]);
    return result.rows;
  }

  /**
   * ⚠️ Get inactive users for re-engagement campaigns
   */
  async getInactiveUsers(days: number = 30, limit: number = 100): Promise<UserResponse[]> {
    const query = `
      SELECT id, uuid, username, first_name, last_name,
             cycling_experience, subscription_type, apex_score,
             is_verified, avatar_url, created_at, last_login_at
      FROM users 
      WHERE is_active = true 
        AND deleted_at IS NULL
        AND (last_login_at IS NULL OR last_login_at < CURRENT_TIMESTAMP - INTERVAL '${days} days')
        AND email_verified = true
      ORDER BY created_at DESC
      LIMIT $1
    `;
    
    const result = await this.db.query(query, [limit]);
    return result.rows;
  }

  /**
   * 🎯 Get users by subscription expiry for renewal campaigns
   */
  async getUsersNearSubscriptionExpiry(days: number = 7): Promise<UserResponse[]> {
    // This would require a subscription_expires field in the future
    // For now, return premium users as candidates for renewal campaigns
    const query = `
      SELECT id, uuid, username, first_name, last_name,
             cycling_experience, subscription_type, apex_score,
             is_verified, avatar_url, created_at
      FROM users 
      WHERE is_active = true 
        AND deleted_at IS NULL
        AND subscription_type IN ('premium', 'apex_predator')
      ORDER BY created_at ASC
      LIMIT 50
    `;
    
    const result = await this.db.query(query);
    return result.rows;
  }

  /**
   * 🧹 Clean up expired tokens and temporary data
   */
  async cleanupExpiredTokens(): Promise<{ password_reset_tokens: number; verification_tokens: number }> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      
      // Clean expired password reset tokens
      const passwordTokenCleanup = await client.query(`
        UPDATE users 
        SET password_reset_token = null, password_reset_expires = null
        WHERE password_reset_expires < CURRENT_TIMESTAMP
      `);
      
      // Clean old verification tokens (older than 24 hours)
      const verificationTokenCleanup = await client.query(`
        UPDATE users 
        SET verification_token = null
        WHERE verification_token IS NOT NULL 
          AND created_at < CURRENT_TIMESTAMP - INTERVAL '24 hours'
          AND email_verified = false
      `);
      
      await client.query('COMMIT');
      
      return {
        password_reset_tokens: passwordTokenCleanup.rowCount || 0,
        verification_tokens: verificationTokenCleanup.rowCount || 0
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default UserModel;
