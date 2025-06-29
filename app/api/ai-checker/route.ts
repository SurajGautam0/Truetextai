import { NextResponse } from "next/server"
import axios from "axios"

// Mock session (replace with actual implementation)
interface Session {
  user?: { id: string }
}

async function getSession(): Promise<Session | null> {
  return { user: { id: "mock-user" } }
}

export const runtime = "edge"

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }

    let data: { text?: string }
    try {
      data = await request.json()
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const text = data.text
    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: "Text must be at least 50 characters" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const options = {
      method: "POST",
      url: "https://api.sapling.ai/api/v1/aidetect",
      headers: {
        "content-type": "application/json",
      },
      data: {
        key: "6B9DHGYAK5OJ9LV44A8TKUBAAJUV74OV",
        text,
      },
    }

    try {
      const response = await axios.request(options)
      const result = response.data

      // Map Sapling API response to ai_probability expected by frontend
      const aiProbability = result.probability ?? result.score ?? null

      if (typeof aiProbability !== "number") {
        return NextResponse.json(
          { error: "Invalid response from Sapling AI API: missing probability" },
          { status: 500, headers: { "Content-Type": "application/json" } }
        )
      }

      return NextResponse.json(
        { ai_probability: aiProbability * 100 }, // convert to percentage
        { headers: { "Content-Type": "application/json" } }
      )
    } catch (error) {
      console.error("Sapling AI API error:", error)
      return NextResponse.json(
        { error: "Failed to analyze text with Sapling AI API" },
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      { error: `Failed to analyze text: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
