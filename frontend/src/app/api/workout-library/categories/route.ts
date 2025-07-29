import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export async function GET() {
  try {
    console.log('🦈 Proxying request to backend: http://localhost:5001/api/workout-library/categories');
    
    const response = await fetch(`${API_BASE_URL}/workout-library/categories`, {
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
    console.log('✅ Successfully fetched workout categories from backend');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Proxy error for workout-library/categories:', error);
    return NextResponse.json(
      { success: false, error: 'Proxy server error' },
      { status: 500 }
    );
  }
}
