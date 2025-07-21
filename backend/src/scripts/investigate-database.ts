import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * 🦈 School of Sharks Database Investigation
 * Deep dive into database structure and permissions
 */
class DatabaseInvestigator {
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

    console.log('🦈 Database Investigation Tool');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'school_of_sharks'}`);
    console.log(`   User: ${process.env.DB_USER || 'goro'}`);
    console.log('');
  }

  /**
   * 🔍 Check basic connection and database info
   */
  async checkBasicInfo(): Promise<void> {
    try {
      console.log('🔍 === BASIC DATABASE INFO ===');
      
      const basicQuery = `
        SELECT 
          current_database() as database_name,
          current_user as current_user,
          session_user as session_user,
          current_schema() as current_schema,
          version() as postgresql_version,
          NOW() as current_time
      `;

      const result = await this.db.query(basicQuery);
      const info = result.rows[0];

      console.log(`✅ Database: ${info.database_name}`);
      console.log(`👤 Current User: ${info.current_user}`);
      console.log(`👤 Session User: ${info.session_user}`);
      console.log(`📁 Current Schema: ${info.current_schema}`);
      console.log(`🐘 PostgreSQL: ${info.postgresql_version.split(' ')[0]}`);
      console.log(`⏰ Time: ${info.current_time}`);
      console.log('');

    } catch (error: any) {
      console.error('❌ Failed to get basic info:', error.message);
    }
  }

  /**
   * 🔍 Check all schemas in database
   */
  async checkSchemas(): Promise<void> {
    try {
      console.log('🔍 === DATABASE SCHEMAS ===');
      
      const schemasQuery = `
        SELECT 
          schema_name,
          schema_owner,
          (SELECT COUNT(*) FROM information_schema.tables 
           WHERE table_schema = s.schema_name) as table_count
        FROM information_schema.schemata s
        WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
        ORDER BY schema_name;
      `;

      const result = await this.db.query(schemasQuery);
      
      if (result.rows.length === 0) {
        console.log('❌ No schemas found');
      } else {
        console.log('📋 Available schemas:');
        result.rows.forEach(schema => {
          console.log(`   📁 ${schema.schema_name} (owner: ${schema.schema_owner}, tables: ${schema.table_count})`);
        });
      }
      console.log('');

    } catch (error: any) {
      console.error('❌ Failed to check schemas:', error.message);
    }
  }

  /**
   * 🔍 Check all tables in ALL schemas
   */
  async checkAllTables(): Promise<void> {
    try {
      console.log('🔍 === ALL TABLES IN DATABASE ===');
      
      const tablesQuery = `
        SELECT 
          table_schema,
          table_name,
          table_type,
          (SELECT COUNT(*) FROM information_schema.columns 
           WHERE table_name = t.table_name AND table_schema = t.table_schema) as column_count
        FROM information_schema.tables t
        WHERE table_type = 'BASE TABLE'
        ORDER BY table_schema, table_name;
      `;

      const result = await this.db.query(tablesQuery);
      
      if (result.rows.length === 0) {
        console.log('❌ No tables found in any schema');
      } else {
        console.log(`📋 Found ${result.rows.length} tables:`);
        let currentSchema = '';
        result.rows.forEach(table => {
          if (table.table_schema !== currentSchema) {
            currentSchema = table.table_schema;
            console.log(`\n   📁 Schema: ${currentSchema}`);
          }
          console.log(`      📊 ${table.table_name} (${table.column_count} columns)`);
        });
      }
      console.log('');

    } catch (error: any) {
      console.error('❌ Failed to check all tables:', error.message);
    }
  }

  /**
   * 🔍 Specifically look for users table
   */
  async findUsersTable(): Promise<void> {
    try {
      console.log('🔍 === SEARCHING FOR USERS TABLE ===');
      
      const usersSearchQuery = `
        SELECT 
          table_schema,
          table_name,
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name ILIKE '%user%'
        ORDER BY table_schema, table_name, ordinal_position;
      `;

      const result = await this.db.query(usersSearchQuery);
      
      if (result.rows.length === 0) {
        console.log('❌ No tables with "user" in the name found');
      } else {
        console.log('🎯 Found user-related tables:');
        let currentTable = '';
        result.rows.forEach(col => {
          const tableName = `${col.table_schema}.${col.table_name}`;
          if (tableName !== currentTable) {
            currentTable = tableName;
            console.log(`\n   📊 Table: ${tableName}`);
          }
          console.log(`      🔸 ${col.column_name} (${col.data_type}${col.is_nullable === 'NO' ? ', NOT NULL' : ''})`);
        });
      }
      console.log('');

    } catch (error: any) {
      console.error('❌ Failed to search for users table:', error.message);
    }
  }

  /**
   * 🔍 Check user permissions
   */
  async checkPermissions(): Promise<void> {
    try {
      console.log('🔍 === USER PERMISSIONS ===');
      
      // Check table permissions
      const permissionsQuery = `
        SELECT 
          table_schema,
          table_name,
          privilege_type,
          is_grantable
        FROM information_schema.table_privileges 
        WHERE grantee = current_user
        ORDER BY table_schema, table_name, privilege_type;
      `;

      const result = await this.db.query(permissionsQuery);
      
      if (result.rows.length === 0) {
        console.log('❌ No explicit table permissions found for current user');
      } else {
        console.log(`🔐 Table permissions for user '${process.env.DB_USER}':"`);
        let currentTable = '';
        result.rows.forEach(perm => {
          const tableName = `${perm.table_schema}.${perm.table_name}`;
          if (tableName !== currentTable) {
            currentTable = tableName;
            console.log(`\n   📊 ${tableName}:`);
          }
          console.log(`      ✅ ${perm.privilege_type}${perm.is_grantable === 'YES' ? ' (grantable)' : ''}`);
        });
      }
      console.log('');

    } catch (error: any) {
      console.error('❌ Failed to check permissions:', error.message);
    }
  }

  /**
   * 🔍 Check database roles and membership
   */
  async checkRoles(): Promise<void> {
    try {
      console.log('🔍 === DATABASE ROLES ===');
      
      const rolesQuery = `
        SELECT 
          r.rolname as role_name,
          r.rolsuper as is_superuser,
          r.rolcreaterole as can_create_roles,
          r.rolcreatedb as can_create_db,
          ARRAY(SELECT b.rolname 
                FROM pg_catalog.pg_auth_members m 
                JOIN pg_catalog.pg_roles b ON (m.roleid = b.oid) 
                WHERE m.member = r.oid) as member_of
        FROM pg_catalog.pg_roles r 
        WHERE r.rolname = current_user;
      `;

      const result = await this.db.query(rolesQuery);
      
      if (result.rows.length > 0) {
        const role = result.rows[0];
        console.log(`👤 User: ${role.role_name}`);
        console.log(`🔐 Superuser: ${role.is_superuser ? 'YES' : 'NO'}`);
        console.log(`🏗️ Can create roles: ${role.can_create_roles ? 'YES' : 'NO'}`);
        console.log(`🗄️ Can create databases: ${role.can_create_db ? 'YES' : 'NO'}`);
        console.log(`👥 Member of: ${role.member_of.length > 0 ? role.member_of.join(', ') : 'No groups'}`);
      }
      console.log('');

    } catch (error: any) {
      console.error('❌ Failed to check roles:', error.message);
    }
  }

  /**
   * 🔍 Try different approaches to find tables
   */
  async tryDirectQueries(): Promise<void> {
    try {
      console.log('🔍 === DIRECT TABLE QUERIES ===');
      
      // Try to query pg_tables directly
      console.log('📋 Checking pg_tables:');
      try {
        const pgTablesQuery = `
          SELECT schemaname, tablename, tableowner, hasindexes, hasrules, hastriggers
          FROM pg_tables 
          WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
          ORDER BY schemaname, tablename;
        `;
        
        const result = await this.db.query(pgTablesQuery);
        if (result.rows.length > 0) {
          result.rows.forEach(table => {
            console.log(`   📊 ${table.schemaname}.${table.tablename} (owner: ${table.tableowner})`);
          });
        } else {
          console.log('   ❌ No tables found in pg_tables');
        }
      } catch (error: any) {
        console.log(`   ❌ pg_tables query failed: ${error.message}`);
      }

      console.log('');

      // Try to query a specific users table if it exists
      console.log('🎯 Trying to access users table directly:');
      const testQueries = [
        'SELECT COUNT(*) FROM users;',
        'SELECT COUNT(*) FROM public.users;',
        'SELECT * FROM users LIMIT 1;',
        'SELECT * FROM public.users LIMIT 1;'
      ];

      for (const query of testQueries) {
        try {
          console.log(`   Testing: ${query}`);
          const result = await this.db.query(query);
          console.log(`   ✅ Success! Result:`, result.rows);
          break;
        } catch (error: any) {
          console.log(`   ❌ Failed: ${error.message}`);
        }
      }
      console.log('');

    } catch (error: any) {
      console.error('❌ Direct queries failed:', error.message);
    }
  }

  /**
   * 🚀 Run complete investigation
   */
  async investigate(): Promise<void> {
    try {
      console.log('🦈 ========================================');
      console.log('   School of Sharks Database Investigation');
      console.log('   Finding Hidden Tables & Permissions!');
      console.log('🦈 ========================================\n');

      await this.checkBasicInfo();
      await this.checkSchemas();
      await this.checkAllTables();
      await this.findUsersTable();
      await this.checkPermissions();
      await this.checkRoles();
      await this.tryDirectQueries();

      console.log('🏁 Investigation completed!');
      console.log('🦈 Check the results above to understand your database structure.');
      
    } catch (error: any) {
      console.error('💥 Investigation failed:', error.message);
    } finally {
      await this.db.end();
    }
  }
}

// 🚀 Run investigation if this file is executed directly
if (require.main === module) {
  const investigator = new DatabaseInvestigator();
  investigator.investigate().catch(console.error);
}

export default DatabaseInvestigator;
