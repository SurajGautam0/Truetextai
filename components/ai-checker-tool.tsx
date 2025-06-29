"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function AICheckerTool() {
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    aiProbability: number
    humanProbability: number
    confidence: number
    analysis: string
  } | null>(null)

  const handleCheck = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to analyze")
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/ai-checker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "You are an AI content detector. Analyze the following text and determine if it was written by AI or a human. Provide a detailed analysis."
            },
            {
              role: "user",
              content: inputText
            }
          ]
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze text")
      }

      // Parse the AI response to extract probabilities and analysis
      const aiProbability = parseFloat(data.content.match(/AI probability: (\d+\.?\d*)%/)?.[1] || "0")
      const humanProbability = 100 - aiProbability
      const confidence = parseFloat(data.content.match(/Confidence: (\d+\.?\d*)%/)?.[1] || "0")
      const analysis = data.content.split("\n\n").slice(2).join("\n\n") // Skip probability lines

      setResult({
        aiProbability,
        humanProbability,
        confidence,
        analysis
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div>
          <label htmlFor="input-text" className="block text-sm font-medium mb-2">
            Text to Analyze
          </label>
          <Textarea
            id="input-text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter the text you want to analyze..."
            className="min-h-[200px]"
          />
        </div>

        <Button
          onClick={handleCheck}
          disabled={isLoading || !inputText.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Check Text"
          )}
        </Button>

        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}

        {result && (
          <Card className="p-6">
            <h3 className="font-medium mb-4">Analysis Results</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">AI Probability</span>
                  <span className="text-sm text-gray-500">{result.aiProbability.toFixed(1)}%</span>
                </div>
                <Progress value={result.aiProbability} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Human Probability</span>
                  <span className="text-sm text-gray-500">{result.humanProbability.toFixed(1)}%</span>
                </div>
                <Progress value={result.humanProbability} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Confidence</span>
                  <span className="text-sm text-gray-500">{result.confidence.toFixed(1)}%</span>
                </div>
                <Progress value={result.confidence} className="h-2" />
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Detailed Analysis</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{result.analysis}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
