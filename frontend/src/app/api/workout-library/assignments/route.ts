import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const queryParams = url.searchParams.toString();
    
    const response = await fetch(`${BACKEND_URL}/workout-library/assignments${queryParams ? `?${queryParams}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward any auth headers
        ...(request.headers.get('authorization') ? { 'authorization': request.headers.get('authorization')! } : {}),
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch workout assignments' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching workout assignments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🦈 Workout Assignment API - Creating assignment:', body);
    
    const response = await fetch(`${BACKEND_URL}/workout-library/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward any auth headers
        ...(request.headers.get('authorization') ? { 'authorization': request.headers.get('authorization')! } : {}),
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    console.log('Backend response status:', response.status);
    console.log('Backend response:', responseText);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to create workout assignment', details: responseText },
        { status: response.status }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      return NextResponse.json(
        { error: 'Invalid response from backend' },
        { status: 500 }
      );
    }

    console.log('✅ Assignment created successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error creating workout assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
