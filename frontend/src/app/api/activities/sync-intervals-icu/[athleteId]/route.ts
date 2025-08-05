import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

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

    const response = await fetch(`${BACKEND_URL}/api/activities/sync-intervals-icu/${athleteId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error syncing activities from intervals.icu:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to sync activities from intervals.icu' },
      { status: 500 }
    );
  }
}
