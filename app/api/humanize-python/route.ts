import { NextRequest, NextResponse } from 'next/server';

// This is a proxy to the Python Flask backend for humanization
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body.text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';
    
    // Forward the request to the Python backend
    const response = await fetch(`${pythonApiUrl}/api/stylize/journalist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Python API error' },
        { status: response.status }
      );
    }
    
    return NextResponse.json({
      processedText: data.stylized_text,
      aiScore: data.ai_probability !== undefined ? Math.round(data.ai_probability * 100) : 25,
      timeTaken: data.processing_time || '1.0s',
    });
  } catch (error: any) {
    console.error('Error in humanize API route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
