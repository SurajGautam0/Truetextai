import { callOpenAI } from "./openai-client"

export async function testOpenAIConnection() {
  try {
    const messages = [
      {
        role: "system" as const,
        content: "You are a helpful assistant. Respond with a simple greeting."
      },
      {
        role: "user" as const,
        content: "Hello, can you confirm you're working?"
      }
    ]

    const response = await callOpenAI("gpt-3.5-turbo", messages, {
      temperature: 0.7,
      max_tokens: 100
    })

    if (response.error) {
      console.error("OpenAI API Error:", response.error)
      return false
    }

    console.log("OpenAI API Test Response:", response.choices[0].message.content)
    return true
  } catch (error) {
    console.error("OpenAI API Test Failed:", error)
    return false
  }
}

// Uncomment to run test
// testOpenAIConnection().then(success => {
//   console.log("OpenAI API Test:", success ? "PASSED" : "FAILED")
// }) 