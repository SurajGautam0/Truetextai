import { NextRequest, NextResponse } from 'next/server';
import { detectAIWithOpenAI, detectAIWithHeuristics } from '@/lib/ai-detection';

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
      // First, try to use our OpenAI-based AI detection
      console.log('Attempting OpenAI-based AI detection...');
      const result = await detectAIWithOpenAI(textToCheck);
      console.log(`OpenAI AI Detection Result: ${result.ai_probability}% AI probability`);
      return NextResponse.json(result);
      
    } catch (openAIError: any) {
      console.error('OpenAI AI detection failed, falling back to heuristics:', openAIError);
      
      try {
        // Fallback to heuristic-based detection
        console.log('Using heuristic-based AI detection...');
        const result = detectAIWithHeuristics(textToCheck);
        console.log(`Heuristic AI Detection Result: ${result.ai_probability}% AI probability`);
        
        // Add a note that this is a fallback result
        result.analysis = `[Fallback Analysis] ${result.analysis}`;
        return NextResponse.json(result);
        
      } catch (heuristicError: any) {
        console.error('Heuristic detection also failed:', heuristicError);
        
        return NextResponse.json(
          { 
            error: 'AI detection service is currently unavailable. Please try again later.',
            timestamp: new Date().toISOString(),
            status: 'error'
          },
          { status: 503 }
        );
      }
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
