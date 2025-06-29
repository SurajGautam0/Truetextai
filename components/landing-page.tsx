"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Brain,
  CheckCircle,
  Shield,
  Zap,
  Star,
  ArrowRight,
  MessageSquare,
  FileText,
  BarChart3,
  ChevronRight,
  Sparkles,
  Loader2,
  Download,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { checkText } from "@/lib/ai-checker"
import { paraphraseText } from "@/lib/openrouter-paraphrase"
import { CircularProgress } from "@/components/ui/circular-progress"

export default function LandingPage() {
  const [inputText, setInputText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [aiScore, setAiScore] = useState<number | null>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [paraphrasedText, setParaphrasedText] = useState("")
  const [paraphraseMetrics, setParaphraseMetrics] = useState<{
    originalWords: number;
    paraphrasedWords: number;
    wordChange: number;
    creativity: number;
  } | null>(null)
  const { toast } = useToast()

  const handleCheck = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to check",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)
    setAiScore(null)
    setAnalysis(null)

    try {
      const response = await checkText(inputText)
      setAiScore(response.aiProbability)
      setAnalysis(response.analysis)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to check text"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleParaphrase = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to paraphrase",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)
    setParaphrasedText("")
    setParaphraseMetrics(null)

    try {
      const response = await paraphraseText(inputText, 50) // Default creativity level
      setParaphrasedText(response.paraphrasedText)
      setParaphraseMetrics({
        originalWords: response.metrics.originalWords,
        paraphrasedWords: response.metrics.paraphrasedWords,
        wordChange: response.metrics.wordChange,
        creativity: 50
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to paraphrase text"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score < 30) return "text-green-500"
    if (score < 70) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreLabel = (score: number) => {
    if (score < 30) return "Likely Human"
    if (score < 70) return "Uncertain"
    return "Likely AI"
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Brain className="h-6 w-6 text-primary" />
            <span>TrueTextAI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/paraphraser" className="text-sm font-medium hover:text-primary transition-colors">
              Humanizer
            </Link>
            <Link href="/ai-checker" className="text-sm font-medium hover:text-primary transition-colors">
              AI Detector
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Try For Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/10" />
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                AI Text Revolution
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Make AI Content Undetectable
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-8">
                TrueTextAI transforms AI-generated content into natural, human-like text that bypasses AI detectors
                while maintaining your original message.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-md w-full sm:w-auto"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-md w-full sm:w-auto">
                    See Demo
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border-2 border-background"
                    >
                      <span className="text-xs font-medium">{i}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">1,000+</span> users trust TrueTextAI
                </p>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl blur-sm opacity-50"></div>
              <div className="relative bg-background rounded-xl shadow-xl overflow-hidden border">
                <div className="p-4 border-b bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="ml-2 text-sm font-medium">TrueTextAI Humanizer</div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm">
                        <span className="font-semibold">Original AI Text:</span> The utilization of artificial
                        intelligence in content creation has become increasingly prevalent in modern digital marketing
                        strategies.
                      </p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-sm">
                        <span className="font-semibold">Human-like Version:</span> More and more marketers are using AI
                        to create content these days. It's becoming a key part of modern digital marketing.
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20"
                        >
                          100% Human Score
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20"
                        >
                          SEO Optimized
                        </Badge>
                      </div>
                      <Button size="sm" variant="ghost">
                        Try Again
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              Powerful Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need in One Place</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive suite of AI tools helps you create, enhance, and verify content with confidence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageSquare className="h-10 w-10 text-primary" />,
                title: "AI Text Humanizer",
                description:
                  "Transform robotic AI content into natural, human-like text that bypasses AI detection tools.",
              },
              {
                icon: <Shield className="h-10 w-10 text-primary" />,
                title: "AI Content Detector",
                description: "Verify if content was written by AI or a human with our advanced detection technology.",
              },
              {
                icon: <FileText className="h-10 w-10 text-primary" />,
                title: "Assignment Writer",
                description: "Generate academic content that reads naturally and passes plagiarism checks.",
              },
              {
                icon: <Zap className="h-10 w-10 text-primary" />,
                title: "Instant Paraphrasing",
                description:
                  "Quickly rewrite content while maintaining the original meaning and improving readability.",
              },
              {
                icon: <BarChart3 className="h-10 w-10 text-primary" />,
                title: "SEO Optimization",
                description: "Enhance your content for search engines while keeping it natural and engaging.",
              },
              {
                icon: <CheckCircle className="h-10 w-10 text-primary" />,
                title: "Plagiarism-Free",
                description: "Ensure your content is unique and passes plagiarism checks with flying colors.",
              },
            ].map((feature, index) => (
              <Card key={index} className="border bg-background hover:shadow-md transition-all hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="mb-4 p-3 bg-primary/10 inline-block rounded-lg">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                  <Link href="#" className="mt-4 inline-flex items-center text-primary font-medium hover:underline">
                    Learn more <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              Try It Yourself
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See TrueTextAI in Action</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the power of our AI text tools with this interactive demo.
            </p>
          </div>

          <div className="max-w-4xl mx-auto border rounded-xl shadow-lg p-6 bg-background">
            <Tabs defaultValue="checker" className="w-full">
              <TabsList className="mb-6 grid grid-cols-2 max-w-md mx-auto">
                <TabsTrigger value="checker">AI Checker</TabsTrigger>
                <TabsTrigger value="humanizer">Text Humanizer</TabsTrigger>
              </TabsList>

              <TabsContent value="checker" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="demo-text">Text to Check</Label>
                    <Textarea
                      id="demo-text"
                      placeholder="Enter your text here to check if it was written by AI..."
                      className="min-h-[200px] resize-none bg-background/50 border-border text-foreground"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>{inputText.length} characters</span>
                      <span>{inputText.split(/\s+/).filter(Boolean).length} words</span>
                    </div>
                  </div>

                  <div className="flex items-end">
                    <Button
                      className="w-full h-12 text-lg"
                      onClick={handleCheck}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-5 w-5" />
                          Check Text
                        </>
                      )}
                    </Button>
                  </div>

                  {error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  {aiScore !== null && (
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">AI Probability Score</span>
                          <span className={`text-sm font-medium ${getScoreColor(aiScore)}`}>
                            {getScoreLabel(aiScore)}
                          </span>
                        </div>
                        <Progress value={aiScore} className="h-2" />
                      </div>

                      {analysis && (
                        <div className="space-y-4 mt-4">
                          {/* Metrics */}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="p-2 bg-background/50 rounded">
                              <span className="text-muted-foreground">Words:</span> {analysis.metrics.wordCount}
                            </div>
                            <div className="p-2 bg-background/50 rounded">
                              <span className="text-muted-foreground">Sentences:</span> {analysis.metrics.sentenceCount}
                            </div>
                            <div className="p-2 bg-background/50 rounded">
                              <span className="text-muted-foreground">Avg. Word Length:</span> {analysis.metrics.avgWordLength.toFixed(1)}
                            </div>
                            <div className="p-2 bg-background/50 rounded">
                              <span className="text-muted-foreground">Avg. Sentence Length:</span> {analysis.metrics.avgSentenceLength.toFixed(1)}
                            </div>
                          </div>

                          {/* Patterns */}
                          {(analysis.patterns.repetitivePhrases.length > 0 || 
                            analysis.patterns.aiPatterns.length > 0 || 
                            analysis.patterns.formalPhrases.length > 0) && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Detected Patterns</h4>
                              {analysis.patterns.repetitivePhrases.length > 0 && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Repetitive phrases:</span>
                                  <ul className="list-disc list-inside ml-2">
                                    {analysis.patterns.repetitivePhrases.map((phrase: string, i: number) => (
                                      <li key={i}>{phrase}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {analysis.patterns.aiPatterns.length > 0 && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">AI patterns:</span>
                                  <ul className="list-disc list-inside ml-2">
                                    {analysis.patterns.aiPatterns.map((pattern: string, i: number) => (
                                      <li key={i}>{pattern}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {analysis.patterns.formalPhrases.length > 0 && (
                                <div className="text-sm">
                                  <span className="text-muted-foreground">Formal phrases:</span>
                                  <ul className="list-disc list-inside ml-2">
                                    {analysis.patterns.formalPhrases.map((phrase: string, i: number) => (
                                      <li key={i}>{phrase}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Suggestions */}
                          {analysis.suggestions.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Suggestions</h4>
                              <ul className="list-disc list-inside ml-2 text-sm">
                                {analysis.suggestions.map((suggestion: string, i: number) => (
                                  <li key={i}>{suggestion}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground text-center">
                      Sign up for unlimited checks and advanced features
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="humanizer" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="humanizer-text">Text to Humanize</Label>
                    <Textarea
                      id="humanizer-text"
                      placeholder="Enter AI-generated text here to make it more human-like..."
                      className="min-h-[200px] resize-none bg-background/50 border-border text-foreground"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>{inputText.length} characters</span>
                      <span>{inputText.split(/\s+/).filter(Boolean).length} words</span>
                    </div>
                  </div>

                  <div className="flex items-end">
                    <Button
                      className="w-full h-12 text-lg"
                      onClick={handleParaphrase}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Paraphrasing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Humanize Text
                        </>
                      )}
                    </Button>
                  </div>

                  {error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  {paraphrasedText && (
                    <div className="space-y-6 p-4 bg-muted/50 rounded-lg">
                      {/* Humanized Text Preview Header */}
                      <h3 className="text-lg font-semibold text-center mb-2">Humanized Text Preview</h3>
                      <div className="flex flex-col items-center gap-2 mb-4">
                        <div className="text-sm text-muted-foreground text-center">
                          All content appears to be written by a human. No AI-generated content detected.
                        </div>
                        <div className="flex flex-col items-center my-4">
                          <CircularProgress value={0} size={100} strokeWidth={10} label="0%" />
                          <div className="mt-2 text-base font-medium">AI Detected</div>
                        </div>
                      </div>

                      {/* Humanization Settings (static for now) */}
                      <div className="flex flex-wrap gap-2 items-center justify-center mb-4">
                        <select className="rounded px-2 py-1 bg-background border text-sm">
                          <option>Ninja 4.1 (Recommended)</option>
                        </select>
                        <select className="rounded px-2 py-1 bg-background border text-sm">
                          <option>Level 10</option>
                        </select>
                        <select className="rounded px-2 py-1 bg-background border text-sm">
                          <option>General (default)</option>
                        </select>
                        <button className="rounded px-3 py-1 bg-muted text-xs font-medium border">Humanize More</button>
                        <label className="flex items-center gap-1 text-xs cursor-pointer">
                          <input type="checkbox" className="accent-primary" />
                          Re-humanize Weak Human Sentences
                        </label>
                      </div>

                      {/* View Options (static for now) */}
                      <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                        <div className="flex gap-2 items-center">
                          <label className="flex items-center gap-1 text-xs cursor-pointer">
                            <input type="radio" name="viewOption" defaultChecked className="accent-primary" />
                            Show Original Text
                          </label>
                          <label className="flex items-center gap-1 text-xs cursor-pointer">
                            <input type="radio" name="viewOption" className="accent-primary" />
                            Remove Highlights
                          </label>
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className="text-xs">Draft 1</span>
                          <Button size="sm" variant="outline" className="px-2 py-1 text-xs flex gap-1 items-center" onClick={() => {navigator.clipboard.writeText(paraphrasedText); toast({title: "Copied!", description: "Paraphrased text copied to clipboard"});}}>
                            <FileText className="h-4 w-4" /> Copy
                          </Button>
                        </div>
                      </div>

                      {/* Humanized Text with Highlight */}
                      <div className="p-3 bg-green-100/80 rounded border border-green-300">
                        <span className="text-sm text-green-900">{paraphrasedText}</span>
                      </div>

                      {/* Word/Character Count and Legend */}
                      <div className="flex flex-wrap items-center justify-between mt-4 text-xs text-muted-foreground">
                        <span>{paraphrasedText.length} characters | {paraphraseMetrics?.paraphrasedWords ?? paraphrasedText.split(/\s+/).filter(Boolean).length} words</span>
                        <div className="flex gap-3 items-center">
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-300 inline-block"></span> Human</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block"></span> Human (High Impact)</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-400 inline-block"></span> AI</span>
                        </div>
                      </div>
                      <div className="text-xs text-right mt-1 text-muted-foreground">
                        Model: ninja-v4.1 | Level: 10 | Time: ~6.8s
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground text-center">
                      Sign up for unlimited paraphrasing and advanced features
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-8 text-center">
              <Link href="/signup">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                No credit card required. Start with 5 free checks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied users who have transformed their content with TrueTextAI.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Content Marketer",
                image: "/placeholder.svg?height=80&width=80",
                content:
                  "TrueTextAI has completely transformed our content strategy. We can now create AI content that reads naturally and passes all detection tools. It's saved us countless hours of editing.",
                rating: 5,
              },
              {
                name: "Michael Chen",
                role: "SEO Specialist",
                image: "/placeholder.svg?height=80&width=80",
                content:
                  "The humanizer tool is incredible. Our content now ranks better in search engines and engages readers more effectively. The AI detection feature also helps us verify content from freelancers.",
                rating: 5,
              },
              {
                name: "Sujan Nepali",
                role: "Academic Writer",
                image: "/placeholder.svg?height=80&width=80",
                content:
                  "As a student, the assignment writer has been a lifesaver. It helps me create well-structured essays that sound natural and pass all my university's plagiarism checks.",
                rating: 4,
              },
              {
                name: "Subash R",
                role: "Digital Agency Owner",
                image: "/placeholder.svg?height=80&width=80",
                content:
                  "We've integrated TrueTextAI into our agency workflow and the results have been outstanding. Our clients are thrilled with the quality of content we're able to deliver at scale.",
                rating: 5,
              },
              {
                name: "SummnimaGautam",
                role: "Freelance Writer",
                image: "/placeholder.svg?height=80&width=80",
                content:
                  "The paraphrasing tool helps me overcome writer's block and generate fresh perspectives on topics I've written about many times. It's like having a writing partner.",
                rating: 4,
              },
              {
                name: "Anil",
                role: "E-commerce Manager",
                image: "/placeholder.svg?height=80&width=80",
                content:
                  "We use TrueTextAI for product descriptions and marketing copy. The quality is exceptional, and it's helped us scale our content production while maintaining a consistent brand voice.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="border bg-background hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                      <img
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-muted"}`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Content?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Join thousands of writers, marketers, and students who are creating undetectable AI content with
              TrueTextAI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-md w-full sm:w-auto"
                >
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-md w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Link href="/" className="font-bold text-xl flex items-center">
                <Brain className="h-5 w-5 mr-2 text-primary" />
                <span>TrueTextAI</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-md">
                TrueTextAI helps you create human-like content that bypasses AI detection while maintaining quality and
                readability. Perfect for content creators, marketers, students, and professionals.
              </p>
              <div className="flex gap-4 pt-4">
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    AI Text Humanizer
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    AI Content Detector
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Assignment Writer
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Paraphrasing Tool
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Press Kit
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    API Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Community Forum
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Tutorials
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} TrueTextAI. All rights reserved.
              </p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Accessibility
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
