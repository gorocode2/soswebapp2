import { Pool } from 'pg';
import UserModel from './UserModel';
import { CreateUserRequest } from './types';

/**
 * 🦈 School of Sharks User Model Usage Examples
 * Demonstrates how to use the UserModel for apex cycling platform
 */

// Initialize database connection
const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/school_of_sharks',
  ssl: false,
});

// Initialize UserModel
const userModel = new UserModel(db);

/**
 * 🚀 Example: Create new cycling predator
 */
export async function createNewCyclist() {
  const newUser: CreateUserRequest = {
    email: 'apex.rider@soscycling.com',
    username: 'apex_shark',
    password: 'secure_shark_password_2025',
    first_name: 'Apex',
    last_name: 'Rider',
    cycling_experience: 'advanced',
    weight_kg: 75.5,
    height_cm: 180,
    country: 'United States',
    city: 'San Francisco'
  };

  try {
    const user = await userModel.createUser(newUser);
    console.log('🦈 New cycling predator created:', user);
    return user;
  } catch (error) {
    console.error('❌ Failed to create user:', error);
    throw error;
  }
}

/**
 * 🔐 Example: User authentication
 */
export async function authenticateUser(email: string, password: string) {
  try {
    // Find user by email
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify password
    const isValidPassword = await userModel.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    // Update last login
    await userModel.updateLastLogin(user.id);

    console.log('🦈 User authenticated successfully:', user.email);
    return user;
  } catch (error) {
    console.error('❌ Authentication failed:', error);
    throw error;
  }
}

/**
 * 📊 Example: Update training metrics after session
 */
export async function recordTrainingSession(userId: number, sessionData: {
  distance: number;
  duration: number; // in hours
}) {
  try {
    // Update user training metrics
    await userModel.updateTrainingMetrics(
      userId,
      1, // sessions count
      sessionData.distance,
      sessionData.duration
    );

    // Calculate and update apex score (simplified example)
    const userStats = await userModel.getUserStats(userId);
    if (userStats) {
      const newApexScore = Math.min(10, userStats.total_sessions * 0.1 + userStats.total_distance_km * 0.01);
      await userModel.updateApexScore(userId, parseFloat(newApexScore.toFixed(1)));
    }

    console.log('🦈 Training session recorded successfully');
  } catch (error) {
    console.error('❌ Failed to record session:', error);
    throw error;
  }
}

/**
 * 🏆 Example: Get top performers
 */
export async function getTopCyclists() {
  try {
    const leaderboard = await userModel.getApexLeaderboard(10);
    console.log('🦈 Top 10 Apex Cyclists:');
    leaderboard.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} - Apex Score: ${user.apex_score}`);
    });
    return leaderboard;
  } catch (error) {
    console.error('❌ Failed to get leaderboard:', error);
    throw error;
  }
}

/**
 * ✏️ Example: Update user profile
 */
export async function updateUserProfile(userId: number) {
  try {
    const updatedUser = await userModel.updateUser(userId, {
      weight_kg: 74.0,
      ftp_watts: 285,
      bio: 'Apex predator dominating the cycling world with School of Sharks training!',
      privacy_settings: {
        profile_public: true,
        stats_public: true,
        training_public: false
      }
    });

    console.log('🦈 User profile updated:', updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('❌ Failed to update profile:', error);
    throw error;
  }
}

/**
 * 🔍 Example: Search for cyclists
 */
export async function findCyclists(searchTerm: string) {
  try {
    const users = await userModel.searchUsers(searchTerm, 5);
    console.log(`🦈 Found ${users.length} cyclists matching "${searchTerm}":`, users);
    return users;
  } catch (error) {
    console.error('❌ Search failed:', error);
    throw error;
  }
}

// Export all examples
export default {
  createNewCyclist,
  authenticateUser,
  recordTrainingSession,
  getTopCyclists,
  updateUserProfile,
  findCyclists
};
