import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import { 
  User, 
  CreateUserRequest, 
  UserResponse, 
  UserUpdateRequest,
  UserStats,
  UserGoal,
  UserAchievement,
  UserNotification,
  UserProfile
} from './types';

/**
 * 🦈 Advanced Database Query Functions for School of Sharks
 * High-performance SQL operations for apex cycling predators
 */
export class UserQueries {
  private db: Pool;

  constructor(database: Pool) {
    this.db = database;
  }

  /**
   * 🚀 Create new cycling predator with profile
   */
  async createUserWithProfile(userData: CreateUserRequest, profileData?: Partial<UserProfile>): Promise<UserResponse> {
    const client = await this.db.connect();
    
    try {
      await client.query('BEGIN');

      // Hash password for apex security
      const password_hash = await bcrypt.hash(userData.password, 12);

      // Insert user
      const userQuery = `
        INSERT INTO users (
          email, username, password_hash, first_name, last_name,
          date_of_birth, gender, cycling_experience, weight_kg, height_cm,
          country, city
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, uuid, email, username, first_name, last_name,
                  cycling_experience, subscription_type, apex_score,
                  is_verified, avatar_url, created_at
      `;

      const userValues = [
        userData.email.toLowerCase(),
        userData.username,
        password_hash,
        userData.first_name,
        userData.last_name,
        userData.date_of_birth,
        userData.gender,
        userData.cycling_experience || 'beginner',
        userData.weight_kg,
        userData.height_cm,
        userData.country,
        userData.city
      ];

      const userResult = await client.query(userQuery, userValues);
      const newUser = userResult.rows[0];

      // Create extended profile if provided
      if (profileData) {
        const profileQuery = `
          INSERT INTO user_profiles (
            user_id, vo2_max, lactate_threshold_watts, preferred_cadence,
            bike_fit_data, primary_bike, equipment_list
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;

        const profileValues = [
          newUser.id,
          profileData.vo2_max,
          profileData.lactate_threshold_watts,
          profileData.preferred_cadence,
          profileData.bike_fit_data ? JSON.stringify(profileData.bike_fit_data) : null,
          profileData.primary_bike ? JSON.stringify(profileData.primary_bike) : null,
          JSON.stringify(profileData.equipment_list || [])
        ];

        await client.query(profileQuery, profileValues);
      }

      await client.query('COMMIT');
      return newUser;

    } catch (error: any) {
      await client.query('ROLLBACK');
      if (error.code === '23505') {
        if (error.constraint === 'users_email_key') {
          throw new Error('Email already exists');
        }
        if (error.constraint === 'users_username_key') {
          throw new Error('Username already exists');
        }
      }
      throw new Error(`Failed to create user: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * 🔍 Advanced user search with filters
   */
  async searchUsersAdvanced(filters: {
    searchTerm?: string;
    cycling_experience?: string;
    country?: string;
    subscription_type?: string;
    min_apex_score?: number;
    is_verified?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ users: UserResponse[]; total: number }> {
    
    const conditions: string[] = ['is_active = true', 'deleted_at IS NULL'];
    const values: any[] = [];
    let paramIndex = 1;

    // Build dynamic WHERE conditions
    if (filters.searchTerm) {
      conditions.push(`(username ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex})`);
      values.push(`%${filters.searchTerm}%`);
      paramIndex++;
    }

    if (filters.cycling_experience) {
      conditions.push(`cycling_experience = $${paramIndex}`);
      values.push(filters.cycling_experience);
      paramIndex++;
    }

    if (filters.country) {
      conditions.push(`country = $${paramIndex}`);
      values.push(filters.country);
      paramIndex++;
    }

    if (filters.subscription_type) {
      conditions.push(`subscription_type = $${paramIndex}`);
      values.push(filters.subscription_type);
      paramIndex++;
    }

    if (filters.min_apex_score !== undefined) {
      conditions.push(`apex_score >= $${paramIndex}`);
      values.push(filters.min_apex_score);
      paramIndex++;
    }

    if (filters.is_verified !== undefined) {
      conditions.push(`is_verified = $${paramIndex}`);
      values.push(filters.is_verified);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users WHERE ${whereClause}`;
    const countResult = await this.db.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Get users with pagination
    const usersQuery = `
      SELECT id, uuid, username, first_name, last_name,
             cycling_experience, subscription_type, apex_score,
             is_verified, avatar_url, country, created_at
      FROM users 
      WHERE ${whereClause}
      ORDER BY apex_score DESC, created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    values.push(limit, offset);
    const usersResult = await this.db.query(usersQuery, values);

    return {
      users: usersResult.rows,
      total
    };
  }

  /**
   * 📊 Get comprehensive user statistics
   */
  async getUserStatsDetailed(userId: number): Promise<UserStats & { recent_sessions: any[]; goals_progress: any[] }> {
    const statsQuery = `
      WITH user_stats AS (
        SELECT 
          u.id as user_id,
          u.total_sessions,
          u.total_distance_km,
          u.total_training_hours,
          u.apex_score,
          u.ftp_watts as best_ftp,
          u.last_login_at as last_activity_date,
          CASE 
            WHEN u.total_sessions > 0 THEN (u.total_training_hours * 60 / u.total_sessions)::numeric(10,2)
            ELSE 0 
          END as avg_session_duration,
          CASE 
            WHEN u.total_training_hours > 0 THEN (u.total_distance_km / u.total_training_hours)::numeric(10,2)
            ELSE 0 
          END as avg_speed_kmh,
          CASE 
            WHEN u.apex_score >= 8 THEN 'improving'
            WHEN u.apex_score >= 5 THEN 'stable'
            ELSE 'declining'
          END as improvement_trend,
          (SELECT COUNT(*) + 1 FROM users u2 WHERE u2.apex_score > u.apex_score AND u2.is_active = true) as rank_overall,
          (SELECT COUNT(*) + 1 FROM users u3 WHERE u3.apex_score > u.apex_score AND u3.cycling_experience = u.cycling_experience AND u3.is_active = true) as rank_by_experience
        FROM users u
        WHERE u.id = $1 AND u.is_active = true AND u.deleted_at IS NULL
      ),
      recent_sessions AS (
        SELECT json_agg(
          json_build_object(
            'id', cs.id,
            'distance', cs.distance,
            'duration', cs.duration,
            'session_date', cs.sessiondate,
            'average_speed', cs.averagespeed
          ) ORDER BY cs.sessiondate DESC
        ) as sessions
        FROM cycling_sessions cs 
        WHERE cs.userid = $1 
        ORDER BY cs.sessiondate DESC 
        LIMIT 5
      ),
      goals_progress AS (
        SELECT json_agg(
          json_build_object(
            'id', ug.id,
            'title', ug.title,
            'progress_percentage', CASE 
              WHEN ug.target_value > 0 THEN (ug.current_value / ug.target_value * 100)::numeric(5,2)
              ELSE 0 
            END,
            'status', ug.status
          )
        ) as goals
        FROM user_goals ug 
        WHERE ug.user_id = $1 AND ug.status = 'active'
      )
      SELECT 
        us.*,
        COALESCE(rs.sessions, '[]'::json) as recent_sessions,
        COALESCE(gp.goals, '[]'::json) as goals_progress
      FROM user_stats us
      CROSS JOIN recent_sessions rs
      CROSS JOIN goals_progress gp
    `;

    const result = await this.db.query(statsQuery, [userId]);
    return result.rows[0] || null;
  }

  /**
   * 🎯 Create user goal with validation
   */
  async createUserGoal(goalData: Omit<UserGoal, 'id' | 'created_at' | 'completed_at'>): Promise<UserGoal> {
    // Validate user exists and is active
    const userCheck = await this.db.query(
      'SELECT id FROM users WHERE id = $1 AND is_active = true AND deleted_at IS NULL',
      [goalData.user_id]
    );

    if (userCheck.rows.length === 0) {
      throw new Error('User not found or inactive');
    }

    const query = `
      INSERT INTO user_goals (
        user_id, goal_type, title, description, target_value, 
        current_value, unit, target_date, priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      goalData.user_id,
      goalData.goal_type,
      goalData.title,
      goalData.description,
      goalData.target_value,
      goalData.current_value,
      goalData.unit,
      goalData.target_date,
      goalData.priority
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  /**
   * 🏆 Award achievement to user
   */
  async awardAchievement(achievementData: Omit<UserAchievement, 'id' | 'unlocked_at'>): Promise<UserAchievement> {
    // Check if user already has this achievement
    const existingCheck = await this.db.query(
      'SELECT id FROM user_achievements WHERE user_id = $1 AND achievement_type = $2',
      [achievementData.user_id, achievementData.achievement_type]
    );

    if (existingCheck.rows.length > 0) {
      throw new Error('User already has this achievement');
    }

    const query = `
      INSERT INTO user_achievements (
        user_id, achievement_type, title, description, icon_url,
        badge_color, points_awarded, is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      achievementData.user_id,
      achievementData.achievement_type,
      achievementData.title,
      achievementData.description,
      achievementData.icon_url,
      achievementData.badge_color,
      achievementData.points_awarded,
      achievementData.is_featured
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  /**
   * 🔔 Create user notification
   */
  async createNotification(notificationData: Omit<UserNotification, 'id' | 'created_at' | 'read_at'>): Promise<UserNotification> {
    const query = `
      INSERT INTO user_notifications (
        user_id, notification_type, title, message, action_url,
        is_actionable, priority, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      notificationData.user_id,
      notificationData.notification_type,
      notificationData.title,
      notificationData.message,
      notificationData.action_url,
      notificationData.is_actionable,
      notificationData.priority,
      notificationData.expires_at
    ];

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  /**
   * 📱 Get user notifications with pagination
   */
  async getUserNotifications(
    userId: number, 
    options: { unread_only?: boolean; limit?: number; offset?: number } = {}
  ): Promise<{ notifications: UserNotification[]; unread_count: number; total: number }> {
    
    const { unread_only = false, limit = 20, offset = 0 } = options;
    
    // Base conditions
    const conditions = ['user_id = $1'];
    const values: any[] = [userId];
    let paramIndex = 2;

    if (unread_only) {
      conditions.push('is_read = false');
    }

    // Add expiration check
    conditions.push('(expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)');

    const whereClause = conditions.join(' AND ');

    // Get total and unread counts
    const countsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_read = false THEN 1 END) as unread_count
      FROM user_notifications 
      WHERE ${whereClause}
    `;

    const countsResult = await this.db.query(countsQuery, values);
    const { total, unread_count } = countsResult.rows[0];

    // Get notifications with pagination
    const notificationsQuery = `
      SELECT * FROM user_notifications 
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    values.push(limit, offset);
    const notificationsResult = await this.db.query(notificationsQuery, values);

    return {
      notifications: notificationsResult.rows,
      unread_count: parseInt(unread_count),
      total: parseInt(total)
    };
  }

  /**
   * ✅ Mark notification as read
   */
  async markNotificationAsRead(notificationId: number, userId: number): Promise<boolean> {
    const query = `
      UPDATE user_notifications 
      SET is_read = true, read_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;

    const result = await this.db.query(query, [notificationId, userId]);
    return result.rows.length > 0;
  }

  /**
   * 🏅 Get user leaderboard with detailed stats
   */
  async getDetailedLeaderboard(
    category: 'overall' | 'distance' | 'sessions' | 'experience' = 'overall',
    experience_level?: string,
    limit: number = 10
  ): Promise<UserResponse[]> {
    
    let orderBy = 'apex_score DESC, total_training_hours DESC';
    let conditions = ['is_active = true', 'deleted_at IS NULL'];
    const values: any[] = [];
    let paramIndex = 1;

    // Category-specific ordering
    switch (category) {
      case 'distance':
        orderBy = 'total_distance_km DESC, total_sessions DESC';
        break;
      case 'sessions':
        orderBy = 'total_sessions DESC, total_distance_km DESC';
        break;
      case 'experience':
        if (experience_level) {
          conditions.push(`cycling_experience = $${paramIndex}`);
          values.push(experience_level);
          paramIndex++;
        }
        break;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        id, uuid, username, first_name, last_name, cycling_experience,
        subscription_type, apex_score, avatar_url, created_at,
        total_sessions, total_distance_km, total_training_hours,
        ROW_NUMBER() OVER (ORDER BY ${orderBy}) as rank
      FROM users 
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex}
    `;

    values.push(limit);
    const result = await this.db.query(query, values);
    return result.rows;
  }

  /**
   * 🔄 Update goal progress
   */
  async updateGoalProgress(goalId: number, currentValue: number, userId: number): Promise<UserGoal> {
    const query = `
      UPDATE user_goals 
      SET current_value = $1,
          status = CASE 
            WHEN current_value >= target_value THEN 'completed'
            ELSE status 
          END,
          completed_at = CASE 
            WHEN current_value >= target_value THEN CURRENT_TIMESTAMP
            ELSE completed_at 
          END
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;

    const result = await this.db.query(query, [currentValue, goalId, userId]);
    if (result.rows.length === 0) {
      throw new Error('Goal not found or access denied');
    }

    return result.rows[0];
  }
}

export default UserQueries;
