import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * 🦈 School of Sharks Database Connection Manager
 * High-performance PostgreSQL connection pool for apex cycling platform
 */
export class DatabaseConnection {
  private pool: Pool;
  private static instance: DatabaseConnection;

  private constructor() {
    const config: PoolConfig = {
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/school_of_sharks',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      // Connection pool settings for apex performance
      max: 20, // Maximum number of connections
      idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
      connectionTimeoutMillis: 10000, // Connection timeout
      allowExitOnIdle: true
    };

    this.pool = new Pool(config);

    // Handle connection events
    this.pool.on('connect', (client) => {
      console.log('🦈 New database connection established');
    });

    this.pool.on('error', (err, client) => {
      console.error('🚨 Database connection error:', err);
    });

    this.pool.on('remove', (client) => {
      console.log('🔄 Database connection removed from pool');
    });
  }

  /**
   * Get singleton database instance
   */
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Get database pool for queries
   */
  public getPool(): Pool {
    return this.pool;
  }

  /**
   * Test database connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW() as current_time, version() as version');
      client.release();
      console.log('🦈 Database connection successful:', result.rows[0]);
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }

  /**
   * Execute a health check query
   */
  public async healthCheck(): Promise<{ status: string; timestamp: Date; connections: number }> {
    try {
      const client = await this.pool.connect();
      const result = await client.query(`
        SELECT 
          NOW() as timestamp,
          (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database()) as connections
      `);
      client.release();

      return {
        status: 'healthy',
        timestamp: result.rows[0].timestamp,
        connections: parseInt(result.rows[0].connections)
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        connections: 0
      };
    }
  }

  /**
   * Close all database connections
   */
  public async close(): Promise<void> {
    await this.pool.end();
    console.log('🦈 Database connections closed');
  }

  /**
   * Execute transaction with rollback on error
   */
  public async executeTransaction<T>(
    callback: (client: any) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute query with automatic retry
   */
  public async executeWithRetry(
    query: string,
    params: any[] = [],
    maxRetries: number = 3
  ): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.pool.query(query, params);
        return result.rows;
      } catch (error: any) {
        console.warn(`🔄 Query attempt ${attempt} failed:`, error.message);
        if (attempt === maxRetries) {
          throw error;
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    throw new Error('Max retries exceeded');
  }
}

// Export singleton instance
export const db = DatabaseConnection.getInstance();
export default db;
