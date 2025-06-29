import { NextResponse } from "next/server";
import { paraphraseText } from "@/lib/paraphrase";

// Helper function to calculate text similarity
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  return intersection.size / Math.max(words1.size, words2.size);
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required for paraphrasing" },
        { status: 400 }
      );
    }

    if (text.length < 10) {
      return NextResponse.json(
        { error: "Text must be at least 10 characters long" },
        { status: 400 }
      );
    }

    console.log('Starting paraphrasing process...');
    const originalWords = text.trim().split(/\s+/).length;
    const paraphrasedText = await paraphraseText(text);

    if (!paraphrasedText) {
      console.error('Paraphrasing failed - no result returned');
      return NextResponse.json(
        { 
          error: "Failed to generate paraphrased text. Please try again.",
          details: "The API returned an empty response. This might be due to model loading or API issues."
        },
        { status: 500 }
      );
    }

    console.log('Paraphrasing successful');
    const paraphrasedWords = paraphrasedText.trim().split(/\s+/).length;
    const wordChangePercentage = Math.round(
      Math.abs((paraphrasedWords - originalWords) / originalWords) * 100
    );

    // Calculate similarity metrics
    const similarityScore = Math.round(calculateTextSimilarity(text, paraphrasedText) * 100);
    const uniqueWords = new Set(paraphrasedText.toLowerCase().split(/\s+/)).size;
    const vocabularyDiversity = Math.round((uniqueWords / paraphrasedWords) * 100);

    // Calculate sentence variation
    const sentences = paraphrasedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = Math.round(paraphrasedWords / sentences.length);

    // Calculate word frequency distribution
    const wordFrequencies = new Map<string, number>();
    paraphrasedText.toLowerCase().split(/\s+/).forEach(word => {
      wordFrequencies.set(word, (wordFrequencies.get(word) || 0) + 1);
    });
    const maxWordFrequency = Math.max(...wordFrequencies.values());
    const wordFrequencyScore = Math.round((maxWordFrequency / paraphrasedWords) * 100);

    return NextResponse.json({
      paraphrasedText,
      metrics: {
        originalWords,
        paraphrasedWords,
        wordChangePercentage,
        similarityScore,
        vocabularyDiversity,
        avgSentenceLength,
        wordFrequencyScore,
        model: 'facebook/bart-large-cnn'
      }
    });

  } catch (error: any) {
    console.error("Paraphrasing error:", error);

    if (error.message.includes("API token not configured")) {
      return NextResponse.json(
        { 
          error: "API configuration error",
          details: "Please check your environment variables and ensure HUGGINGFACE_API_TOKEN is set."
        },
        { status: 500 }
      );
    }

    if (error.message.includes("Failed to fetch")) {
      return NextResponse.json(
        { 
          error: "Network error",
          details: "Please check your internet connection and try again."
        },
        { status: 503 }
      );
    }

    if (error.message.includes("API Error")) {
      return NextResponse.json(
        { 
          error: "API Error",
          details: error.message
        },
        { status: 500 }
      );
    }

    if (error.message.includes("Generated text is too short")) {
      return NextResponse.json(
        { 
          error: "Generation error",
          details: "The generated text was too short. Please try again with different parameters."
        },
        { status: 500 }
      );
    }

    if (error.message.includes("too similar")) {
      return NextResponse.json(
        { 
          error: "Similarity error",
          details: "The generated text was too similar to the input. Please try again."
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: "An unexpected error occurred",
        details: error.message
      },
      { status: 500 }
    );
  }
}
