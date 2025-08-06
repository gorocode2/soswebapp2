import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Forward all query parameters to the backend
    const queryString = searchParams.toString();
    const backendUrl = `${BACKEND_URL}/activities/user/${userId}${queryString ? `?${queryString}` : ''}`;
    
    console.log('🦈 Proxying request to backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward any auth headers
        ...(request.headers.get('authorization') ? { 'authorization': request.headers.get('authorization')! } : {}),
      },
    });

    if (!response.ok) {
      console.error('❌ Backend activities error:', response.status, response.statusText);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch activities from backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Successfully fetched activities from backend');
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching activities:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}
