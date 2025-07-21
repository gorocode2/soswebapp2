import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface TestResult {
  test: string;
  status: 'success' | 'failed';
  message: string;
  data?: any;
  error?: string;
}

/**
 * 🦈 School of Sharks Database Test Suite
 * Test database connectivity and create apex cyclist sample data
 */
class SchoolOfSharksDBTester {
  private db: Pool;
  private results: TestResult[] = [];

  constructor() {
    // Create database connection with current environment
    this.db = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'school_of_sharks',
      user: process.env.DB_USER || 'goro',
      password: process.env.DB_PASSWORD || '',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    console.log('🦈 Database Configuration:');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.DB_PORT || '5432'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'school_of_sharks'}`);
    console.log(`   User: ${process.env.DB_USER || 'goro'}`);
    console.log('');
  }

  /**
   * 🎯 Test 1: Basic Database Connection
   */
  async testConnection(): Promise<TestResult> {
    try {
      const client = await this.db.connect();
      const result = await client.query(`
        SELECT 
          NOW() as current_time,
          version() as pg_version,
          current_database() as database,
          current_user as user
      `);
      client.release();

      const data = result.rows[0];
      
      return {
        test: 'Database Connection',
        status: 'success',
        message: '🦈 Successfully connected to School of Sharks database!',
        data: {
          current_time: data.current_time,
          postgresql_version: data.pg_version.split(' ')[0],
          database: data.database,
          user: data.user,
          connection_host: process.env.DB_HOST
        }
      };
    } catch (error: any) {
      return {
        test: 'Database Connection',
        status: 'failed',
        message: '❌ Failed to connect to database',
        error: error.message
      };
    }
  }

  /**
   * 🔍 Test 2: Check Users Table Schema
   */
  async testUsersTableSchema(): Promise<TestResult> {
    try {
      const schemaQuery = `
        SELECT 
          column_name, 
          data_type, 
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = 'users' AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;

      const result = await this.db.query(schemaQuery);

      if (result.rows.length === 0) {
        return {
          test: 'Users Table Schema',
          status: 'failed',
          message: '❌ Users table does not exist or is not accessible',
          error: 'Table not found'
        };
      }

      return {
        test: 'Users Table Schema',
        status: 'success',
        message: `🦈 Users table found with ${result.rows.length} columns`,
        data: {
          column_count: result.rows.length,
          columns: result.rows
        }
      };
    } catch (error: any) {
      return {
        test: 'Users Table Schema',
        status: 'failed',
        message: '❌ Failed to check users table schema',
        error: error.message
      };
    }
  }

  /**
   * 📊 Test 3: Check Current User Count
   */
  async testCurrentUserCount(): Promise<TestResult> {
    try {
      const countQuery = `
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as users_last_week,
          COUNT(CASE WHEN email LIKE '%test%' OR email LIKE '%example%' THEN 1 END) as test_users
        FROM users;
      `;

      const result = await this.db.query(countQuery);
      const stats = result.rows[0];

      return {
        test: 'Current User Statistics',
        status: 'success',
        message: `🦈 Current database has ${stats.total_users} total users`,
        data: {
          total_users: parseInt(stats.total_users),
          users_last_week: parseInt(stats.users_last_week),
          test_users: parseInt(stats.test_users)
        }
      };
    } catch (error: any) {
      return {
        test: 'Current User Statistics',
        status: 'failed',
        message: '❌ Failed to get user statistics',
        error: error.message
      };
    }
  }

  /**
   * 📝 Test 4: Create Sample Apex Cyclists
   */
  async createSampleUsers(): Promise<TestResult> {
    try {
      const sampleUsers = [
        {
          email: 'apex.predator@soscycling.com',
          username: 'apex_predator',
          first_name: 'Apex',
          last_name: 'Predator',
          fitness_level: 'advanced',
          weight: 72.5,
          height: 185
        },
        {
          email: 'speed.demon@soscycling.com',
          username: 'speed_demon',
          first_name: 'Speed',
          last_name: 'Demon',
          fitness_level: 'intermediate',
          weight: 68.0,
          height: 175
        },
        {
          email: 'endurance.shark@soscycling.com',
          username: 'endurance_shark',
          first_name: 'Endurance',
          last_name: 'Shark',
          fitness_level: 'advanced',
          weight: 75.0,
          height: 180
        },
        {
          email: 'rookie.cyclist@soscycling.com',
          username: 'rookie_cyclist',
          first_name: 'Rookie',
          last_name: 'Cyclist',
          fitness_level: 'beginner',
          weight: 70.0,
          height: 170
        },
        {
          email: 'pro.racer@soscycling.com',
          username: 'pro_racer',
          first_name: 'Pro',
          last_name: 'Racer',
          fitness_level: 'advanced',
          weight: 65.0,
          height: 178
        }
      ];

      const createdUsers = [];
      const password_hash = await bcrypt.hash('SchoolOfSharks2025!', 12);

      for (const user of sampleUsers) {
        try {
          // Check if user already exists
          const existingUserQuery = `
            SELECT id FROM users WHERE email = $1 OR username = $2
          `;
          const existing = await this.db.query(existingUserQuery, [user.email, user.username]);

          if (existing.rows.length > 0) {
            console.log(`   ⚠️  User ${user.username} already exists, skipping...`);
            continue;
          }

          const insertQuery = `
            INSERT INTO users (
              email, username, password_hash, first_name, last_name,
              fitness_level, weight, height,
              created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
            RETURNING id, email, username, first_name, last_name, created_at;
          `;

          const values = [
            user.email,
            user.username,
            password_hash,
            user.first_name,
            user.last_name,
            user.fitness_level,
            user.weight,
            user.height
          ];

          const result = await this.db.query(insertQuery, values);
          createdUsers.push(result.rows[0]);
          
        } catch (userError: any) {
          console.log(`   ❌ Failed to create user ${user.username}: ${userError.message}`);
        }
      }

      return {
        test: 'Create Sample Users',
        status: 'success',
        message: `🦈 Successfully created ${createdUsers.length} apex cyclists!`,
        data: {
          users_created: createdUsers.length,
          users: createdUsers,
          default_password: 'SchoolOfSharks2025!'
        }
      };
    } catch (error: any) {
      return {
        test: 'Create Sample Users',
        status: 'failed',
        message: '❌ Failed to create sample users',
        error: error.message
      };
    }
  }

  /**
   * 🔍 Test 5: Read and Display All Users
   */
  async testReadAllUsers(): Promise<TestResult> {
    try {
      const selectQuery = `
        SELECT 
          id, email, username, first_name, last_name,
          fitness_level, weight, height, created_at
        FROM users 
        ORDER BY created_at DESC;
      `;

      const result = await this.db.query(selectQuery);

      return {
        test: 'Read All Users',
        status: 'success',
        message: `🦈 Successfully retrieved ${result.rows.length} users from database`,
        data: {
          user_count: result.rows.length,
          users: result.rows
        }
      };
    } catch (error: any) {
      return {
        test: 'Read All Users',
        status: 'failed',
        message: '❌ Failed to read users from database',
        error: error.message
      };
    }
  }

  /**
   * 🚀 Test 6: Test Authentication Simulation
   */
  async testAuthentication(): Promise<TestResult> {
    try {
      // Try to authenticate with one of our sample users
      const testEmail = 'apex.predator@soscycling.com';
      const testPassword = 'SchoolOfSharks2025!';

      const userQuery = `
        SELECT id, email, username, password_hash, first_name, last_name
        FROM users 
        WHERE email = $1
      `;

      const userResult = await this.db.query(userQuery, [testEmail]);

      if (userResult.rows.length === 0) {
        return {
          test: 'Authentication Test',
          status: 'failed',
          message: '❌ Test user not found for authentication',
          error: 'User not found'
        };
      }

      const user = userResult.rows[0];
      const isValidPassword = await bcrypt.compare(testPassword, user.password_hash);

      if (!isValidPassword) {
        return {
          test: 'Authentication Test',
          status: 'failed',
          message: '❌ Password verification failed',
          error: 'Invalid password'
        };
      }

      return {
        test: 'Authentication Test',
        status: 'success',
        message: '🦈 Authentication test successful!',
        data: {
          authenticated_user: {
            id: user.id,
            email: user.email,
            username: user.username,
            full_name: `${user.first_name} ${user.last_name}`
          }
        }
      };
    } catch (error: any) {
      return {
        test: 'Authentication Test',
        status: 'failed',
        message: '❌ Authentication test failed',
        error: error.message
      };
    }
  }

  /**
   * 🧹 Test 7: Database Performance Test
   */
  async testDatabasePerformance(): Promise<TestResult> {
    try {
      const performanceQuery = `
        SELECT 
          pg_size_pretty(pg_database_size(current_database())) as database_size,
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT reltuples::bigint FROM pg_class WHERE relname = 'users') as estimated_users,
          version() as pg_version
      `;

      const result = await this.db.query(performanceQuery);
      const stats = result.rows[0];

      return {
        test: 'Database Performance',
        status: 'success',
        message: '🦈 Database performance metrics retrieved',
        data: {
          database_size: stats.database_size,
          total_users: stats.total_users,
          estimated_users: stats.estimated_users,
          postgresql_version: stats.pg_version.split(' ')[0]
        }
      };
    } catch (error: any) {
      return {
        test: 'Database Performance',
        status: 'failed',
        message: '❌ Failed to get performance metrics',
        error: error.message
      };
    }
  }

  /**
   * 🎯 Run All Tests
   */
  async runAllTests(): Promise<void> {
    console.log('🦈 ========================================');
    console.log('   School of Sharks Database Test Suite');
    console.log('   Testing Apex Database Performance!');
    console.log('🦈 ========================================\n');

    const tests = [
      () => this.testConnection(),
      () => this.testUsersTableSchema(),
      () => this.testCurrentUserCount(),
      () => this.createSampleUsers(),
      () => this.testReadAllUsers(),
      () => this.testAuthentication(),
      () => this.testDatabasePerformance()
    ];

    for (const test of tests) {
      const result = await test();
      this.results.push(result);
      this.displayTestResult(result);
    }

    this.displaySummary();
    await this.db.end();
  }

  /**
   * 🎯 Display individual test result
   */
  private displayTestResult(result: TestResult): void {
    const icon = result.status === 'success' ? '✅' : '❌';
    const color = result.status === 'success' ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';

    console.log(`${icon} ${color}${result.test}${reset}`);
    console.log(`   ${result.message}`);

    if (result.data) {
      console.log(`   📊 Data:`, JSON.stringify(result.data, null, 4));
    }

    if (result.error) {
      console.log(`   🚨 Error: ${result.error}`);
    }

    console.log('');
  }

  /**
   * 📈 Display test summary
   */
  private displaySummary(): void {
    const passed = this.results.filter(r => r.status === 'success').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const total = this.results.length;

    console.log('🦈 ========================================');
    console.log('   Test Summary');
    console.log('🦈 ========================================');
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    console.log(`📊 Success Rate: ${Math.round((passed / total) * 100)}%`);

    if (failed === 0) {
      console.log('\n🏆 All tests passed! Your School of Sharks database is apex-ready!');
      console.log('🚴‍♂️ Your apex cyclists are ready to dominate the digital ocean! 🦈⚡');
    } else {
      console.log('\n⚠️  Some tests failed. Check the errors above and fix issues.');
    }

    console.log('🦈 ========================================\n');
  }
}

// 🚀 Run tests if this file is executed directly
if (require.main === module) {
  const tester = new SchoolOfSharksDBTester();
  tester.runAllTests().catch(console.error);
}

export default SchoolOfSharksDBTester;
