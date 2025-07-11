const fetch = require("node-fetch");

async function testAssignmentAPI() {
  try {
    console.log("Testing Assignment API endpoint...");

    const response = await fetch("http://localhost:3000/api/assignment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: "The impact of artificial intelligence on modern education",
        subject: "computer-science",
        level: "undergraduate",
        wordCount: 500,
        style: "academic",
        model: "gpt-3.5-turbo",
        humanLevel: 80,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Assignment API test failed:");
      console.error("Status:", response.status);
      console.error("Error:", errorText);
      return false;
    }

    const data = await response.json();
    console.log("✅ Assignment API is working!");
    console.log(
      "Generated assignment length:",
      data.assignment?.length || 0,
      "characters"
    );
    console.log("AI Score:", data.aiScore);
    console.log("Word Count:", data.wordCount);

    // Show first 200 characters of the assignment
    if (data.assignment) {
      console.log("\nAssignment preview:");
      console.log(data.assignment.substring(0, 200) + "...");
    }

    return true;
  } catch (error) {
    console.error("❌ Assignment API test failed:");
    console.error("Error:", error.message);
    return false;
  }
}

// Wait a bit for the dev server to start
setTimeout(() => {
  testAssignmentAPI();
}, 3000);
