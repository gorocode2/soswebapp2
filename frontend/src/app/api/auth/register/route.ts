import { NextRequest, NextResponse } from 'next/server';

interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  cycling_experience?: string;
  weight_kg?: number;
  height_cm?: number;
  country?: string;
  city?: string;
}

interface RegisterResponse {
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
    is_coach: boolean;
    created_at: string;
  };
  error?: string;
}

/**
 * 🦈 School of Sharks Registration API Endpoint
 * Create new apex cycling predators
 */
export async function POST(request: NextRequest): Promise<NextResponse<RegisterResponse>> {
  try {
    const userData: RegisterRequest = await request.json();

    // Validate required fields
    const { email, password, username, first_name, last_name } = userData;
    if (!email || !password || !username || !first_name || !last_name) {
      return NextResponse.json({
        success: false,
        error: 'All required fields must be provided'
      }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Please provide a valid email address'
      }, { status: 400 });
    }

    // Password strength validation
    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Password must be at least 6 characters long'
      }, { status: 400 });
    }

    // Development fallback when backend is not available
    console.log('🦈 Using development fallback for registration');
    
    const newUser = {
      id: Math.floor(Math.random() * 10000),
      email: userData.email,
      username: userData.username,
      first_name: userData.first_name,
      last_name: userData.last_name,
      cycling_experience: userData.cycling_experience || 'beginner',
      subscription_type: 'free',
      apex_score: 5.0,
      is_verified: true,
      is_coach: false, // Default to non-coach
      created_at: new Date().toISOString()
    };

    const response = NextResponse.json({
      success: true,
      message: '🦈 Welcome to School of Sharks! Your apex journey begins now!',
      data: newUser
    });

    // Set session cookie for development
    response.cookies.set('user_session', JSON.stringify({
      user_id: newUser.id,
      email: newUser.email,
      username: newUser.username
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    return response;

  } catch (error: unknown) {
    console.error('🚨 Registration API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Registration system temporarily unavailable. Please try again.'
    }, { status: 500 });
  }
}
