import { NextRequest, NextResponse } from 'next/server';

// Development-only route to check raw workout data
export async function GET(request: NextRequest, { params }: { params: Promise<{ athleteId: string }> }) {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, message: 'Not available in production' }, { status: 403 });
  }

  try {
    const { athleteId } = await params;
    
    // Call the backend to get workouts  
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const response = await fetch(`${backendUrl}/coach/athletes/${athleteId}/workouts`);
    const result = await response.json();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Raw workout data for athlete ${athleteId}:`,
        data: {
          athlete_id: athleteId,
          total_workouts: result.data.length,
          workouts: result.data,
          today_date: '2025-07-29',
          workouts_for_today: result.data.filter((w: any) => w.date === '2025-07-29')
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to get workouts',
        error: result.error || result.message
      });
    }

  } catch (error) {
    console.error('❌ Debug workouts error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get workouts: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}
