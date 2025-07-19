import { Pool } from 'pg';
import { UserModel } from '../models/UserModel';
import UserQueries from '../models/UserQueries';
import { db as defaultDb } from '../config/database';
import {
  User,
  CreateUserRequest,
  UserResponse,
  UserUpdateRequest,
  UserStats,
  UserGoal,
  UserAchievement,
  UserNotification,
  APIResponse
} from '../models/types';

/**
 * 🦈 School of Sharks User Service
 * Comprehensive user management service combining all database operations
 */
export class UserService {
  private userModel: UserModel;
  private userQueries: UserQueries;
  private db: Pool;

  constructor() {
    this.db = defaultDb;
    this.userModel = new UserModel(this.db);
    this.userQueries = new UserQueries(this.db);
  }

  /**
   * 🚀 Register new cycling predator
   */
  async registerUser(userData: CreateUserRequest): Promise<APIResponse<UserResponse>> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return {
          success: false,
          error: 'Invalid email format'
        };
      }

      // Validate password strength
      if (userData.password.length < 8) {
        return {
          success: false,
          error: 'Password must be at least 8 characters long'
        };
      }

      // Create user
      const newUser = await this.userModel.createUser(userData);

      // Generate verification token
      const verificationToken = await this.userModel.generateVerificationToken(newUser.id);

      // Create welcome notification
      await this.userQueries.createNotification({
        user_id: newUser.id,
        notification_type: 'system',
        title: '🦈 Welcome to School of Sharks!',
        message: 'Ready to unleash your inner cycling predator? Start your first training session now!',
        action_url: '/dashboard',
        is_read: false,
        is_actionable: true,
        priority: 'medium'
      });

      return {
        success: true,
        message: '🦈 Cycling predator account created successfully!',
        data: newUser
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to register user'
      };
    }
  }

  /**
   * 🔐 Authenticate user login
   */
  async loginUser(email: string, password: string): Promise<APIResponse<UserResponse>> {
    try {
      // Check if account is locked
      const isLocked = await this.userModel.isAccountLocked(email);
      if (isLocked) {
        return {
          success: false,
          error: 'Account is temporarily locked due to too many failed login attempts'
        };
      }

      // Find user
      const user = await this.userModel.findByEmail(email);
      if (!user) {
        await this.userModel.incrementLoginAttempts(email);
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Verify password
      const isValidPassword = await this.userModel.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        await this.userModel.incrementLoginAttempts(email);
        
        // Lock account after 5 failed attempts
        const attempts = user.login_attempts + 1;
        if (attempts >= 5) {
          const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
          await this.userModel.lockAccount(email, lockUntil);
        }

        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Reset login attempts and update last login
      await this.userModel.resetLoginAttempts(email);
      await this.userModel.updateLastLogin(user.id);

      // Get user response data
      const userResponse = await this.userModel.findById(user.id);

      return {
        success: true,
        message: '🦈 Welcome back, apex predator!',
        data: userResponse!
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  }

  /**
   * 📊 Get comprehensive user dashboard data
   */
  async getUserDashboard(userId: number): Promise<APIResponse<{
    user: UserResponse;
    stats: UserStats;
    recent_notifications: UserNotification[];
    active_goals: UserGoal[];
    recent_achievements: UserAchievement[];
    leaderboard_position: number;
  }>> {
    try {
      // Get user data
      const user = await this.userModel.findById(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Get detailed statistics
      const detailedStats = await this.userQueries.getUserStatsDetailed(userId);
      
      // Get recent notifications
      const notificationsData = await this.userQueries.getUserNotifications(userId, { limit: 5 });
      
      // Get active goals
      const activeGoalsQuery = `
        SELECT * FROM user_goals 
        WHERE user_id = $1 AND status = 'active'
        ORDER BY priority DESC, created_at DESC
        LIMIT 3
      `;
      const activeGoalsResult = await this.db.query(activeGoalsQuery, [userId]);
      
      // Get recent achievements
      const achievementsQuery = `
        SELECT * FROM user_achievements 
        WHERE user_id = $1
        ORDER BY unlocked_at DESC
        LIMIT 3
      `;
      const achievementsResult = await this.db.query(achievementsQuery, [userId]);

      // Get leaderboard position
      const positionQuery = `
        SELECT COUNT(*) + 1 as position
        FROM users 
        WHERE apex_score > (SELECT apex_score FROM users WHERE id = $1)
          AND is_active = true AND deleted_at IS NULL
      `;
      const positionResult = await this.db.query(positionQuery, [userId]);

      return {
        success: true,
        data: {
          user,
          stats: detailedStats,
          recent_notifications: notificationsData.notifications,
          active_goals: activeGoalsResult.rows,
          recent_achievements: achievementsResult.rows,
          leaderboard_position: parseInt(positionResult.rows[0].position)
        }
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get dashboard data'
      };
    }
  }

  /**
   * 🏆 Record training session and update metrics
   */
  async recordTrainingSession(userId: number, sessionData: {
    distance_km: number;
    duration_hours: number;
    avg_power?: number;
    max_heart_rate?: number;
    notes?: string;
  }): Promise<APIResponse<{ new_apex_score: number; achievements_unlocked: UserAchievement[] }>> {
    try {
      // Update training metrics
      await this.userModel.updateTrainingMetrics(
        userId,
        1, // session count
        sessionData.distance_km,
        sessionData.duration_hours
      );

      // Get updated user stats
      const stats = await this.userModel.getUserStats(userId);
      if (!stats) {
        throw new Error('Failed to get user stats');
      }

      // Calculate new apex score (simplified AI scoring)
      let newApexScore = 0;
      const consistencyBonus = Math.min(stats.total_sessions * 0.1, 3); // Max 3 points for consistency
      const distanceBonus = Math.min(stats.total_distance_km * 0.01, 4); // Max 4 points for distance
      const performanceBonus = sessionData.avg_power ? Math.min(sessionData.avg_power * 0.01, 3) : 1; // Max 3 points for power
      
      newApexScore = Math.min(10, consistencyBonus + distanceBonus + performanceBonus);
      
      // Update apex score
      await this.userModel.updateApexScore(userId, parseFloat(newApexScore.toFixed(1)));

      // Check for achievements
      const achievementsUnlocked: UserAchievement[] = [];

      // Distance milestone achievements
      if (stats.total_distance_km >= 100 && stats.total_distance_km - sessionData.distance_km < 100) {
        const achievement = await this.userQueries.awardAchievement({
          user_id: userId,
          achievement_type: 'distance_milestone',
          title: '🚴‍♂️ Century Rider',
          description: 'Completed 100km total distance!',
          badge_color: '#FF6B35',
          points_awarded: 50,
          is_featured: true
        });
        achievementsUnlocked.push(achievement);
      }

      // Session milestone achievements
      if (stats.total_sessions >= 10 && stats.total_sessions - 1 < 10) {
        const achievement = await this.userQueries.awardAchievement({
          user_id: userId,
          achievement_type: 'consistency',
          title: '🦈 Consistent Predator',
          description: 'Completed 10 training sessions!',
          badge_color: '#007ACC',
          points_awarded: 25,
          is_featured: false
        });
        achievementsUnlocked.push(achievement);
      }

      // Create session completion notification
      await this.userQueries.createNotification({
        user_id: userId,
        notification_type: 'achievement',
        title: '🎯 Training Session Complete!',
        message: `Apex session recorded: ${sessionData.distance_km}km in ${sessionData.duration_hours}h. New Apex Score: ${newApexScore}`,
        is_read: false,
        is_actionable: false,
        priority: 'medium'
      });

      return {
        success: true,
        message: '🦈 Training session recorded successfully!',
        data: {
          new_apex_score: newApexScore,
          achievements_unlocked: achievementsUnlocked
        }
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to record training session'
      };
    }
  }

  /**
   * 🎯 Create and track user goal
   */
  async createUserGoal(userId: number, goalData: {
    goal_type: 'distance' | 'time' | 'power' | 'weight_loss' | 'event_preparation' | 'custom';
    title: string;
    description?: string;
    target_value: number;
    unit: string;
    target_date?: Date;
    priority?: 'low' | 'medium' | 'high';
  }): Promise<APIResponse<UserGoal>> {
    try {
      const goal = await this.userQueries.createUserGoal({
        user_id: userId,
        goal_type: goalData.goal_type,
        title: goalData.title,
        description: goalData.description,
        target_value: goalData.target_value,
        current_value: 0,
        unit: goalData.unit,
        target_date: goalData.target_date,
        status: 'active',
        priority: goalData.priority || 'medium'
      });

      // Create goal notification
      await this.userQueries.createNotification({
        user_id: userId,
        notification_type: 'goal_reminder',
        title: '🎯 New Goal Set!',
        message: `Your new goal "${goalData.title}" is ready to conquer!`,
        action_url: '/goals',
        is_read: false,
        is_actionable: true,
        priority: 'medium'
      });

      return {
        success: true,
        message: '🎯 Goal created successfully!',
        data: goal
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create goal'
      };
    }
  }

  /**
   * 🏆 Get leaderboard with filters
   */
  async getLeaderboard(
    category: 'overall' | 'distance' | 'sessions' | 'experience' = 'overall',
    experience_level?: string,
    limit: number = 10
  ): Promise<APIResponse<UserResponse[]>> {
    try {
      const leaderboard = await this.userQueries.getDetailedLeaderboard(category, experience_level, limit);

      return {
        success: true,
        message: '🏆 Apex predators leaderboard ready!',
        data: leaderboard
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get leaderboard'
      };
    }
  }

  /**
   * 🔍 Search users with advanced filters
   */
  async searchUsers(filters: {
    searchTerm?: string;
    cycling_experience?: string;
    country?: string;
    subscription_type?: string;
    min_apex_score?: number;
    is_verified?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<APIResponse<{ users: UserResponse[]; total: number }>> {
    try {
      const results = await this.userQueries.searchUsersAdvanced(filters);

      return {
        success: true,
        message: `🔍 Found ${results.total} cycling predators!`,
        data: results
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Search failed'
      };
    }
  }

  /**
   * 📊 Get platform analytics for admin
   */
  async getPlatformAnalytics(): Promise<APIResponse<any>> {
    try {
      const stats = await this.userModel.getPlatformStats();
      
      // Get recent activity
      const recentUsers = await this.userModel.getUsersWithRecentActivity(7, 10);
      const inactiveUsers = await this.userModel.getInactiveUsers(30, 10);

      return {
        success: true,
        data: {
          platform_stats: stats,
          recent_active_users: recentUsers,
          inactive_users_count: inactiveUsers.length,
          growth_metrics: {
            // These would be calculated from historical data
            weekly_signups: 0,
            monthly_signups: 0,
            retention_rate: 0
          }
        }
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get analytics'
      };
    }
  }
}

export default UserService;
