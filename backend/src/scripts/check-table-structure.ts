import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

async function checkTableStructure() {
    console.log('🦈 Checking Actual Users Table Structure\n');

    const pool = new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        user: process.env.DB_USER, // Use goro since permissions are working
        password: process.env.DB_PASSWORD,
        ssl: false,
    });

    try {
        // Get table structure
        console.log('📋 Getting column information...');
        const columns = await pool.query(`
            SELECT 
                column_name,
                data_type,
                character_maximum_length,
                is_nullable,
                column_default
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND table_schema = 'public'
            ORDER BY ordinal_position;
        `);

        console.log('📊 Users Table Structure:');
        console.table(columns.rows);

        // Get table constraints
        console.log('\n🔐 Getting constraints...');
        const constraints = await pool.query(`
            SELECT 
                tc.constraint_name,
                tc.constraint_type,
                ccu.column_name
            FROM information_schema.table_constraints tc
            LEFT JOIN information_schema.constraint_column_usage ccu
                ON tc.constraint_name = ccu.constraint_name
            WHERE tc.table_name = 'users'
            AND tc.table_schema = 'public'
            ORDER BY tc.constraint_type, ccu.column_name;
        `);

        console.log('🔐 Table Constraints:');
        console.table(constraints.rows);

        // Try to get a sample of the table (if any data exists)
        console.log('\n📄 Checking table contents...');
        const sample = await pool.query('SELECT * FROM users LIMIT 1');
        
        if (sample.rows.length > 0) {
            console.log('📊 Sample row:');
            console.log(sample.rows[0]);
        } else {
            console.log('📭 Table is empty (no rows found)');
        }

        // Get table creation info
        console.log('\n🔍 Additional table info...');
        const tableInfo = await pool.query(`
            SELECT 
                schemaname,
                tablename,
                tableowner,
                hasindexes,
                hasrules,
                hastriggers
            FROM pg_tables 
            WHERE tablename = 'users' 
            AND schemaname = 'public';
        `);

        console.log('📋 Table Information:');
        console.table(tableInfo.rows);

    } catch (error) {
        console.error('❌ Error checking table structure:', error);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    checkTableStructure().catch(console.error);
}

export default checkTableStructure;
