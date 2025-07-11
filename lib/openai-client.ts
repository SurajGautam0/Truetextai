import OpenAI from "openai";

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-KtmxXFJvmB1IYnFojdEamBKEWDtIpuD6GdyypWhbRjCBxcm0",
  baseURL: process.env.OPENAI_BASE_URL || "https://api.chatanywhere.tech/v1",
  dangerouslyAllowBrowser: true
});

export async function callOpenAI(
  model: string, 
  messages: Message[], 
  options: {
    temperature?: number;
    max_tokens?: number;
  } = {}
) {
  try {
    const completion = await openai.chat.completions.create({
      model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 2000,
    });

    return {
      choices: [{
        message: {
          content: completion.choices[0]?.message?.content || ""
        }
      }],
      error: null
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      choices: [{
        message: {
          content: ""
        }
      }],
      error: error instanceof Error ? error.message : "Failed to generate response"
    };
  }
}

export async function callOpenAIWithFallback(
  model: string, 
  messages: Message[], 
  options: {
    temperature?: number;
    max_tokens?: number;
  } = {}
) {
  try {
    return await callOpenAI(model, messages, options);
  } catch (error) {
    console.error("Primary OpenAI API failed, trying fallback...");
    
    // Fallback to a different model if the primary one fails
    const fallbackModel = model.includes("gpt-4") ? "gpt-3.5-turbo" : "gpt-4";
    return await callOpenAI(fallbackModel, messages, options);
  }
} 