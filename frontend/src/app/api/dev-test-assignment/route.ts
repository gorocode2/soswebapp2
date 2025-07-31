import { NextRequest, NextResponse } from 'next/server';

// Development-only route for testing workout assignments
export async function GET(_request: NextRequest) {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, message: 'Not available in production' }, { status: 403 });
  }

  try {
    // First, get available users to use valid IDs
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const usersResponse = await fetch(`${backendUrl}/coach/athletes`);
    const usersResult = await usersResponse.json();
    
    if (!usersResult.success || usersResult.data.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No users found in database'
      });
    }
    
    const users = usersResult.data;
    const testAthlete = users[0]; // Use first user as athlete
    const testCoachId = users.length > 1 ? users[1].id : users[0].id; // Use second user as coach, or same user if only one
    
    // Test assignment data with valid user IDs
    const testAssignment = {
      workout_library_id: 1, // Assuming there's a workout with ID 1
      assigned_to_user_id: testAthlete.id, // Use actual athlete ID
      assigned_by_user_id: testCoachId, // Use actual coach ID
      scheduled_date: '2025-07-29', // Today's date
    };

    console.log('🦈 DEV: Creating test workout assignment:', testAssignment);
    console.log('🦈 DEV: Available users:', users.map((u: { id: number; username: string }) => ({ id: u.id, username: u.username })));

    // Call the backend to create assignment
    const response = await fetch(`${backendUrl}/workout-library/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testAssignment),
    });

    const result = await response.json();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Test workout assignment created successfully!',
        data: {
          assignment: result,
          athlete: testAthlete,
          coach_id: testCoachId
        },
        instructions: 'Now refresh the coach page to see the workout in the calendar.'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to create test assignment',
        error: result.error || result.message,
        debug: {
          assignment_data: testAssignment,
          available_users: users.map((u: { id: number; username: string }) => ({ id: u.id, username: u.username }))
        }
      });
    }

  } catch (error) {
    console.error('❌ Test assignment error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create test assignment: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
