const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: "sk-KtmxXFJvmB1IYnFojdEamBKEWDtIpuD6GdyypWhbRjCBxcm0",
  baseURL: "https://api.chatanywhere.tech/v1",
});

async function testOpenAI() {
  try {
    console.log("Testing OpenAI API connection...");

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Respond with a simple greeting.",
        },
        {
          role: "user",
          content: "Hello, can you confirm you're working?",
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    console.log("✅ OpenAI API is working!");
    console.log("Response:", completion.choices[0].message.content);
    return true;
  } catch (error) {
    console.error("❌ OpenAI API test failed:");
    console.error("Error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    return false;
  }
}

testOpenAI();
