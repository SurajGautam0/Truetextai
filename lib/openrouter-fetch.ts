// OpenRouter API utility using direct fetch
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
const API_TIMEOUT = 30000 // 30 seconds timeout

// Map our internal model names to OpenRouter model IDs
export const modelMap: Record<string, string> = {
  "ninja-3.2": "openai/gpt-3.5-turbo",
  "stealth-2.0": "openai/gpt-4-turbo",
  "ghost-1.5": "openai/gpt-4o",
}

export interface Message {
  role: "system" | "user" | "assistant"
  content: string
}

export interface OpenRouterResponse {
  id: string
  choices: {
    message: {
      role: string
      content: string
    }
    index: number
    finish_reason: string
  }[]
  model: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface OpenRouterOptions {
  temperature?: number
  max_tokens?: number
  response_format?: { type: string }
}

// Utility function to implement timeout for fetch
const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number) => {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

export async function callOpenRouter(
  model: string,
  messages: Message[],
  options: OpenRouterOptions = {},
): Promise<OpenRouterResponse> {
  const modelId = modelMap[model] || "openai/gpt-3.5-turbo"

  console.log(`Calling OpenRouter with model: ${modelId}`)

  try {
    // Ensure we have an API key
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not set")
    }

    const requestBody = JSON.stringify({
      model: modelId,
      messages,
      ...options,
    })

    console.log(`Request body: ${requestBody.substring(0, 100)}...`)

    const response = await fetchWithTimeout(
      OPENROUTER_API_URL,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://surajwriter.vercel.app",
          "X-Title": "SurajWriter App",
          "Content-Type": "application/json",
        },
        body: requestBody,
      },
      API_TIMEOUT,
    )

    if (!response.ok) {
      let errorMessage = `OpenRouter API error: ${response.status} ${response.statusText}`

      try {
        const errorData = await response.json()
        errorMessage = `OpenRouter API error: ${JSON.stringify(errorData)}`
      } catch (e) {
        // If we can't parse the error as JSON, use the text
        const errorText = await response.text()
        errorMessage = `OpenRouter API error: ${errorText}`
      }

      console.error(errorMessage)
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log("OpenRouter response received successfully")
    return data
  } catch (error) {
    console.error("Error calling OpenRouter:", error)
    throw error
  }
}
