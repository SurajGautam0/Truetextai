import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body.text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }
    
    // Get the text to check
    const textToCheck = body.text;
    
    // Connect to the Python backend for AI detection
    const pythonApiUrl = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';
    
    try {
      // This would be a real API call to the Python backend
      // For now, we're simulating with random values
      
      // Uncomment this when your Python API is ready:
      /*
      const response = await fetch(`${pythonApiUrl}/api/check-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToCheck }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Python API request failed: ${response.status}`);
      }
      
      const result = await response.json();
      return NextResponse.json({
        ai_probability: Math.round(result.ai_probability * 100),
      });
      */
      
      // For demo purposes, generate a random AI probability
      // that's somewhat dependent on the text length (longer texts get higher scores)
      const textLength = textToCheck.length;
      const randomFactor = Math.random() * 0.5; // 0 to 0.5
      const lengthFactor = Math.min(0.5, textLength / 1000); // 0 to 0.5, maxes at 500 chars
      const aiProbability = Math.min(95, Math.max(5, Math.round((randomFactor + lengthFactor) * 100)));
      
      return NextResponse.json({
        ai_probability: aiProbability,
      });
      
    } catch (error: any) {
      console.error('Error calling Python AI checker:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to check AI probability' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in AI check API route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
