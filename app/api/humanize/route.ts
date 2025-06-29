import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, creativity } = await req.json();
    const API_URL = "https://api.humanizeai.com/api/v1/humanize";
    const API_KEY = process.env.NEXT_PUBLIC_HUMANIZEAI_KEY;

    console.log("API Request:", {
      url: API_URL,
      hasKey: !!API_KEY,
      textLength: text?.length,
      creativity
    });

    if (!API_KEY) {
      console.error("API key missing");
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    if (!text || text.length < 30) {
      return NextResponse.json({ 
        error: "Text must be at least 30 characters long" 
      }, { status: 400 });
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ 
        text,
        creativity,
        language: "en"
      }),
    });

    console.log("API Response Status:", response.status);
    
    const data = await response.json();
    console.log("API Response Data:", data);
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: data.error || `API error: ${response.status}` 
      }, { status: response.status });
    }

    if (!data.task_id) {
      console.error("No task_id in response:", data);
      return NextResponse.json({ error: "No task ID in response" }, { status: 500 });
    }

    return NextResponse.json({ task_id: data.task_id });
  } catch (error) {
    console.error("Humanize API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
