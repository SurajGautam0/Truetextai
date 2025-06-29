import { NextResponse } from "next/server";

export async function GET() {
  try {
    const API_URL = "https://api.humanizeai.com/api/v1/text/humanize";
    const API_KEY = process.env.NEXT_PUBLIC_HUMANIZEAI_KEY;

    if (!API_KEY) {
      return NextResponse.json({ 
        status: "error", 
        message: "API key not configured" 
      });
    }

    // Test connection with minimal payload
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ 
        text: "Test connection", 
        creativity: 0.5,
        language: "en"
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      status: "success",
      apiStatus: response.status,
      response: data
    });
  } catch (error) {
    console.error("API Test Error:", error);
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 