import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export async function GET() {
  try {
    console.log('🦈 Proxying request to backend:', `${BACKEND_URL}/coach/athletes`);
    
    const response = await fetch(`${BACKEND_URL}/coach/athletes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Backend error:', data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log('✅ Successfully fetched athletes from backend');
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ Error proxying to backend:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to connect to backend', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
