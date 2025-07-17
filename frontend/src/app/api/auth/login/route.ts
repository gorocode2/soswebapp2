import { NextRequest, NextResponse } from 'next/server';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    cycling_experience: string;
    subscription_type: string;
    apex_score: number;
    is_verified: boolean;
    created_at: string;
  };
  error?: string;
}

/**
 * 🦈 School of Sharks Login API Endpoint
 * Authenticate apex cycling predators
 */
export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse>> {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }

    // Development fallback - simulate successful login
    console.log('🦈 Using development fallback for login');
    
    const response = NextResponse.json({
      success: true,
      message: '🦈 Welcome back, apex predator! (Development mode)',
      data: {
        id: 1,
        email: email,
        username: 'apex_cyclist',
        first_name: 'Apex',
        last_name: 'Cyclist',
        cycling_experience: 'advanced',
        subscription_type: 'premium',
        apex_score: 8.5,
        is_verified: true,
        created_at: new Date().toISOString()
      }
    });

    // Set session cookie for development
    response.cookies.set('user_session', JSON.stringify({
      user_id: 1,
      email: email,
      username: 'apex_cyclist'
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return response;

  } catch (error: unknown) {
    console.error('🚨 Login API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Authentication system temporarily unavailable. Please try again.'
    }, { status: 500 });
  }
}
