import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

async function describeUsersTable() {
    console.log('🦈 Describing Users Table Structure\n');

    const pool = new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        user: 'postgres', // Try with postgres user
        password: process.env.DB_PASSWORD,
        ssl: false,
    });

    try {
        // Get table structure
        const result = await pool.query(`
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

        console.log('📊 Users Table Columns:');
        console.table(result.rows);

        // Also check constraints
        const constraints = await pool.query(`
            SELECT 
                constraint_name,
                constraint_type,
                column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu
                ON tc.constraint_name = ccu.constraint_name
            WHERE tc.table_name = 'users'
            AND tc.table_schema = 'public';
        `);

        console.log('\n🔐 Table Constraints:');
        console.table(constraints.rows);

    } catch (error) {
        console.error('❌ Error describing table:', error);
        
        // If postgres access fails, try with goro but catch permission error
        if (error instanceof Error && error.message.includes('password authentication')) {
            console.log('\n💡 Try running this after granting permissions to goro user');
        }
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    describeUsersTable().catch(console.error);
}

export default describeUsersTable;
