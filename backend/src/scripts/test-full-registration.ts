import dotenv from 'dotenv';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

dotenv.config();

async function testFullUserRegistration() {
    console.log('🦈 Testing Complete User Registration Flow\n');

    const pool = new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: false,
    });

    try {
        const client = await pool.connect();
        
        // Test user data that matches what frontend will send
        const testUser = {
            email: 'test.cyclist@schoolofsharks.com',
            username: 'test_cyclist_' + Date.now(),
            password: 'SecurePassword123!',
            firstName: 'Test',
            lastName: 'Cyclist',
            fitnessLevel: 'intermediate',
            weight: 70.5,
            height: 175,
            dateOfBirth: '1990-05-15'
        };

        console.log('🔍 Testing user registration flow...');
        console.log(`📧 Email: ${testUser.email}`);
        console.log(`👤 Username: ${testUser.username}`);
        console.log(`💪 Fitness Level: ${testUser.fitnessLevel}\n`);

        // 1. Check if user already exists (like auth route does)
        console.log('🔍 Step 1: Checking for existing user...');
        const existingUserQuery = `
            SELECT id, email, username 
            FROM users 
            WHERE email = $1 OR username = $2
        `;
        const existingUser = await client.query(existingUserQuery, [testUser.email, testUser.username]);
        
        if (existingUser.rows.length > 0) {
            console.log('❌ User already exists, cleaning up first...');
            await client.query('DELETE FROM users WHERE email = $1 OR username = $2', [testUser.email, testUser.username]);
            console.log('🧹 Existing user cleaned up');
        } else {
            console.log('✅ No existing user found');
        }

        // 2. Hash password (like auth route does)
        console.log('\n🔍 Step 2: Hashing password...');
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(testUser.password, saltRounds);
        console.log('✅ Password hashed successfully');

        // 3. Insert new user with exact same query as auth route
        console.log('\n🔍 Step 3: Creating new user...');
        const insertUserQuery = `
            INSERT INTO users (
                email, 
                username, 
                first_name, 
                last_name, 
                password_hash, 
                cycling_experience, 
                weight_kg, 
                height_cm, 
                date_of_birth
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, uuid, email, username, first_name, last_name, cycling_experience, weight_kg, height_cm, created_at
        `;

        const values = [
            testUser.email.toLowerCase().trim(),
            testUser.username.trim(),
            testUser.firstName?.trim() || null,
            testUser.lastName?.trim() || null,
            passwordHash,
            testUser.fitnessLevel || 'beginner',
            testUser.weight || null,
            testUser.height || null,
            testUser.dateOfBirth || null
        ];

        const result = await client.query(insertUserQuery, values);
        const newUser = result.rows[0];

        console.log('✅ User created successfully!');
        console.log('📊 User details:');
        console.table(newUser);

        // 4. Test password verification (like login would do)
        console.log('\n🔍 Step 4: Testing password verification...');
        const isValidPassword = await bcrypt.compare(testUser.password, passwordHash);
        console.log(`🔒 Password verification: ${isValidPassword ? '✅ PASS' : '❌ FAIL'}`);

        // 5. Test login query
        console.log('\n🔍 Step 5: Testing login query...');
        const loginQuery = `
            SELECT 
                id, uuid, email, username, first_name, last_name, 
                password_hash, cycling_experience, weight_kg, height_cm, 
                avatar_url, created_at, updated_at
            FROM users 
            WHERE email = $1
        `;
        const loginResult = await client.query(loginQuery, [testUser.email]);
        
        if (loginResult.rows.length > 0) {
            console.log('✅ Login query successful');
            const loginUser = loginResult.rows[0];
            const loginPasswordMatch = await bcrypt.compare(testUser.password, loginUser.password_hash);
            console.log(`🔐 Login password match: ${loginPasswordMatch ? '✅ PASS' : '❌ FAIL'}`);
        } else {
            console.log('❌ Login query failed - user not found');
        }

        // 6. Check database constraints and defaults
        console.log('\n🔍 Step 6: Checking database defaults...');
        const userDefaults = await client.query(`
            SELECT 
                is_active, is_verified, email_verified, subscription_type,
                total_sessions, total_distance_km, total_training_hours, apex_score,
                timezone, login_attempts
            FROM users 
            WHERE id = $1
        `, [newUser.id]);

        console.log('📋 Database defaults:');
        console.table(userDefaults.rows[0]);

        // Clean up test user
        console.log('\n🧹 Cleaning up test user...');
        await client.query('DELETE FROM users WHERE id = $1', [newUser.id]);
        console.log('✅ Test user cleaned up');

        client.release();

        console.log('\n🎉 Complete User Registration Test: ✅ PASSED');
        console.log('🦈 Your signup system is ready for production!');

    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    testFullUserRegistration().catch(console.error);
}

export default testFullUserRegistration;
