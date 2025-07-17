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

    // Call backend API (adjust URL based on your backend setup)
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    
    const backendResponse = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await backendResponse.json();

    if (result.success) {
      // Create user session
      const response = NextResponse.json({
        success: true,
        message: result.message || '🦈 Welcome back, apex predator!',
        data: result.data
      });

      // Set secure cookie for session
      response.cookies.set('user_session', JSON.stringify({
        user_id: result.data?.id,
        email: result.data?.email,
        username: result.data?.username
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      return response;
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Login failed'
      }, { status: 401 });
    }

  } catch (error: unknown) {
    console.error('🚨 Login API error:', error);
    
    // Fallback for development - simulate successful login
    if (process.env.NODE_ENV === 'development') {
      const { email } = await request.json();
      return NextResponse.json({
        success: true,
        message: '🦈 Development login successful!',
        data: {
          id: 1,
          email: email,
          username: 'dev_user',
          first_name: 'Dev',
          last_name: 'User',
          cycling_experience: 'advanced',
          subscription_type: 'premium',
          apex_score: 8.5,
          is_verified: true,
          created_at: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Network error. Please try again.'
    }, { status: 500 });
  }
}
