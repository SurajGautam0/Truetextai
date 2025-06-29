import Groq from "groq-sdk";

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
  dangerouslyAllowBrowser: true
});

export async function callGroq(messages: Message[]) {
  try {
    const completion = await groq.chat.completions.create({
      messages,
      model: "llama2-70b-4096",
      temperature: 0.7,
      max_tokens: 1000,
    });

    return {
      content: completion.choices[0]?.message?.content || "",
      error: null
    };
  } catch (error) {
    console.error("Groq API error:", error);
    return {
      content: "",
      error: error instanceof Error ? error.message : "Failed to generate response"
    };
  }
} 