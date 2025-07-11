// Using built-in fetch (available in Node.js 18+)

async function testAIDetection() {
  try {
    console.log("Testing new AI Detection API...");

    const testTexts = [
      // AI-generated text
      "Artificial intelligence has revolutionized various industries by providing innovative solutions to complex problems. Furthermore, machine learning algorithms have demonstrated remarkable capabilities in processing vast amounts of data efficiently. It is important to note that these technological advancements have significantly impacted the way businesses operate in the modern era. Consequently, organizations must adapt to these changes to remain competitive in the market.",

      // Human-like text
      "I went to the store yesterday and bought some groceries. The weather was really nice, so I decided to walk instead of driving. I ran into my neighbor Sarah while I was there - she was picking up some milk and bread too. We chatted for a bit about the new restaurant that opened downtown. She said the food was pretty good but a bit expensive. I might check it out this weekend if I have time.",
    ];

    for (let i = 0; i < testTexts.length; i++) {
      const text = testTexts[i];
      console.log(
        `\n--- Test ${i + 1}: ${
          i === 0 ? "AI-generated" : "Human-like"
        } text ---`
      );

      const response = await fetch("http://localhost:3000/api/check-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Test ${i + 1} failed:`);
        console.error("Status:", response.status);
        console.error("Error:", errorText);
        continue;
      }

      const data = await response.json();
      console.log(`✅ Test ${i + 1} successful:`);
      console.log("AI Probability:", data.ai_probability + "%");
      console.log("Human Probability:", data.human_probability + "%");
      console.log("Confidence:", data.confidence + "%");
      console.log("Analysis:", data.analysis);
      console.log("Status:", data.status);
    }

    return true;
  } catch (error) {
    console.error("❌ AI Detection test failed:");
    console.error("Error:", error.message);
    return false;
  }
}

// Wait for the dev server to start
setTimeout(() => {
  testAIDetection();
}, 3000);
