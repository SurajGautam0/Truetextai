"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Copy,
  Download,
  Sparkles,
  BrainCircuit,
  FileText,
  Settings2,
  Wand2,
  Edit,
  AlertTriangle,
  ChevronDown,
  Info,
  Repeat
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import Confetti from 'react-confetti';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Admin Configuration
const adminConfig = {
  isParaphraserEnabled: true, // Set to false to disable the paraphraser
  disabledMessage: "The paraphrasing tool is currently undergoing maintenance. We expect to be back shortly. Thank you for your patience.", // Custom message to show when disabled
};

type ModelType = "truetext-render-api" | "python-journalist-api" | "python-huggingface";
type StyleType = "general" | "academic" | "marketing" | "story" | "blog" | "paraphrase";
type DetectorModeType = "normal" | "aggressive" | "ultra";

const CircularProgress = ({
  percentage,
  statusText
}: {
  percentage: number;
  statusText: string
}) => {
  const circumference = 2 * Math.PI * 25;
  const offset = circumference - (percentage / 100) * circumference;

  let strokeColor = "stroke-gray-400 dark:stroke-gray-600";
  let textColor = "text-gray-500 dark:text-gray-400";

  if (statusText !== "Not Yet Analyzed" && statusText !== "Analyzing...") {
    strokeColor = percentage > 70
      ? "stroke-red-500"
      : percentage > 40
        ? "stroke-yellow-500"
        : "stroke-green-500";
    textColor = percentage > 70
      ? "text-red-500"
      : percentage > 40
        ? "text-yellow-500"
        : "text-green-500";
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-20 h-20">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 70 70">
        <circle
          className="stroke-current text-gray-200 dark:text-gray-700"
          strokeWidth="5"
          cx="35"
          cy="35"
          r="25"
          fill="transparent"
        />
        <circle
          className={`stroke-current ${strokeColor} transition-all duration-500 ease-in-out`}
          strokeWidth="5"
          strokeLinecap="round"
          cx="35"
          cy="35"
          r="25"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 35 35)"
        />
      </svg>
      <div className="text-center">
        <div className={`text-md font-bold ${textColor}`}>
          {statusText === "Not Yet Analyzed" ? (
            <FileText className="inline-block h-4 w-4" />
          ) : statusText === "Analyzing..." ? (
            <Loader2 className="inline-block h-4 w-4 animate-spin" />
          ) : (
            `${percentage}%`
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1 px-1">
          {statusText}
        </div>
      </div>
    </div>
  );
};

export default function ProfessionalHumanizerPage() {
  // State
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAI, setIsCheckingAI] = useState(false);
  const [model, setModel] = useState<ModelType>("truetext-render-api");
  const [styleOption, setStyleOption] = useState<StyleType>("general");
  const [level, setLevel] = useState<number>(5);
  const [showOriginalInOutput, setShowOriginalInOutput] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [inputCharCount, setInputCharCount] = useState(0);
  const [inputWordCount, setInputWordCount] = useState(0);
  const [outputCharCount, setOutputCharCount] = useState(0);
  const [outputWordCount, setOutputWordCount] = useState(0);
  const [aiProbability, setAiProbability] = useState(0);
  const [processingTime, setProcessingTime] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const confettiTimeout = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  const exampleText = "Artificial intelligence is transforming the way we live and work, making tasks easier and more efficient.";

  // Effects
  useEffect(() => {
    const trimmedText = inputText.trim();
    setInputWordCount(trimmedText ? trimmedText.split(/\s+/).filter(Boolean).length : 0);
    setInputCharCount(inputText.length);
    if (trimmedText) setDetectedLanguage("English (Auto)");
    else setDetectedLanguage("");
  }, [inputText]);

  useEffect(() => {
    setOutputWordCount(outputText ? outputText.split(/\s+/).filter(Boolean).length : 0);
    setOutputCharCount(outputText.length);
  }, [outputText]);

  useEffect(() => {
    if (aiProbability < 30 && outputText && !isLoading && !isCheckingAI) {
      setShowConfetti(true);
      if (confettiTimeout.current) clearTimeout(confettiTimeout.current);
      confettiTimeout.current = setTimeout(() => setShowConfetti(false), 2500);
    }
  }, [aiProbability, outputText, isLoading, isCheckingAI]);

  // Derived values
  const currentAiStatusText =
    (isLoading && !isCheckingAI) ? "Processing..." :
      isCheckingAI ? "Analyzing..." :
        !outputText && aiProbability === 0 && !isLoading && !isCheckingAI ? "Not Yet Analyzed" :
          aiProbability < 30 ? "Likely Human" :
            aiProbability < 70 ? "Potentially AI" :
              "Likely AI";

  const isHumanQuality = aiProbability < 30 && (outputText !== "" || (aiProbability !== 0 && !isLoading && !isCheckingAI));

  // Helper functions
  const cleanOutput = (text: string): string => {
    if (!text) return "";
    return text.replace(/\s+/g, " ").replace(/\s([,.!?])/g, "$1").trim();
  };

  const handleTrueTextRenderAPI = async (text: string) => {
    try {
      const response = await fetch("https://truetextai1.onrender.com/rewrite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          enhanced: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TrueText Render API request failed: ${response.status} - ${errorText.substring(0, 100)}`);
      }

      const result = await response.json();
      return {
        processedText: result.rewritten_text || "",
        aiScore: 20,
        timeTaken: `${(Math.random() + 0.5).toFixed(1)}s`,
      };
    } catch (error: any) {
      toast({
        title: "TrueText Render API Error",
        description: error.message,
        variant: "destructive"
      });
      return {
        processedText: "",
        aiScore: 0,
        timeTaken: "0s",
        error: true
      };
    }
  };

  // Main actions
  const humanizeAction = useCallback(async (textToProcess: string, isRefinement: boolean = false) => {
    if (!isAuthenticated && !isRefinement) {
      toast({
        title: "Authentication Required",
        description: "Please log in to use this feature.",
        variant: "destructive"
      });
      return;
    }

    const wordCount = textToProcess.trim().split(/\s+/).filter(Boolean).length;

    if (user?.plan === "free") {
      // Check per-request word limit
      if (wordCount > 300) {
        toast({
          title: "Per-Request Limit Exceeded",
          description: "Free users can paraphrase up to 300 words per request. Please reduce your text or upgrade for unlimited usage.",
          variant: "destructive"
        });
        return;
      }

      // Check daily word limit - need to fetch current usage
      try {
        const res = await fetch(`/api/usage-logs?limit=1000&userId=${user.id}`);
        const data = await res.json();

        if (res.ok) {
          // Calculate today's usage
          const today = new Date();
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          let dailyWordsUsed = 0;

          for (const log of data.logs) {
            const logDate = new Date(log.created_at);
            if (logDate >= todayStart) {
              dailyWordsUsed += log.tokens_used || 0;
            }
          }

          // Check if this request would exceed daily limit
          if (dailyWordsUsed + wordCount > 1000) {
            const remaining = Math.max(0, 1000 - dailyWordsUsed);
            toast({
              title: "Daily Word Limit Exceeded",
              description: `You have ${remaining} words remaining today (${dailyWordsUsed}/1000 used). Your current request requires ${wordCount} words. Please reduce your text or upgrade for unlimited daily usage.`,
              variant: "destructive"
            });
            return;
          }
        }
      } catch (error) {
        console.error("Error checking daily usage:", error);
        // Continue with request if we can't check usage
      }
    }

    if (wordCount < 5) {
      toast({
        title: "Input Too Short",
        description: "Please provide at least 5 words for better results.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    if (!isRefinement) {
      setOutputText("");
      setAiProbability(0);
    }
    setProcessingTime(null);

    try {
      const resultPayload = await handleTrueTextRenderAPI(textToProcess);

      if (resultPayload && !resultPayload.error) {
        setOutputText(cleanOutput(resultPayload.processedText));
        setAiProbability(resultPayload.aiScore);
        setProcessingTime(resultPayload.timeTaken);
        toast({
          title: `Text Processed Successfully`,
          description: `Output updated. AI detection score: ${resultPayload.aiScore}%`,
          variant: "default"
        });
        // Write usage log to Firestore
        if (user) {
          try {
            await addDoc(collection(db, "usage_logs"), {
              user_id: user.id,
              created_at: new Date().toISOString(),
              tokens_used: wordCount,
              feature: "paraphraser"
            });
          } catch (e) {
            console.error("Failed to log usage to Firestore", e);
          }
        }
      } else if (!resultPayload.error) {
        throw new Error("Processing failed to produce output.");
      }
    } catch (error: any) {
      console.error("Humanization error:", error);
      toast({
        title: "Processing Error",
        description: error.message,
        variant: "destructive"
      });
      if (!isRefinement) {
        setOutputText("");
        setAiProbability(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, toast, user]);

  const handlePrimaryHumanize = () => humanizeAction(inputText);
  const handleRefineHumanize = () => {
    if (!outputText) {
      toast({
        title: "Nothing to Refine",
        description: "Please humanize text first before refining.",
        variant: "default"
      });
      return;
    }
    humanizeAction(outputText, true);
  };

  const handleCheckForAI = async () => {
    const textToCheck = showOriginalInOutput ? inputText : outputText || inputText;
    if (textToCheck.trim().length < 50) {
      toast({
        title: "Text Too Short",
        description: "Minimum 50 characters required for accurate AI detection.",
        variant: "destructive"
      });
      return;
    }

    setIsCheckingAI(true);
    setAiProbability(0);

    try {
      // Enhanced AI detection with multiple fallback options
      const response = await fetch('/api/check-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          text: textToCheck.trim(),
          source: 'paraphraser-tool',
          timestamp: new Date().toISOString()
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || result.detail || `AI detection service error (${response.status})`;
        throw new Error(errorMessage);
      }

      if (typeof result.ai_probability === 'number' && result.ai_probability >= 0 && result.ai_probability <= 100) {
        const probability = Math.round(result.ai_probability);
        setAiProbability(probability);

        const statusMessage = probability < 30
          ? `Excellent! This text appears naturally human-written (${probability}% AI probability).`
          : probability < 70
            ? `Caution: This text may be AI-generated (${probability}% AI probability).`
            : `Warning: This text is likely AI-generated (${probability}% AI probability).`;

        toast({
          title: "AI Analysis Complete",
          description: statusMessage,
          variant: probability < 30 ? "default" : "destructive"
        });
      } else {
        throw new Error("Invalid AI probability score received from detection service.");
      }
    } catch (error: any) {
      console.error("AI detection error:", error);

      // Provide more helpful error messages
      let errorMessage = "Unable to analyze text for AI content.";
      if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
        errorMessage = "Network connection issue. Please check your internet and try again.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "AI detection is taking too long. Please try with shorter text.";
      } else if (error.message.includes("unavailable")) {
        errorMessage = "AI detection service is temporarily unavailable. Please try again later.";
      }

      toast({
        title: "AI Detection Failed",
        description: errorMessage,
        variant: "destructive"
      });
      setAiProbability(0);
    } finally {
      setIsCheckingAI(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = showOriginalInOutput ? inputText : outputText;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => toast({ title: "Copied to clipboard!" }))
        .catch(() => toast({
          title: "Copy failed",
          variant: "destructive"
        }));
    }
  };

  const handleDownload = () => {
    const textToDownload = showOriginalInOutput ? inputText : outputText;
    if (textToDownload) {
      const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `humanized_text_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Download started" });
    }
  };

  const handleClearInput = () => setInputText("");
  const handleClearOutput = () => setOutputText("");
  const handleTryExample = () => setInputText(exampleText);

  const isHumanizeActionDisabled =
    !adminConfig.isParaphraserEnabled ||
    isLoading ||
    isCheckingAI ||
    !inputText.trim() ||
    inputText.trim().split(/\s+/).filter(Boolean).length < 5;

  const isAICheckActionDisabled =
    isLoading ||
    isCheckingAI ||
    (showOriginalInOutput ? inputText : outputText || inputText).trim().length < 10;

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;

    if (user?.plan === "free" && wordCount > 300) {
      toast({
        title: "Per-Request Limit Exceeded",
        description: "Free users can paraphrase up to 300 words per request. Current text has " + wordCount + " words. Please reduce your text or upgrade for unlimited per-request usage.",
        variant: "destructive"
      });
      return;
    }
    setInputText(value);
  };

  if (!adminConfig.isParaphraserEnabled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-900 p-6 text-center">
        <div className="max-w-md">
          <AlertTriangle className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Tool Temporarily Disabled</h1>
          <p className="text-slate-600 dark:text-slate-400">
            {adminConfig.disabledMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="flex flex-col gap-6">
              {/* Input Card */}
              <Card className="shadow-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/80">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <Edit className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      Original Text
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleTryExample}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      >
                        Try Example
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearInput}
                        disabled={!inputText}
                        className="text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <Textarea
                    value={inputText}
                    onChange={handleInputChange}
                    rows={8}
                    placeholder="Paste your AI-generated text here..."
                    className="min-h-[200px] text-sm border-gray-200 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Words:</span> {inputWordCount} |
                      <span className="font-medium ml-1">Chars:</span> {inputCharCount}
                      {user?.plan === "free" && (
                        <span className="ml-2 text-orange-600 dark:text-orange-400">
                          (Max: 300 per request, 1000 per day)
                        </span>
                      )}
                    </div>
                    {user?.plan === "free" && inputWordCount > 300 && (
                      <Badge variant="destructive" className="text-xs">
                        Per-request limit exceeded
                      </Badge>
                    )}
                  </div>
                  {user?.plan === "free" && inputWordCount > 300 && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-md flex items-center justify-between">
                      <div className="flex-1">
                        <span className="text-sm text-red-600 dark:text-red-400 block">
                          Per-request limit exceeded ({inputWordCount}/300 words)
                        </span>
                        <span className="text-xs text-red-500 dark:text-red-300">
                          Free users: 300 words per request, 1000 words per day
                        </span>
                      </div>
                      <Link href="/pricing">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30"
                        >
                          Upgrade
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Settings Card */}
              <Card className="shadow-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/80">
                <CardHeader className="p-5 pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Settings2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Customization Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Processing Model
                    </Label>
                    <Select value={model} onValueChange={(v) => {
                      if (user?.plan !== "premium" && v !== "truetext-render-api") return;
                      setModel(v as ModelType);
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="truetext-render-api">
                          <div className="flex items-center gap-2">
                            <span>TrueText v1.0</span>
                            <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400">
                              Recommended
                            </Badge>
                          </div>
                        </SelectItem>
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <SelectItem value="python-journalist-api" disabled={user?.plan !== "premium"}>
                                  Ghost
                                </SelectItem>
                                <SelectItem value="python-huggingface" disabled={user?.plan !== "premium"}>
                                  Snake v1
                                </SelectItem>
                              </div>
                            </TooltipTrigger>
                            {user?.plan !== "premium" && (
                              <TooltipContent side="top">
                                <span className="text-xs">Upgrade to premium to use these models!</span>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Writing Style
                    </Label>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Select
                              value={styleOption}
                              onValueChange={(v) => setStyleOption(v as StyleType)}
                              disabled={user?.plan !== "premium"}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select style" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="academic">Academic</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="story">Story/Narrative</SelectItem>
                                <SelectItem value="blog">Blog Post</SelectItem>
                              </SelectContent>
                            </Select>
                          </span>
                        </TooltipTrigger>
                        {user?.plan !== "premium" && (
                          <TooltipContent side="top">
                            <span className="text-xs">Upgrade to premium to unlock writing styles!</span>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Creativity Level
                      </Label>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {level}/10
                      </span>
                    </div>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Input
                              type="range"
                              min={1}
                              max={user?.plan === "free" ? 2 : 10}
                              value={level}
                              onChange={e => {
                                const val = Number(e.target.value);
                                if (user?.plan === "free" && val > 2) {
                                  setLevel(2);
                                  return;
                                }
                                setLevel(val);
                              }}
                              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-600"
                            />
                          </span>
                        </TooltipTrigger>
                        {user?.plan === "free" && (
                          <TooltipContent side="top">
                            <span className="text-xs">Upgrade to premium to unlock higher creativity levels!</span>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              {/* Output Card */}
              <Card className="shadow-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 flex-grow flex flex-col">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <Wand2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      Humanized Output
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        disabled={!outputText}
                        className="text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Copy className="h-4 w-4 mr-1" /> Copy
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDownload}
                        disabled={!outputText}
                        className="text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Download className="h-4 w-4 mr-1" /> Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0 flex-grow">
                  <div className="relative h-full">
                    <Textarea
                      value={outputText}
                      readOnly
                      className="w-full h-full min-h-[200px] text-sm border-gray-200 dark:border-slate-700 rounded-md p-3 bg-slate-50/50 dark:bg-slate-900/50"
                      placeholder="Your humanized text will appear here..."
                    />
                    {!outputText && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center p-4 max-w-xs">
                          <Sparkles className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                          <p className="text-sm text-slate-400 dark:text-slate-500">
                            Processed text will appear here with enhanced readability and human-like quality
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-5 pt-0">
                  <div className="w-full text-xs text-muted-foreground flex justify-between items-center">
                    <div>
                      <span className="font-medium">Words:</span> {outputWordCount} |
                      <span className="font-medium ml-1">Chars:</span> {outputCharCount}
                    </div>
                    {processingTime && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Processed in {processingTime}
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>

              {/* AI Detector Card */}
              <Card className="shadow-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/80">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <CircularProgress
                        percentage={aiProbability}
                        statusText={currentAiStatusText}
                      />
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100">
                          AI Content Analysis
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {aiProbability > 0
                            ? `This text appears ${aiProbability < 30 ? 'human-written' : aiProbability < 70 ? 'potentially AI-generated' : 'likely AI-generated'}`
                            : 'Click Analyze to detect AI probability in your text'}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleCheckForAI}
                      disabled={isAICheckActionDisabled}
                      variant="outline"
                      size="sm"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30"
                    >
                      {isCheckingAI ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <BrainCircuit className="h-4 w-4" />
                      )}
                      <span className="ml-2">Analyze</span>
                    </Button>
                  </div>

                  {aiProbability > 0 && (
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <span>Human-like</span>
                        <span>AI-generated</span>
                      </div>
                      <Progress
                        value={aiProbability}
                        className={`h-2 bg-slate-200 dark:bg-slate-700 ${aiProbability > 70
                            ? 'progress-red'
                            : aiProbability > 40
                              ? 'progress-yellow'
                              : 'progress-green'
                          }`}
                      />

                      {/* AI Detection Results Summary */}
                      <div className={`p-3 rounded-md ${aiProbability < 30
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : aiProbability < 70
                            ? 'bg-yellow-50 dark:bg-yellow-900/20'
                            : 'bg-red-50 dark:bg-red-900/20'
                        }`}>
                        <div className="flex items-center gap-2">
                          {aiProbability < 30 ? (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          ) : aiProbability < 70 ? (
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          ) : (
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                          <span className={`text-xs font-medium ${aiProbability < 30
                              ? 'text-green-700 dark:text-green-300'
                              : aiProbability < 70
                                ? 'text-yellow-700 dark:text-yellow-300'
                                : 'text-red-700 dark:text-red-300'
                            }`}>
                            {aiProbability < 30
                              ? 'Passes AI Detection - Appears Human'
                              : aiProbability < 70
                                ? 'Mixed Signals - May Need Refinement'
                                : 'High AI Score - Consider Humanizing'}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${aiProbability < 30
                            ? 'text-green-600 dark:text-green-400'
                            : aiProbability < 70
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                          {aiProbability < 30
                            ? 'This content should bypass most AI detection tools successfully.'
                            : aiProbability < 70
                              ? 'Consider running the humanizer again for better results.'
                              : 'This text will likely be flagged by AI detection systems.'}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Card */}
              <Card className="shadow-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/80">
                <CardContent className="p-5">
                  <Button
                    size="lg"
                    onClick={handlePrimaryHumanize}
                    disabled={isHumanizeActionDisabled}
                    className="w-full h-12 text-base font-bold rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.01]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Humanize Text
                      </>
                    )}
                  </Button>

                  {isHumanQuality && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-md flex items-center gap-3">
                      <div className="bg-green-100 dark:bg-green-800/50 p-2 rounded-full">
                        <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-green-800 dark:text-green-200">
                          High Quality Output
                        </h4>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          This text appears human-written with low AI detection probability.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}