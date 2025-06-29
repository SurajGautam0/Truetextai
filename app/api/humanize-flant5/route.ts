import { NextResponse } from "next/server";

/**
 * This is a proxy API route that will redirect requests to the Python backend
 * which uses the Flan-T5 model for text generation.
 *
 * The Python backend (app.py) already has the Flan-T5 model loaded by default,
 * so this route just needs to format the request correctly and handle any errors.
 *
 * Request format:
 * {
 *   text: string,           // Required: The text to process
 *   style: string,          // Optional: "general", "academic", "marketing", "story", "blog", "paraphrase"
 *   level: number,          // Optional: 1-10 for creativity level
 *   detector_mode: string,  // Optional: "normal", "aggressive", "ultra"
 *   slow_mode: boolean,     // Optional: Whether to use slow mode
 *   skip_quotations: boolean, // Optional: Whether to skip processing quotations
 *   skip_markdown: boolean,  // Optional: Whether to skip processing markdown
 *   freeze_keywords: string[], // Optional: Keywords to preserve
 *   use_british_english: boolean, // Optional: Whether to use British English
 *   remove_headlines: boolean // Optional: Whether to remove headlines
 * }
 *
 * Response format:
 * {
 *   processedText: string,  // The processed text
 *   aiScore: number,        // 0-100 AI detection score
 *   timeTaken: string,      // Processing time
 *   modelUsed: string       // Model used for processing
 * }
 */
export async function POST(request: Request) {
  try {
    // Parse the request data
    let requestData: {
      text?: string;
      style?: string;
      level?: number;
      detector_mode?: string;
      slow_mode?: boolean;
      skip_quotations?: boolean;
      skip_markdown?: boolean;
      freeze_keywords?: string[];
      use_british_english?: boolean;
      remove_headlines?: boolean;
    };
    try {
      requestData = await request.json();
    } catch (e) {
      console.error("Invalid JSON format in request:", e);
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }

    const inputText = requestData.text;
    const style = requestData.style || "paraphrase"; // Default to paraphrase
    const level = requestData.level || 5; // Default creativity level

    if (!inputText || typeof inputText !== 'string' || inputText.trim().length < 10) {
      return NextResponse.json(
        { error: "Text must be provided and be at least 10 characters long" },
        { status: 400 }
      );
    }    console.log(`Next.js API Proxy: Preparing to process with Flan-T5 (style: ${style}, level: ${level})`);
    console.log(`Input text (first 50 chars): "${inputText.substring(0, 50)}..."`);
    const startTime = Date.now();    // Use the existing Python backend but with a special model parameter
    // This assumes your Python backend can handle this model type
    const PYTHON_API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://127.0.0.1:8000";
    
    console.log(`Connecting to Python backend at: ${PYTHON_API_URL}/api/stylize/journalist`);
    
    try {
      // Forward the request to the Python backend with a timeout
      // Looking at the backend code, it doesn't specifically check for a "model" parameter
      // Instead, it uses the loaded text2text_generator which is already Flan-T5
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(`${PYTHON_API_URL}/api/stylize/journalist`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          text: inputText,
          style: style,
          level: level,
          // The Python backend already uses Flan-T5 by default, so we don't need to specify it
          // But we'll keep it for documentation purposes
          model: "flant5",
          detector_mode: requestData.detector_mode || "normal",
          slow_mode: requestData.slow_mode || false,
          skip_quotations: requestData.skip_quotations || false,
          skip_markdown: requestData.skip_markdown || false,
          freeze_keywords: requestData.freeze_keywords || [],
          use_british_english: requestData.use_british_english || false,
          remove_headlines: requestData.remove_headlines || false,
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

    // If the Python backend request fails
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Python API error response:", errorText);
      
      // Try to parse error as JSON, fall back to text if not possible
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json({ error: errorData.detail || "Error processing with Flan-T5" }, { status: response.status });
      } catch (parseError) {
        return NextResponse.json({ error: `Error processing with Flan-T5: ${errorText.substring(0, 100)}` }, { status: response.status });
      }
    }    // Get the response from the Python backend
    const pythonResult = await response.json();
    
    // Calculate time taken
    const endTime = Date.now();
    const timeTaken = ((endTime - startTime) / 1000).toFixed(1) + "s";

    // Validate the response
    if (!pythonResult.stylized_text) {
      console.warn("Python backend returned a successful response but without stylized_text:", pythonResult);
      return NextResponse.json({ 
        error: "The Python backend returned an unexpected response format" 
      }, { status: 500 });
    }

    // Return the result with appropriate formatting
    return NextResponse.json({
      processedText: pythonResult.stylized_text,
      aiScore: pythonResult.ai_probability !== undefined ? Math.round(pythonResult.ai_probability * 100) : 20,
      timeTaken: pythonResult.processing_time || timeTaken,
      modelUsed: pythonResult.model_used || "Flan-T5 (via Python backend)",
    });
  } catch (error: any) {
    console.error("Error in Next.js Flan-T5 API route:", error);
    
    // Provide more specific error messages based on the type of error
    let errorMessage = "An unexpected error occurred";
    let statusCode = 500;
    
    if (error.name === 'AbortError') {
      errorMessage = "Request to Python backend timed out after 30 seconds";
      statusCode = 504; // Gateway Timeout
    } else if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      errorMessage = "Could not connect to Python backend server. Please ensure the Python server is running at " + 
                     (process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://127.0.0.1:8000");
      statusCode = 503; // Service Unavailable
    } else {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: statusCode });
  }
}
