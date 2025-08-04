import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params;
    console.log('🦈 Proxying request to backend:', `${BACKEND_URL}/workout-library/templates/${templateId}`);
    
    const response = await fetch(`${BACKEND_URL}/workout-library/templates/${templateId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('❌ Backend error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ Backend error details:', errorText);
      return NextResponse.json(
        { success: false, message: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('✅ Successfully fetched workout template from backend');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error proxying to backend:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch workout template', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
