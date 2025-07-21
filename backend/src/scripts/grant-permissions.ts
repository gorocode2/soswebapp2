import dotenv from 'dotenv';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

async function grantPermissions() {
    console.log('🦈 School of Sharks - Granting Database Permissions');
    console.log('   Target User: goro');
    console.log('   Database: school_of_sharks\n');

    // Create connection pool as postgres superuser
    const pool = new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        user: 'postgres', // Need superuser to grant permissions
        password: process.env.DB_PASSWORD, // You'll need postgres password
        ssl: false,
    });

    try {
        // Read the SQL file
        const sqlPath = path.join(__dirname, 'grant-permissions.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Extract individual commands (split by semicolon, filter empty)
        const commands = sql
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd && !cmd.startsWith('--') && !cmd.startsWith('/*'));

        console.log('🔧 Executing permission grants...\n');

        for (const command of commands) {
            if (command.includes('SELECT')) {
                // This is the final check query
                console.log('📋 Checking granted permissions:');
                const result = await pool.query(command);
                console.table(result.rows);
            } else {
                // This is a grant command
                console.log(`   ✅ ${command.substring(0, 50)}...`);
                await pool.query(command);
            }
        }

        console.log('\n🎉 All permissions granted successfully!');
        console.log('🦈 User "goro" now has full access to all tables.');

    } catch (error) {
        console.error('❌ Error granting permissions:', error);
        
        if (error instanceof Error && error.message?.includes('password authentication failed')) {
            console.log('\n💡 To fix this issue:');
            console.log('1. Connect to your VPS server');
            console.log('2. Run this command as postgres user:');
            console.log('   sudo -u postgres psql school_of_sharks');
            console.log('3. Then run the SQL commands from grant-permissions.sql');
        }
    } finally {
        await pool.end();
    }
}

// Run the script
if (require.main === module) {
    grantPermissions().catch(console.error);
}

export default grantPermissions;
