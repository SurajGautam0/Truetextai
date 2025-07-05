"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, BrainCircuit, FileText, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export function AICheckerTool() {
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    aiProbability: number
    humanProbability: number
    confidence: number
    analysis: string
  } | null>(null)

  const { toast } = useToast()

  const handleCheck = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some text to analyze",
        variant: "destructive"
      })
      return
    }

    if (inputText.trim().length < 50) {
      toast({
        title: "Text Too Short",
        description: "Please enter at least 50 characters for accurate analysis",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("https://truetextai2.onrender.com/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          text: inputText.trim()
        }),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      })

      // Check if the response is JSON before parsing
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("AI detection service is currently unavailable. Please try again later.")
      }

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || data.detail || `Analysis failed (${response.status})`
        throw new Error(errorMessage)
      }

      if (typeof data.ai_probability !== 'number') {
        throw new Error("Invalid response from AI detection service")
      }

      const aiProb = Math.max(0, Math.min(100, Math.round(data.ai_probability)))
      const humanProb = 100 - aiProb
      const confidence = data.confidence || Math.abs(50 - aiProb) * 2

      setResult({
        aiProbability: aiProb,
        humanProbability: humanProb,
        confidence: Math.min(100, confidence),
        analysis: data.analysis || `Analysis complete. ${aiProb}% probability of AI generation.`
      })

      toast({
        title: "Analysis Complete",
        description: `${aiProb < 30 ? 'Text appears human-written' : aiProb < 70 ? 'Mixed signals detected' : 'Likely AI-generated'}`,
        variant: aiProb < 30 ? "default" : "destructive"
      })

    } catch (error: any) {
      console.error("AI detection error:", error)
      
      let errorMessage = "Failed to analyze text"
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        errorMessage = "Request timed out. Please try with shorter text."
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = "Network error. Please check your connection and try again."
      } else if (error.message.includes('Unexpected token') || error.message.includes('JSON')) {
        errorMessage = "AI detection service is currently unavailable. Please try again later."
      } else if (error.message.includes('unavailable')) {
        errorMessage = "AI detection service is temporarily unavailable. Please try again later."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    if (!result) return <FileText className="h-5 w-5" />
    
    if (result.aiProbability < 30) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else if (result.aiProbability < 70) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    } else {
      return <AlertCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusText = () => {
    if (!result) return "Ready to analyze"
    
    if (result.aiProbability < 30) {
      return "Likely Human-Written"
    } else if (result.aiProbability < 70) {
      return "Potentially AI-Generated"
    } else {
      return "Likely AI-Generated"
    }
  }

  const getStatusColor = () => {
    if (!result) return "default"
    
    if (result.aiProbability < 30) {
      return "secondary"
    } else if (result.aiProbability < 70) {
      return "outline"
    } else {
      return "destructive"
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <BrainCircuit className="h-6 w-6 text-blue-600" />
          AI Content Detector
        </h1>
        <p className="text-muted-foreground">
          Analyze text to detect if it was generated by AI or written by a human
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Text Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste the text you want to analyze here..."
              className="min-h-[300px] resize-none"
            />
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Characters: {inputText.length}</span>
              <span>Words: {inputText.trim() ? inputText.trim().split(/\s+/).length : 0}</span>
            </div>

            <Button
              onClick={handleCheck}
              disabled={isLoading || !inputText.trim()}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BrainCircuit className="mr-2 h-5 w-5" />
                  Analyze Text
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon()}
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result && !isLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <BrainCircuit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter text above and click "Analyze Text" to see results</p>
              </div>
            )}

            {isLoading && (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
                <p className="text-muted-foreground">Analyzing your text...</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Status Badge */}
                <div className="text-center">
                  <Badge variant={getStatusColor()} className="text-sm px-3 py-1">
                    {getStatusText()}
                  </Badge>
                </div>

                {/* Probability Meters */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">AI Probability</span>
                      <span className="text-sm font-bold text-red-600">{result.aiProbability}%</span>
                    </div>
                    <Progress 
                      value={result.aiProbability} 
                      className="h-3"
                      style={{
                        background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${result.aiProbability}%, #e5e7eb ${result.aiProbability}%, #e5e7eb 100%)`
                      }}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Human Probability</span>
                      <span className="text-sm font-bold text-green-600">{result.humanProbability}%</span>
                    </div>
                    <Progress 
                      value={result.humanProbability} 
                      className="h-3"
                      style={{
                        background: `linear-gradient(to right, #22c55e 0%, #22c55e ${result.humanProbability}%, #e5e7eb ${result.humanProbability}%, #e5e7eb 100%)`
                      }}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Confidence Level</span>
                      <span className="text-sm font-bold text-blue-600">{result.confidence.toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={result.confidence} 
                      className="h-3"
                    />
                  </div>
                </div>

                {/* Analysis Summary */}
                <div className={`p-4 rounded-lg ${
                  result.aiProbability < 30 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : result.aiProbability < 70 
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  <h4 className={`font-medium mb-2 ${
                    result.aiProbability < 30 
                      ? 'text-green-800 dark:text-green-200' 
                      : result.aiProbability < 70 
                        ? 'text-yellow-800 dark:text-yellow-200'
                        : 'text-red-800 dark:text-red-200'
                  }`}>
                    Analysis Summary
                  </h4>
                  <p className={`text-sm ${
                    result.aiProbability < 30 
                      ? 'text-green-700 dark:text-green-300' 
                      : result.aiProbability < 70 
                        ? 'text-yellow-700 dark:text-yellow-300'
                        : 'text-red-700 dark:text-red-300'
                  }`}>
                    {result.analysis}
                  </p>
                </div>

                {/* Recommendations */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium mb-2 text-blue-800 dark:text-blue-200">
                    Recommendations
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {result.aiProbability < 30 
                      ? "This text appears naturally human-written and should pass most AI detection systems."
                      : result.aiProbability < 70 
                        ? "This text shows mixed signals. Consider revising for more natural language patterns."
                        : "This text is likely to be flagged by AI detection systems. Consider humanizing the content."}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
