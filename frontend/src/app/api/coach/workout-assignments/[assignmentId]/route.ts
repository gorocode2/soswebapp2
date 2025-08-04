import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// DELETE endpoint for removing workout assignments
export async function DELETE(
  request: NextRequest,
  { params }: { params: { assignmentId: string } }
) {
  try {
    const { assignmentId } = await params; // Await params as required by Next.js 15
    console.log('🦈 Proxying DELETE request to backend:', `${BACKEND_URL}/coach/workout-assignments/${assignmentId}`);
    
    const response = await fetch(`${BACKEND_URL}/coach/workout-assignments/${assignmentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend DELETE error:', response.status, errorText);
      return NextResponse.json(
        { 
          success: false, 
          message: `Backend error: ${response.status}`,
          error: errorText 
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('✅ Successfully deleted workout assignment from backend');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error proxying DELETE request to backend:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to proxy request to backend',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
