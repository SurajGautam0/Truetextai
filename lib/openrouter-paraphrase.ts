import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  dangerouslyAllowBrowser: true // Only if you're using this in a browser environment
});

function humanizeText(text: string): string {
  return text
    .replace(/\butilize\b/gi, "use")
    .replace(/\bmoreover\b/gi, "also")
    .replace(/\bin order to\b/gi, "to")
    .replace(/\bthus\b/gi, "so")
    .replace(/\btherefore\b/gi, "so")
    .replace(/(\b[A-Z][a-z]+)\s+([A-Z][a-z]+\b)/g, (m) => m.toLowerCase()); // Remove formal capitals
}

export async function paraphraseText(inputText: string): Promise<string | null> {
  try {
    const apiToken = process.env.HUGGINGFACE_API_TOKEN;
    if (!apiToken) {
      throw new Error('Hugging Face API token not configured');
    }

    const apiUrl = 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: inputText,
        parameters: {
          max_length: Math.min(inputText.length * 2, 1024),
          min_length: Math.max(inputText.length * 0.5, 30),
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

    return paraphrasedText;

  } catch (error) {
    console.error("Error in paraphraseText:", error);
    return null;
  }
}
