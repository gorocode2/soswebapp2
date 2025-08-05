import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ athleteId: string }> }
) {
  try {
    const { athleteId } = await params;
    
    if (!athleteId) {
      return NextResponse.json(
        { success: false, message: 'Athlete ID is required' },
        { status: 400 }
      );
    }

    // Forward request body if it exists (for dateRange)
    const requestBody = await request.json().catch(() => ({}));

    const response = await fetch(`${BACKEND_URL}/api/activities/sync-intervals-icu/${athleteId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      // Handle non-JSON response (likely an error)
      const text = await response.text();
      console.error('❌ Backend returned non-JSON response:', text);
      return NextResponse.json(
        { 
          success: false, 
          message: `Backend error: ${response.status} ${response.statusText}`,
          details: text 
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error syncing activities from intervals.icu:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to sync activities from intervals.icu' },
      { status: 500 }
    );
  }
}
