import { NextRequest, NextResponse } from 'next/server';

// Development-only route for checking database users
export async function GET(request: NextRequest) {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, message: 'Not available in production' }, { status: 403 });
  }

  try {
    // Call the backend to get users
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const response = await fetch(`${backendUrl}/coach/athletes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (result.success) {
      const users = result.data;
      
      return NextResponse.json({
        success: true,
        message: 'Available users in database:',
        data: {
          total_users: users.length,
          users: users.map((user: any) => ({
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }))
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to get users',
        error: result.error || result.message
      });
    }

  } catch (error) {
    console.error('❌ Debug users error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get users: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
