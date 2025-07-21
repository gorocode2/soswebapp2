import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * 🦈 School of Sharks Database Schema Setup
 * Create tables and initial data for apex cycling platform
 */
class DatabaseSetup {
  private db: Pool;

  constructor() {
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

    console.log('🦈 Database Schema Setup');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'school_of_sharks'}`);
    console.log(`   User: ${process.env.DB_USER || 'goro'}`);
    console.log('');
  }

  /**
   * 🏗️ Create Users Table
   */
  async createUsersTable(): Promise<void> {
    try {
      console.log('🔨 Creating users table...');
      
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          username VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          fitness_level VARCHAR(20) DEFAULT 'beginner',
          weight DECIMAL(5,2),
          height DECIMAL(5,2),
          date_of_birth DATE,
          country VARCHAR(100),
          city VARCHAR(100),
          is_active BOOLEAN DEFAULT true,
          is_verified BOOLEAN DEFAULT false,
          avatar_url TEXT,
          bio TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      await this.db.query(createTableQuery);
      console.log('✅ Users table created successfully!');

      // Create indexes for better performance
      const indexQueries = [
        'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
        'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);',
        'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);',
        'CREATE INDEX IF NOT EXISTS idx_users_fitness_level ON users(fitness_level);'
      ];

      for (const indexQuery of indexQueries) {
        await this.db.query(indexQuery);
      }
      console.log('✅ User table indexes created!');

    } catch (error: any) {
      console.error('❌ Failed to create users table:', error.message);
      throw error;
    }
  }

  /**
   * 🏗️ Create Cycling Sessions Table
   */
  async createCyclingSessionsTable(): Promise<void> {
    try {
      console.log('🔨 Creating cycling_sessions table...');
      
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS cycling_sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          session_name VARCHAR(255),
          session_type VARCHAR(50) DEFAULT 'training',
          distance_km DECIMAL(8,2),
          duration_minutes INTEGER,
          avg_speed_kmh DECIMAL(5,2),
          max_speed_kmh DECIMAL(5,2),
          calories_burned INTEGER,
          elevation_gain_m DECIMAL(8,2),
          avg_heart_rate INTEGER,
          max_heart_rate INTEGER,
          avg_power_watts INTEGER,
          max_power_watts INTEGER,
          route_data JSONB,
          weather_conditions JSONB,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          session_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      await this.db.query(createTableQuery);
      console.log('✅ Cycling sessions table created successfully!');

      // Create indexes
      const indexQueries = [
        'CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON cycling_sessions(user_id);',
        'CREATE INDEX IF NOT EXISTS idx_sessions_date ON cycling_sessions(session_date);',
        'CREATE INDEX IF NOT EXISTS idx_sessions_type ON cycling_sessions(session_type);'
      ];

      for (const indexQuery of indexQueries) {
        await this.db.query(indexQuery);
      }
      console.log('✅ Cycling sessions indexes created!');

    } catch (error: any) {
      console.error('❌ Failed to create cycling_sessions table:', error.message);
      throw error;
    }
  }

  /**
   * 🏗️ Create Training Programs Table
   */
  async createTrainingProgramsTable(): Promise<void> {
    try {
      console.log('🔨 Creating training_programs table...');
      
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS training_programs (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          difficulty_level VARCHAR(20) DEFAULT 'intermediate',
          duration_weeks INTEGER,
          sessions_per_week INTEGER,
          focus_area VARCHAR(100),
          target_fitness_level VARCHAR(20),
          program_data JSONB,
          is_active BOOLEAN DEFAULT true,
          created_by INTEGER REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      await this.db.query(createTableQuery);
      console.log('✅ Training programs table created successfully!');

      // Create indexes
      const indexQueries = [
        'CREATE INDEX IF NOT EXISTS idx_programs_difficulty ON training_programs(difficulty_level);',
        'CREATE INDEX IF NOT EXISTS idx_programs_focus ON training_programs(focus_area);',
        'CREATE INDEX IF NOT EXISTS idx_programs_active ON training_programs(is_active);'
      ];

      for (const indexQuery of indexQueries) {
        await this.db.query(indexQuery);
      }
      console.log('✅ Training programs indexes created!');

    } catch (error: any) {
      console.error('❌ Failed to create training_programs table:', error.message);
      throw error;
    }
  }

  /**
   * 📊 Check Current Schema
   */
  async checkSchema(): Promise<void> {
    try {
      console.log('🔍 Checking current database schema...');
      
      const tablesQuery = `
        SELECT table_name, 
               (SELECT COUNT(*) FROM information_schema.columns 
                WHERE table_name = t.table_name AND table_schema = 'public') as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `;

      const result = await this.db.query(tablesQuery);
      
      console.log('📋 Current tables in database:');
      if (result.rows.length === 0) {
        console.log('   No tables found');
      } else {
        result.rows.forEach(table => {
          console.log(`   ✅ ${table.table_name} (${table.column_count} columns)`);
        });
      }

    } catch (error: any) {
      console.error('❌ Failed to check schema:', error.message);
    }
  }

  /**
   * 🚀 Run Complete Setup
   */
  async setupDatabase(): Promise<void> {
    try {
      console.log('🦈 ========================================');
      console.log('   School of Sharks Database Setup');
      console.log('   Creating Apex Database Schema!');
      console.log('🦈 ========================================\n');

      // Check current schema
      await this.checkSchema();
      console.log('');

      // Create all tables
      await this.createUsersTable();
      console.log('');
      
      await this.createCyclingSessionsTable();
      console.log('');
      
      await this.createTrainingProgramsTable();
      console.log('');

      // Check final schema
      console.log('🔍 Final schema check:');
      await this.checkSchema();
      
      console.log('\n🏆 Database setup completed successfully!');
      console.log('🦈 Your School of Sharks database is ready to dominate! ⚡');
      
    } catch (error: any) {
      console.error('💥 Database setup failed:', error.message);
      throw error;
    } finally {
      await this.db.end();
    }
  }
}

// 🚀 Run setup if this file is executed directly
if (require.main === module) {
  const setup = new DatabaseSetup();
  setup.setupDatabase().catch(console.error);
}

export default DatabaseSetup;
