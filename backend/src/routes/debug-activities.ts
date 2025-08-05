import { Router, Request, Response } from 'express';
import { db } from '../server';
import fs from 'fs';
import path from 'path';

const router = Router();

// Debug endpoint to create activities table
router.post('/create-activities-table', async (req: Request, res: Response) => {
  try {
    console.log('🦈 Creating activities table...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../models/create_activities_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await db.query(sql);
    
    console.log('✅ Activities table created successfully!');
    
    res.json({
      success: true,
      message: 'Activities table created successfully! 🦈⚡'
    });
    
  } catch (error) {
    console.error('❌ Error creating activities table:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create activities table',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Debug endpoint to check if activities table exists
router.get('/check-activities-table', async (req: Request, res: Response) => {
  try {
    const result = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'activities'
      );
    `);
    
    const exists = result.rows[0].exists;
    
    if (exists) {
      // Get table info
      const tableInfo = await db.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'activities' 
        ORDER BY ordinal_position;
      `);
      
      res.json({
        success: true,
        exists: true,
        message: 'Activities table exists',
        columns: tableInfo.rows
      });
    } else {
      res.json({
        success: true,
        exists: false,
        message: 'Activities table does not exist'
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking activities table:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check activities table',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
