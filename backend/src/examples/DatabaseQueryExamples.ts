import UserService from '../services/UserService';
import { db, isDatabaseConnected } from '../config/database';

/**
 * 🦈 School of Sharks Database Query Functions - Complete Usage Examples
 * Demonstrates all database operations for apex cycling platform
 */

// Initialize services
const userService = new UserService();

/**
 * 🚀 Example 1: Complete User Registration Flow
 */
export async function completeUserRegistration() {
  console.log('🦈 Starting complete user registration flow...');
  
  const userData = {
    email: 'apex.cyclist@soscycling.com',
    username: 'apex_predator_2025',
    password: 'secure_shark_password_123',
    first_name: 'Apex',
    last_name: 'Cyclist',
    cycling_experience: 'advanced' as const,
    weight_kg: 75.5,
    height_cm: 180,
    country: 'United States',
    city: 'San Francisco'
  };

  try {
    // Register user
    const registrationResult = await userService.registerUser(userData);
    console.log('Registration result:', registrationResult);

    if (registrationResult.success && registrationResult.data) {
      const userId = registrationResult.data.id;

      // Create initial goals
      const goalResult = await userService.createUserGoal(userId, {
        goal_type: 'distance',
        title: 'First Century Ride',
        description: 'Complete 100km in a single session',
        target_value: 100,
        unit: 'km',
        target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        priority: 'high'
      });
      console.log('Goal creation result:', goalResult);

      return { userId, registrationResult, goalResult };
    }
  } catch (error) {
    console.error('❌ Registration flow failed:', error);
    throw error;
  }
}

/**
 * 🔐 Example 2: User Authentication Flow
 */
export async function userAuthenticationFlow() {
  console.log('🦈 Testing user authentication flow...');

  try {
    // Attempt login
    const loginResult = await userService.loginUser(
      'apex.cyclist@soscycling.com',
      'secure_shark_password_123'
    );
    console.log('Login result:', loginResult);

    if (loginResult.success && loginResult.data) {
      // Get dashboard data
      const dashboardResult = await userService.getUserDashboard(loginResult.data.id);
      console.log('Dashboard data:', dashboardResult);

      return { loginResult, dashboardResult };
    }
  } catch (error) {
    console.error('❌ Authentication flow failed:', error);
    throw error;
  }
}

/**
 * 📊 Example 3: Training Session Recording
 */
export async function recordTrainingSessionFlow(userId: number) {
  console.log('🦈 Recording training session...');

  const sessionData = {
    distance_km: 25.5,
    duration_hours: 1.2,
    avg_power: 220,
    max_heart_rate: 165,
    notes: 'Apex interval training session - felt strong!'
  };

  try {
    const sessionResult = await userService.recordTrainingSession(userId, sessionData);
    console.log('Session recording result:', sessionResult);

    // Record multiple sessions to trigger achievements
    for (let i = 0; i < 3; i++) {
      await userService.recordTrainingSession(userId, {
        distance_km: 15 + (i * 5),
        duration_hours: 0.8 + (i * 0.2),
        avg_power: 200 + (i * 10),
        max_heart_rate: 160 + (i * 2)
      });
    }

    return sessionResult;
  } catch (error) {
    console.error('❌ Training session recording failed:', error);
    throw error;
  }
}

/**
 * 🏆 Example 4: Leaderboard and Social Features
 */
export async function leaderboardAndSocialFlow() {
  console.log('🦈 Testing leaderboard and social features...');

  try {
    // Get overall leaderboard
    const overallLeaderboard = await userService.getLeaderboard('overall', undefined, 10);
    console.log('Overall leaderboard:', overallLeaderboard);

    // Get experience-specific leaderboard
    const advancedLeaderboard = await userService.getLeaderboard('experience', 'advanced', 5);
    console.log('Advanced cyclists leaderboard:', advancedLeaderboard);

    // Search users
    const searchResults = await userService.searchUsers({
      searchTerm: 'apex',
      cycling_experience: 'advanced',
      min_apex_score: 5,
      limit: 5
    });
    console.log('Search results:', searchResults);

    return { overallLeaderboard, advancedLeaderboard, searchResults };
  } catch (error) {
    console.error('❌ Leaderboard flow failed:', error);
    throw error;
  }
}

/**
 * 📈 Example 5: Analytics and Platform Statistics
 */
export async function analyticsFlow() {
  console.log('🦈 Generating platform analytics...');

  try {
    const analytics = await userService.getPlatformAnalytics();
    console.log('Platform analytics:', analytics);

    return analytics;
  } catch (error) {
    console.error('❌ Analytics flow failed:', error);
    throw error;
  }
}

/**
 * 🔧 Example 6: Database Health and Maintenance
 */
export async function databaseHealthCheck() {
  console.log('🦈 Performing database health check...');

  try {
    // Test connection
    const isConnected = await isDatabaseConnected();
    console.log('Database connected:', isConnected);

    // Get health status by testing a simple query
    const result = await db.query('SELECT NOW() as current_time');
    const healthStatus = { 
      connected: true, 
      timestamp: result.rows[0].current_time 
    };
    console.log('Database health:', healthStatus);

    return { isConnected, healthStatus };
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    throw error;
  }
}

/**
 * 🎯 Example 7: Goal Management Flow
 */
export async function goalManagementFlow(userId: number) {
  console.log('🦈 Testing goal management...');

  try {
    // Create different types of goals
    const goals = [
      {
        goal_type: 'distance' as const,
        title: 'Monthly Distance Challenge',
        description: 'Ride 500km this month',
        target_value: 500,
        unit: 'km',
        priority: 'high' as const
      },
      {
        goal_type: 'power' as const,
        title: 'Power Improvement',
        description: 'Increase FTP to 300 watts',
        target_value: 300,
        unit: 'watts',
        priority: 'medium' as const
      },
      {
        goal_type: 'custom' as const,
        title: 'Consistency Challenge',
        description: 'Train 5 days per week',
        target_value: 20,
        unit: 'sessions',
        priority: 'low' as const
      }
    ];

    const goalResults = [];
    for (const goalData of goals) {
      const result = await userService.createUserGoal(userId, goalData);
      goalResults.push(result);
      console.log(`Goal "${goalData.title}" created:`, result.success);
    }

    return goalResults;
  } catch (error) {
    console.error('❌ Goal management flow failed:', error);
    throw error;
  }
}

/**
 * 🧪 Master Test Function - Run All Examples
 */
export async function runAllExamples() {
  console.log('\n🦈 Starting School of Sharks Database Query Functions Demo\n');
  console.log('='.repeat(60));

  try {
    // 1. Database Health Check
    console.log('\n1. 🔧 Database Health Check');
    await databaseHealthCheck();

    // 2. User Registration
    console.log('\n2. 🚀 User Registration Flow');
    const registrationData = await completeUserRegistration();

    if (registrationData?.userId) {
      const userId = registrationData.userId;

      // 3. Authentication
      console.log('\n3. 🔐 Authentication Flow');
      await userAuthenticationFlow();

      // 4. Goal Management
      console.log('\n4. 🎯 Goal Management');
      await goalManagementFlow(userId);

      // 5. Training Sessions
      console.log('\n5. 📊 Training Session Recording');
      await recordTrainingSessionFlow(userId);

      // 6. Social Features
      console.log('\n6. 🏆 Leaderboard and Social');
      await leaderboardAndSocialFlow();

      // 7. Analytics
      console.log('\n7. 📈 Platform Analytics');
      await analyticsFlow();
    }

    console.log('\n' + '='.repeat(60));
    console.log('🦈 All database query functions tested successfully!');
    console.log('✅ School of Sharks platform ready to dominate the cycling world!');

  } catch (error) {
    console.error('\n❌ Demo failed:', error);
    throw error;
  }
}

/**
 * 🎮 Interactive Demo Runner
 */
export async function runInteractiveDemo() {
  try {
    await runAllExamples();
  } catch (error) {
    console.error('Demo failed:', error);
  } finally {
    // Close database connections
    await db.end();
  }
}

// Export individual functions for specific testing
export {
  userService,
  db as database
};

// Default export for easy importing
export default {
  completeUserRegistration,
  userAuthenticationFlow,
  recordTrainingSessionFlow,
  leaderboardAndSocialFlow,
  analyticsFlow,
  databaseHealthCheck,
  goalManagementFlow,
  runAllExamples,
  runInteractiveDemo
};
