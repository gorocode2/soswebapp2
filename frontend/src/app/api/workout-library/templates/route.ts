import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export async function GET(request: NextRequest) {
  try {
    console.log('🦈 Proxying request to backend: http://localhost:5001/api/workout-library/templates');
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/workout-library/templates${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('❌ Backend API error:', response.status, response.statusText);
      return NextResponse.json(
        { success: false, error: 'Backend API error' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('✅ Successfully fetched workout templates from backend');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Proxy error for workout-library/templates:', error);
    return NextResponse.json(
      { success: false, error: 'Proxy server error' },
      { status: 500 }
    );
  }
}
