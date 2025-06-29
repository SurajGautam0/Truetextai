/**
 * A simple fallback paraphraser that makes minimal changes to the text
 * when the Groq API is unavailable
 */
export function fallbackParaphrase(text: string, level = "medium"): string {
  if (!text) return ""

  // Split the text into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]

  // Apply simple transformations based on the level
  const transformedSentences = sentences.map((sentence, index) => {
    // Skip some sentences based on the level
    if (level === "light" && index % 3 !== 0) return sentence
    if (level === "medium" && index % 2 !== 0) return sentence

    // Simple word replacements (very basic)
    return sentence
      .replace(/\bvery\b/gi, "extremely")
      .replace(/\bgood\b/gi, "excellent")
      .replace(/\bbad\b/gi, "poor")
      .replace(/\bnice\b/gi, "pleasant")
      .replace(/\bsaid\b/gi, "mentioned")
      .replace(/\bthink\b/gi, "believe")
      .replace(/\bsmall\b/gi, "tiny")
      .replace(/\bbig\b/gi, "large")
  })

  return transformedSentences.join(" ") + "\n\n[Note: Using fallback paraphrasing due to API unavailability]"
}
