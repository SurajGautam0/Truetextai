import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');
    const API_KEY = process.env.NEXT_PUBLIC_HUMANIZEAI_KEY;

    if (!taskId) {
      return NextResponse.json({ 
        status: "error", 
        message: "Task ID is required" 
      }, { status: 400 });
    }

    if (!API_KEY) {
      return NextResponse.json({ 
        status: "error", 
        message: "API key not configured" 
      }, { status: 500 });
    }

    const response = await fetch(`https://api.humanizeai.com/api/v1/text/status/${taskId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ 
        status: "error", 
        message: `API error: ${response.status}` 
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 