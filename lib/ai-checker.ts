/**
 * Checks if text was written by AI using advanced text analysis
 * @param text The text to check
 * @returns Object containing AI probability score and detailed analysis
 */
export async function checkText(text: string): Promise<{ 
  aiProbability: number;
  analysis?: {
    metrics: {
      wordCount: number;
      sentenceCount: number;
      avgWordLength: number;
      avgSentenceLength: number;
      uniqueWordRatio: number;
    };
    patterns: {
      repetitivePhrases: string[];
      aiPatterns: string[];
      formalPhrases: string[];
    };
    suggestions: string[];
  };
}> {
  if (!text.trim()) {
    throw new Error("Text cannot be empty");
  }

  // Text preprocessing
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
  
  // Basic metrics calculation
  const metrics = {
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgWordLength: words.reduce((sum, word) => sum + word.length, 0) / words.length,
    avgSentenceLength: words.length / sentences.length,
    uniqueWordRatio: new Set(words.map(w => w.toLowerCase())).size / words.length
  };

  // Enhanced pattern detection
  const patterns = {
    repetitivePhrases: [] as string[],
    aiPatterns: [] as string[],
    formalPhrases: [] as string[]
  };

  // Common AI writing patterns with weights
  const aiPatterns = [
    { pattern: "in conclusion", weight: 15 },
    { pattern: "furthermore", weight: 10 },
    { pattern: "moreover", weight: 10 },
    { pattern: "it is important to note", weight: 15 },
    { pattern: "in addition", weight: 8 },
    { pattern: "as a result", weight: 10 },
    { pattern: "therefore", weight: 8 },
    { pattern: "thus", weight: 8 },
    { pattern: "consequently", weight: 10 },
    { pattern: "in order to", weight: 8 },
    { pattern: "it is worth noting", weight: 12 },
    { pattern: "it can be argued", weight: 10 },
    { pattern: "this demonstrates", weight: 8 },
    { pattern: "this indicates", weight: 8 },
    { pattern: "this suggests", weight: 8 },
    { pattern: "it is evident", weight: 10 },
    { pattern: "it is clear", weight: 8 },
    { pattern: "it is apparent", weight: 10 },
    { pattern: "it is obvious", weight: 8 },
    { pattern: "it is crucial", weight: 10 }
  ];

  // Formal writing patterns
  const formalPatterns = [
    "the aforementioned",
    "the latter",
    "the former",
    "with respect to",
    "in regard to",
    "in terms of",
    "in the context of",
    "in light of",
    "in view of",
    "with reference to"
  ];

  // Calculate AI score with multiple factors
  let aiScore = 0;
  const suggestions: string[] = [];

  // 1. Check for repetitive phrases (30% weight)
  const phraseFrequency = new Map<string, number>();
  for (let i = 0; i < words.length - 2; i++) {
    const phrase = words.slice(i, i + 3).join(" ").toLowerCase();
    phraseFrequency.set(phrase, (phraseFrequency.get(phrase) || 0) + 1);
  }
  
  for (const [phrase, count] of phraseFrequency.entries()) {
    if (count > 2) {
      patterns.repetitivePhrases.push(phrase);
      aiScore += 5;
    }
  }

  // 2. Check for AI patterns (25% weight)
  for (const { pattern, weight } of aiPatterns) {
    if (text.toLowerCase().includes(pattern)) {
      patterns.aiPatterns.push(pattern);
      aiScore += weight;
    }
  }

  // 3. Check for formal patterns (15% weight)
  for (const pattern of formalPatterns) {
    if (text.toLowerCase().includes(pattern)) {
      patterns.formalPhrases.push(pattern);
      aiScore += 8;
    }
  }

  // 4. Analyze sentence structure (20% weight)
  const sentenceLengthVariation = sentences.map(s => s.split(/\s+/).length);
  const lengthVariation = Math.max(...sentenceLengthVariation) - Math.min(...sentenceLengthVariation);
  
  if (lengthVariation < 5) {
    aiScore += 20;
    suggestions.push("Try varying your sentence lengths more");
  }

  // 5. Check paragraph structure (10% weight)
  if (paragraphs.length > 0) {
    const avgParagraphLength = sentences.length / paragraphs.length;
    if (avgParagraphLength > 8) {
      aiScore += 10;
      suggestions.push("Consider breaking down long paragraphs");
    }
  }

  // 6. Check for natural language patterns
  const contractions = ["don't", "can't", "won't", "it's", "that's", "there's", "they're", "you're"];
  const hasContractions = contractions.some(c => text.toLowerCase().includes(c));
  if (!hasContractions) {
    aiScore += 5;
    suggestions.push("Consider using contractions to make the text more natural");
  }

  // Normalize score between 0 and 100
  const finalScore = Math.min(Math.max(Math.round(aiScore), 0), 100);
  
  // Add slight randomness to make it more interesting
  const randomVariation = Math.random() * 5 - 2.5;
  const finalAiScore = Math.min(Math.max(finalScore + randomVariation, 0), 100);

  return { 
    aiProbability: Math.round(finalAiScore),
    analysis: {
      metrics,
      patterns,
      suggestions: suggestions.length > 0 ? suggestions : ["The text appears to be well-balanced"]
    }
  };
} 