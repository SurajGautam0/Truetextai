import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json(
        { error: 'Valid text is required for AI detection' },
        { status: 400 }
      );
    }
    
    // Get the text to check and validate length
    const textToCheck = body.text.trim();
    
    if (textToCheck.length < 50) {
      return NextResponse.json(
        { error: 'Text must be at least 50 characters long for accurate detection' },
        { status: 400 }
      );
    }
    
    if (textToCheck.length > 10000) {
      return NextResponse.json(
        { error: 'Text is too long. Maximum 10,000 characters allowed.' },
        { status: 400 }
      );
    }
    
    console.log(`AI Detection Request: ${textToCheck.length} characters from ${body.source || 'unknown'}`);
    
    try {
      // Enhanced AI detection with timeout and better error handling
      const response = await fetch('https://truetextai2.onrender.com/detect', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'TrueTextAI-Frontend/1.0'
        },
        body: JSON.stringify({ 
          text: textToCheck,
          source: body.source || 'api'
        }),
        // Increased timeout for better reliability
        signal: AbortSignal.timeout(30000) // 30 seconds timeout
      });
      
      // Check the content type to make sure we're getting JSON
      const contentType = response.headers.get('content-type');
      
      // Handle non-JSON responses (like HTML error pages)
      if (!contentType || !contentType.includes('application/json')) {
        let errorMessage = `AI detection service returned invalid response format (${response.status})`;
        
        // Try to get some text for debugging, but don't fail if we can't
        try {
          const text = await response.text();
          console.error('Non-JSON response received:', text.substring(0, 300));
          
          // Check if it's an HTML error page
          if (text.includes('<!DOCTYPE') || text.includes('<html>')) {
            errorMessage = 'AI detection service is currently unavailable. Please try again later.';
          }
        } catch (e) {
          console.error('Failed to read non-JSON response:', e);
        }
        
        throw new Error(errorMessage);
      }

      // Parse the JSON response
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        throw new Error('AI detection service returned malformed response');
      }
      
      if (!response.ok) {
        const errorMessage = result.error || result.detail || `AI detection service error (${response.status})`;
        throw new Error(errorMessage);
      }
      
      // Validate the response structure
      if (typeof result.ai_probability !== 'number') {
        console.error('Invalid AI detection response:', result);
        throw new Error('AI detection service returned invalid probability score');
      }
      
      // Ensure probability is within valid range
      const aiProbability = Math.max(0, Math.min(100, Math.round(result.ai_probability)));
      
      console.log(`AI Detection Result: ${aiProbability}% AI probability`);
      
      // Return the complete result to the frontend
      return NextResponse.json({
        ai_probability: aiProbability,
        human_probability: Math.round(100 - aiProbability),
        confidence: result.confidence || Math.abs(50 - aiProbability) * 2, // Calculate confidence if not provided
        analysis: result.analysis || `Text analyzed with ${aiProbability}% AI probability.`,
        timestamp: new Date().toISOString(),
        status: 'success'
      });
      
    } catch (error: any) {
      console.error('Error calling AI detection service:', error);
      
      // Provide more specific error messages based on error type
      let errorMessage = 'Failed to analyze text for AI content';
      let statusCode = 500;
      
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        errorMessage = 'AI detection request timed out. Please try with shorter text.';
        statusCode = 408;
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Unable to connect to AI detection service. Please try again later.';
        statusCode = 503;
      } else if (error.message.includes('Unexpected token') || error.message.includes('JSON') || error.message.includes('malformed')) {
        errorMessage = 'AI detection service is currently unavailable. Please try again later.';
        statusCode = 502;
      } else if (error.message.includes('invalid response format') || error.message.includes('unavailable')) {
        errorMessage = 'AI detection service is temporarily unavailable. Please try again later.';
        statusCode = 503;
      } else if (error.message.includes('Service returned')) {
        errorMessage = error.message;
        statusCode = 502;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          timestamp: new Date().toISOString(),
          status: 'error'
        },
        { status: statusCode }
      );
    }
  } catch (error: any) {
    console.error('Error in AI check API route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error while processing AI detection request',
        timestamp: new Date().toISOString(),
        status: 'error'
      },
      { status: 500 }
    );
  }
}
