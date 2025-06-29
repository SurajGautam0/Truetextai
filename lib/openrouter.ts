import OpenAI from "openai"

// Create OpenRouter client
export const openRouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://surajwriter.vercel.app",
    "X-Title": "SurajWriter App",
  },
})

// Map our internal model names to OpenRouter model IDs
export const modelMap: Record<string, string> = {
  "ninja-3.2": "openai/gpt-3.5-turbo",
  "stealth-2.0": "openai/gpt-4-turbo",
  "ghost-1.5": "openai/gpt-4o",
}

// Fallback to gpt-3.5-turbo if the requested model is not available
export function getModelId(modelName: string): string {
  return modelMap[modelName] || "openai/gpt-3.5-turbo"
}
