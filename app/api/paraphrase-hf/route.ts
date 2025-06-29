import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (request.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const apiToken = process.env.HUGGINGFACE_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { error: 'API token not configured' },
        { status: 500 }
      );
    }

    // Using a more suitable model for paraphrasing
    const apiUrl = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          max_length: Math.min(text.length * 2, 1024), // Limit output length
          min_length: Math.max(text.length * 0.5, 30), // Ensure minimum length
          do_sample: true,
          temperature: 0.7,
          top_p: 0.95,
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch from Hugging Face API');
    }

    const result = await response.json();
    const paraphrasedText = result[0].generated_text;

    // Calculate metrics
    const originalWords = text.trim().split(/\s+/).length;
    const paraphrasedWords = paraphrasedText.trim().split(/\s+/).length;

    return NextResponse.json({
      paraphrasedText,
      metrics: {
        originalWords,
        paraphrasedWords,
        wordChangePercentage: Math.round(
          Math.abs((paraphrasedWords - originalWords) / originalWords) * 100
        ),
        model: 'facebook/bart-large-cnn'
      }
    });
  } catch (error: any) {
    console.error('Paraphrasing error:', error);

    if (error.message.includes('Failed to fetch')) {
      return NextResponse.json(
        { error: 'Failed to connect to paraphrasing service' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Error paraphrasing text' },
      { status: 500 }
    );
  }
} 