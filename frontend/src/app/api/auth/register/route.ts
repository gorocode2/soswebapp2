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

    // Call backend API (adjust URL based on your backend setup)
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    
    const backendResponse = await fetch(`${backendUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const result = await backendResponse.json();

    if (result.success) {
      // Create user session for auto-login after registration
      const response = NextResponse.json({
        success: true,
        message: result.message || '🦈 Welcome to the School of Sharks! Your apex journey begins now!',
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
        error: result.error || 'Registration failed'
      }, { status: 400 });
    }

  } catch (error: unknown) {
    console.error('🚨 Registration API error:', error);
    
    // Fallback for development - simulate successful registration
    if (process.env.NODE_ENV === 'development') {
      const userData = await request.json();
      
      return NextResponse.json({
        success: true,
        message: '🦈 Development registration successful! Welcome to the School of Sharks!',
        data: {
          id: Math.floor(Math.random() * 1000),
          email: userData.email,
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          cycling_experience: userData.cycling_experience || 'beginner',
          subscription_type: 'free',
          apex_score: 5.0,
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
