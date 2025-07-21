import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

async function testPermissions() {
    console.log('🦈 Testing Database Permissions');
    console.log('   User: goro');
    console.log('   Database: school_of_sharks\n');

    const pool = new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: false,
    });

    try {
        // Test basic connection
        console.log('🔍 Testing connection...');
        const client = await pool.connect();
        console.log('✅ Connection successful');

        // Test reading from users table
        console.log('\n🔍 Testing users table access...');
        try {
            const result = await client.query('SELECT COUNT(*) as count FROM users');
            console.log(`✅ Users table accessible - Found ${result.rows[0].count} users`);
        } catch (error) {
            console.log('❌ Cannot access users table:', error instanceof Error ? error.message : error);
        }

        // Test inserting a user
        console.log('\n🔍 Testing user insertion...');
        try {
            const testUser = {
                username: 'test_shark_' + Date.now(),
                email: 'test@schoolofsharks.com',
                password_hash: 'test_hash_123',
                first_name: 'Test',
                last_name: 'Shark',
                date_of_birth: '1990-01-01',
                weight_kg: 75.5,
                height_cm: 180,
                cycling_experience: 'intermediate'
            };

            const insertResult = await client.query(`
                INSERT INTO users (username, email, password_hash, first_name, last_name, date_of_birth, weight_kg, height_cm, cycling_experience)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id, uuid, username, email, first_name, last_name
            `, [
                testUser.username,
                testUser.email,
                testUser.password_hash,
                testUser.first_name,
                testUser.last_name,
                testUser.date_of_birth,
                testUser.weight_kg,
                testUser.height_cm,
                testUser.cycling_experience
            ]);

            console.log('✅ User insertion successful!');
            console.log('📊 Created user:', insertResult.rows[0]);

            // Clean up test user
            await client.query('DELETE FROM users WHERE id = $1', [insertResult.rows[0].id]);
            console.log('🧹 Test user cleaned up');

        } catch (error) {
            console.log('❌ Cannot insert user:', error instanceof Error ? error.message : error);
        }

        client.release();

    } catch (error) {
        console.error('❌ Database test failed:', error);
    } finally {
        await pool.end();
    }
}

// Run the script
if (require.main === module) {
    testPermissions().catch(console.error);
}

export default testPermissions;
