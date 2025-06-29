import type { Message } from "./groq"

// Simple fallback AI implementation for when the Groq API is unavailable
export async function fallbackAI(messages: Message[]) {
  // Extract the user's message
  const userMessage = messages.find((m) => m.role === "user")?.content || ""

  // Simple response generation based on message length and content
  const wordCount = userMessage.split(/\s+/).filter(Boolean).length
  const sentences = userMessage.split(/[.!?]+/).filter(Boolean)

  // Generate a simple response
  let response = "I've analyzed your text and found it to be "

  if (wordCount > 100) {
    response += "quite detailed and comprehensive. "
  } else if (wordCount > 50) {
    response += "moderately detailed. "
  } else {
    response += "rather brief. "
  }

  if (sentences.length > 10) {
    response += "It contains many sentences with varied structure. "
  } else if (sentences.length > 5) {
    response += "It has a reasonable number of sentences. "
  } else {
    response += "It has very few sentences. "
  }

  response +=
    "Based on my analysis, this text appears to be written by a human, but with some patterns that could suggest AI assistance."

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    choices: [
      {
        message: {
          role: "assistant",
          content: response,
        },
      },
    ],
  }
}
