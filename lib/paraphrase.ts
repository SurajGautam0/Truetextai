import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function paraphraseText(inputText: string): Promise<string | null> {
  try {
    // First try with Hugging Face
    const huggingFaceResult = await tryHuggingFaceParaphrase(inputText);
    if (huggingFaceResult) {
      return huggingFaceResult;
    }

    // If Hugging Face fails, try with ChatGPT
    console.log('Falling back to ChatGPT for paraphrasing...');
    return await tryChatGPTParaphrase(inputText);
  } catch (error) {
    console.error('Error in paraphraseText:', error);
    return null;
  }
}

async function tryChatGPTParaphrase(inputText: string): Promise<string | null> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `
Rephrase the following text to sound like it was written by a real human — such as a college student or professional — while preserving the original meaning. 
Use natural language, contractions (like don't, it's), varied sentence structure, and make it flow smoothly. 
Avoid robotic, overly formal, or AI-like patterns. Keep the grammar correct and use simple, readable phrasing.

Text:
${inputText}
    `.trim();

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional writer who specializes in natural, human-like text rewriting. Your task is to paraphrase text while maintaining its original meaning but making it sound more natural and less AI-generated."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: Math.min(Math.floor(inputText.length * 2), 1000),
      top_p: 0.95,
      frequency_penalty: 0.5,
      presence_penalty: 0.5,
    });

    const paraphrasedText = response.choices[0]?.message?.content;
    if (!paraphrasedText) {
      throw new Error('No response from ChatGPT');
    }

    // Clean up and humanize
    let cleanedText = paraphrasedText
      .replace(/^\s*(Rewritten text|Paraphrase this text.*?|Generated text|Summary):/i, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[\w.-]+@[\w.-]+\.\w+/g, '')
      .replace(/Click here.*$/i, '')
      .replace(/Visit:.*$/i, '')
      .replace(/Share this.*$/i, '')
      .replace(/Back to.*$/i, '')
      .replace(/[^\w\s.,!?'"-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Remove AI giveaway patterns
    cleanedText = deAIText(cleanedText);

    if (cleanedText.length < 10) {
      throw new Error('Generated text is too short');
    }

    return cleanedText;
  } catch (error) {
    console.error('Error in ChatGPT paraphrase:', error);
    return null;
  }
}

async function tryHuggingFaceParaphrase(inputText: string): Promise<string | null> {
  try {
    const apiToken = process.env.HUGGINGFACE_API_TOKEN;
    if (!apiToken) {
      throw new Error('Hugging Face API token not configured');
    }

    const apiUrl = 'https://api-inference.huggingface.co/models/google/pegasus-large';

    // Much more lenient length constraints
    const maxLength = Math.min(Math.floor(inputText.length * 2), 1024);
    const minLength = Math.max(Math.floor(inputText.length * 0.5), 30);
    const maxRetries = 5;
    let retryCount = 0;
    let lastError: Error | null = null;
    let bestResult: string | null = null;
    let bestSimilarity = 0;

    while (retryCount < maxRetries) {
      try {
        console.log('Attempting to call Hugging Face API...');

        const prompt = `
Rephrase the following text to sound like it was written by a real human — such as a college student or professional — while preserving the original meaning. 
Use natural language, contractions (like don't, it's), varied sentence structure, and make it flow smoothly. 
Avoid robotic, overly formal, or AI-like patterns. Keep the grammar correct and use simple, readable phrasing.

Text:
${inputText}
        `.trim();

        const requestBody = {
          inputs: prompt,
          parameters: {
            max_length: maxLength,
            min_length: minLength,
            do_sample: true,
            temperature: 0.8,
            top_p: 0.95,
            top_k: 50,
            num_return_sequences: 1,
            repetition_penalty: 1.2,
            length_penalty: 0.6,
            no_repeat_ngram_size: 3,
            early_stopping: true,
          },
        };

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log('Response status:', response.status);
        
        if (response.status === 503) {
          console.log('Model is loading, waiting...');
          const waitTime = Math.pow(2, retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retryCount++;
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        console.log('API Response:', result);
        
        let paraphrasedText: string | null = null;

        if (Array.isArray(result) && result.length > 0) {
          paraphrasedText = result[0].generated_text || result[0].summary_text || result[0].text || result[0].output;
        } else if (typeof result === 'object') {
          paraphrasedText = result.generated_text || result.summary_text || result.text || result.output || result.result;
        } else if (typeof result === 'string') {
          paraphrasedText = result;
        }

        if (!paraphrasedText) {
          console.error('Invalid response format:', result);
          throw new Error('Invalid response format from API');
        }

        // Clean up and humanize
        let cleanedText = paraphrasedText
          .replace(/^\s*(Rewritten text|Paraphrase this text.*?|Generated text|Summary):/i, '')
          .replace(/https?:\/\/\S+/g, '')
          .replace(/[\w.-]+@[\w.-]+\.\w+/g, '')
          .replace(/Click here.*$/i, '')
          .replace(/Visit:.*$/i, '')
          .replace(/Share this.*$/i, '')
          .replace(/Back to.*$/i, '')
          .replace(/[^\w\s.,!?'"-]/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        // Remove AI giveaway patterns
        cleanedText = deAIText(cleanedText);

        if (cleanedText.length < 10) {
          console.warn('Generated text is too short, retrying...');
          retryCount++;
          continue;
        }

        const inputWordCount = inputText.split(/\s+/).length;
        const outputWordCount = cleanedText.split(/\s+/).length;
        const lengthRatio = outputWordCount / inputWordCount;

        // Much more lenient length check
        if (lengthRatio > 2.0 || lengthRatio < 0.5) {
          console.warn('Output length deviates too much, retrying...');
          retryCount++;
          continue;
        }

        const similarity = calculateTextSimilarity(inputText, cleanedText);
        
        // Keep track of the best result
        if (similarity > bestSimilarity && similarity < 0.95) {
          bestResult = cleanedText;
          bestSimilarity = similarity;
        }

        // If we have a good result, return it
        if (similarity > 0.5 && similarity < 0.95) {
          return cleanedText;
        }

        retryCount++;
      } catch (error) {
        console.error('Attempt error:', error);
        lastError = error instanceof Error ? error : new Error(String(error));
        if (error instanceof Error && error.message.includes('503')) {
          retryCount++;
          continue;
        }
        throw error;
      }
    }

    // If we have a best result, return it
    if (bestResult) {
      console.log('Returning best result with similarity:', bestSimilarity);
      return bestResult;
    }

    // If we get here, we failed to get a good result
    const errorMessage = lastError ? lastError.message : 'No valid result after all retries';
    console.error('Final error:', errorMessage);
    return null;

  } catch (error) {
    console.error('Error in Hugging Face paraphrase:', error);
    return null;
  }
}

function deAIText(text: string): string {
  return text
    .replace(/\bmoreover\b/gi, 'also')
    .replace(/\bfurthermore\b/gi, 'and')
    .replace(/\bthus\b/gi, 'so')
    .replace(/\bhence\b/gi, '')
    .replace(/\btherefore\b/gi, '')
    .replace(/\bIn conclusion\b/gi, '')
    .replace(/\bIt can be seen that\b/gi, '')
    .replace(/\bAs such\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  return intersection.size / Math.max(words1.size, words2.size);
}
