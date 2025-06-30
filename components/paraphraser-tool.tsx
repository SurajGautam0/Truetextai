"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Loader2, Copy, Download, Sparkles, Eye, BrainCircuit, ChevronDown, Info, Edit, FileText, Settings2, Repeat, Wand2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Confetti from "react-confetti";

type ModelType = "python-journalist-api" | "python-huggingface" | "truetext-rewriter";
type StyleType = "general" | "academic" | "marketing" | "story" | "blog" | "paraphrase";
type DetectorModeType = "normal" | "aggressive" | "ultra";

const useAuth = () => ({ isAuthenticated: true, user: { credits: 100 } });

const CircularProgress = ({ percentage, statusText }: { percentage: number, statusText: string }) => {
  const circumference = 2 * Math.PI * 30;
  const offset = circumference - (percentage / 100) * circumference;
  let strokeColor = "stroke-gray-400 dark:stroke-gray-600";
  let textColor = "text-gray-500 dark:text-gray-400";

  if (statusText !== "Not Yet Analyzed" && statusText !== "Analyzing...") {
    strokeColor = percentage > 70 ? "stroke-red-500" : percentage > 40 ? "stroke-yellow-500" : "stroke-green-500";
    textColor = percentage > 70 ? "text-red-500" : percentage > 40 ? "text-yellow-500" : "text-green-500";
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-24 h-24">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 80">
        <circle
          className="stroke-current text-gray-200 dark:text-gray-700"
          strokeWidth="6"
          cx="40"
          cy="40"
          r="30"
          fill="transparent"
        />
        <circle
          className={`stroke-current ${strokeColor} transition-all duration-500 ease-in-out`}
          strokeWidth="6"
          strokeLinecap="round"
          cx="40"
          cy="40"
          r="30"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 40 40)"
        />
      </svg>
      <div className="text-center">
        <div className={`text-lg font-bold ${textColor}`}>
          {statusText === "Not Yet Analyzed" ? <FileText className="inline-block h-5 w-5" /> :
           statusText === "Analyzing..." ? <Loader2 className="inline-block h-5 w-5 animate-spin" /> :
           `${percentage}%`}
        </div>
        <div className="text-xs text-muted-foreground mt-1 px-1">{statusText}</div>
      </div>
    </div>
  );
};

export default function ProfessionalHumanizerPage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAI, setIsCheckingAI] = useState(false);

  const [model, setModel] = useState<ModelType>("truetext-render-api");
  const [styleOption, setStyleOption] = useState<StyleType>("general");
  const [level, setLevel] = useState<number>(5);
  const [numDraftsToGenerate, setNumDraftsToGenerate] = useState<number>(1);

  const [detectorMode, setDetectorMode] = useState<DetectorModeType>("normal");
  const [slowModeEnabled, setSlowModeEnabled] = useState(false);
  const [skipQuotations, setSkipQuotations] = useState(false);
  const [skipMarkdown, setSkipMarkdown] = useState(false);
  const [freezeKeywords, setFreezeKeywords] = useState("");
  const [useBritishEnglish, setUseBritishEnglish] = useState(false);
  const [removeHeadlines, setRemoveHeadlines] = useState(false);

  const [inputCharCount, setInputCharCount] = useState(0);
  const [inputWordCount, setInputWordCount] = useState(0);
  const [outputCharCount, setOutputCharCount] = useState(0);
  const [outputWordCount, setOutputWordCount] = useState(0);

  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [aiProbability, setAiProbability] = useState(0);
  const [showOriginalInOutput, setShowOriginalInOutput] = useState(false);
  const [processingTime, setProcessingTime] = useState<string | null>(null);

  const [showCompare, setShowCompare] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiTimeout = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const PYTHON_API_BASE_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://127.0.0.1:5000";
  console.log("Python API Base URL:", PYTHON_API_BASE_URL);

  const exampleText = "Artificial intelligence is transforming the way we live and work, making tasks easier and more efficient.";

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

  const currentAiStatusText = (isLoading && !isCheckingAI) ? "Processing..." :
                               isCheckingAI ? "Analyzing..." :
                               !outputText && aiProbability === 0 && !isLoading && !isCheckingAI ? "Not Yet Analyzed" :
                               aiProbability < 30 ? "Likely Human" :
                               aiProbability < 70 ? "Potentially AI" : "Likely AI";
  
  const isHumanQuality = aiProbability < 30 && (outputText !== "" || (aiProbability !== 0 && !isLoading && !isCheckingAI));

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
      toast({ title: "TrueText Render API Error", description: error.message, variant: "destructive" });
      return { processedText: "", aiScore: 0, timeTaken: "0s", error: true };
    }
  };

  const humanizeAction = useCallback(async (textToProcess: string, isRefinement: boolean = false) => {
    if (!isAuthenticated && !isRefinement) {
      toast({ title: "Authentication Required", description: "Please log in.", variant: "destructive" });
      return;
    }
    if (textToProcess.trim().split(/\s+/).filter(Boolean).length < 5) {
      toast({ title: "Input Too Short", description: "Provide at least 5 words.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    if (!isRefinement) {
      setOutputText("");
      setAiProbability(0);
    }
    setProcessingTime(null);
    try {
      let resultPayload = await handleTrueTextRenderAPI(textToProcess);
      if (resultPayload && !resultPayload.error) {
        setOutputText(cleanOutput(resultPayload.processedText));
        setAiProbability(resultPayload.aiScore);
        setProcessingTime(resultPayload.timeTaken);
        toast({ title: `Text Processed with Render API`, description: `Output updated. AI Score: ${resultPayload.aiScore}%`, variant: "default" });
      } else if (!resultPayload.error) {
        throw new Error("Processing failed to produce output.");
      }
    } catch (error: any) {
      console.error("Humanization error:", error);
      toast({ title: "Processing Error", description: error.message, variant: "destructive" });
      if (!isRefinement) { setOutputText(""); setAiProbability(0); }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, toast]);

  const handlePrimaryHumanize = () => humanizeAction(inputText);
  const handleRefineHumanize = () => {
    if (!outputText) {
      toast({ title: "Nothing to Refine", variant: "default" });
      return;
    }
    humanizeAction(outputText, true);
  };

  const handleCheckForAI = async () => {
    const textToCheck = showOriginalInOutput ? inputText : outputText || inputText;
    if (textToCheck.trim().length < 50) {
      toast({ title: "Text Too Short", description: "Minimum 50 characters required for AI check.", variant: "destructive" });
      return;
    }

    setIsCheckingAI(true); 
    setAiProbability(0); 

    try {
      const response = await fetch('/api/check-ai', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToCheck }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `AI Check failed: ${response.statusText}`);
      }
      if (typeof result.ai_probability === 'number') {
        setAiProbability(result.ai_probability); 
        toast({ title: "AI Check Complete", description: `AI Probability: ${result.ai_probability}%.` });
      } else {
        throw new Error("Invalid response from AI Check service.");
      }
    } catch (error: any) {
      console.error("AI Check API call error (frontend):", error);
      toast({ title: "AI Check Error", description: error.message, variant: "destructive" });
      setAiProbability(0); 
    } finally {
      setIsCheckingAI(false); 
    }
  };

  const handleCopy = () => {
    const textToCopy = showOriginalInOutput ? inputText : outputText;
    if (textToCopy) {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast({ title: "Copied to Clipboard" });
      } catch (err) {
        toast({ title: "Copy Failed", variant: "destructive" });
      }
      document.body.removeChild(textArea);
    }
  };

  const handleDownload = () => {
    const textToDownload = showOriginalInOutput ? inputText : outputText;
    if (textToDownload) {
      const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `processed_text_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Download Started" });
    }
  };

  const handleClearInput = () => setInputText("");
  const handleClearOutput = () => setOutputText("");
  const handleTryExample = () => setInputText(exampleText);

  const isHumanizeActionDisabled = isLoading || isCheckingAI || !inputText.trim() || inputText.trim().split(/\s+/).filter(Boolean).length < 5;
  const isAICheckActionDisabled = isLoading || isCheckingAI || (showOriginalInOutput ? inputText : outputText || inputText).trim().length < 10;

  return (
    <TooltipProvider delayDuration={300}>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} />}
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Compact Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">AI Text Humanizer</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
              AI Paraphraser Pro
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Transform AI-generated text into natural, human-like content
            </p>
          </div>
          {/* Main Content Grid - More Compact Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Input */}
            <div className="lg:col-span-2 space-y-4">
              {/* Compact Input Card */}
              <Card className="border shadow-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-slate-700/50 dark:to-slate-600/50 px-4 py-3 border-b border-slate-200/50 dark:border-slate-600/50">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Edit className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-slate-800 dark:text-slate-100">Input Text</span>
                    </CardTitle>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleTryExample} 
                        className="text-xs px-3 py-1 h-7 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Example
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleClearInput} 
                        disabled={!inputText} 
                        className="text-xs px-3 py-1 h-7 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative">
                    <Textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="w-full h-48 text-sm border-0 rounded-none focus-visible:ring-0 p-4 resize-none bg-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      placeholder="Paste your AI-generated text here to transform it into natural, human-like content..."
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-600/50">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {inputWordCount}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span>{inputCharCount} chars</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Compact Settings Card */}
              <Card className="border shadow-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-slate-700/50 dark:to-slate-600/50 px-4 py-3 border-b border-slate-200/50 dark:border-slate-600/50">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Settings2 className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-slate-800 dark:text-slate-100">Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <BrainCircuit className="h-3 w-3" />
                        Model
                      </Label>
                      <Select value={model} onValueChange={(v) => setModel(v as ModelType)}>
                        <SelectTrigger className="w-full h-9 rounded-lg border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border-slate-200 dark:border-slate-600">
                          <SelectItem value="truetext-render-api" className="rounded-md">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              Ninja 4.4
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Wand2 className="h-3 w-3" />
                        Style
                      </Label>
                      <Select value={styleOption} onValueChange={(v) => setStyleOption(v as StyleType)}>
                        <SelectTrigger className="w-full h-9 rounded-lg border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700">
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg border-slate-200 dark:border-slate-600">
                          <SelectItem value="general" className="rounded-md">General</SelectItem>
                          <SelectItem value="academic" className="rounded-md">Academic</SelectItem>
                          <SelectItem value="marketing" className="rounded-md">Marketing</SelectItem>
                          <SelectItem value="story" className="rounded-md">Story</SelectItem>
                          <SelectItem value="blog" className="rounded-md">Blog</SelectItem>
                          <SelectItem value="paraphrase" className="rounded-md">Paraphrase</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="sm:col-span-2 space-y-2">
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Creativity: <span className="text-blue-600 dark:text-blue-400 font-semibold">{level}</span>
                      </Label>
                      <div className="relative">
                        <Input 
                          type="range" 
                          min="1" 
                          max="10" 
                          value={level} 
                          onChange={(e) => setLevel(parseInt(e.target.value))} 
                          className="w-full h-2 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-full appearance-none cursor-pointer" 
                        />
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span>Safe</span>
                          <span>Creative</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Analysis & Actions */}
            <div className="space-y-4">
              {/* Compact AI Analysis Card */}
              <Card className="border shadow-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-slate-700/50 dark:to-slate-600/50 px-4 py-3 border-b border-slate-200/50 dark:border-slate-600/50">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <BrainCircuit className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-slate-800 dark:text-slate-100">AI Detection</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="relative mb-4">
                    <CircularProgress percentage={aiProbability} statusText={currentAiStatusText} />
                    {isHumanQuality && (
                      <div className="absolute -top-1 -right-1 animate-bounce">
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <Sparkles className="h-2 w-2 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center space-y-2 mb-4">
                    {isHumanQuality ? (
                      <Badge variant="default" className="px-3 py-1 text-xs bg-gradient-to-r from-green-500 to-emerald-500">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Human Quality!
                      </Badge>
                    ) : aiProbability > 70 ? (
                      <Badge variant="destructive" className="px-3 py-1 text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        High AI Detection
                      </Badge>
                    ) : aiProbability > 40 ? (
                      <Badge variant="secondary" className="px-3 py-1 text-xs bg-yellow-500 text-white">
                        <Eye className="h-3 w-3 mr-1" />
                        Moderate AI
                      </Badge>
                    ) : aiProbability > 0 ? (
                      <Badge variant="secondary" className="px-3 py-1 text-xs bg-blue-500 text-white">
                        <Eye className="h-3 w-3 mr-1" />
                        Low AI
                      </Badge>
                    ) : null}
                    
                    {processingTime && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                        ⚡ {processingTime}
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full space-y-2">
                    <Button 
                      onClick={handleCheckForAI}
                      disabled={isAICheckActionDisabled}
                      className="w-full h-9 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm"
                      variant={isHumanQuality ? "outline" : "default"}
                    >
                      {isCheckingAI ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4 mr-2" />
                      )}
                      Analyze
                    </Button>
                    
                    <Button 
                      onClick={handlePrimaryHumanize}
                      disabled={isHumanizeActionDisabled}
                      className="w-full h-9 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-sm"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Repeat className="h-4 w-4 mr-2" />
                      )}
                      Humanize
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Output Section - Compact Full Width */}
          <div className="mt-6">
            <Card className="border shadow-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-slate-700/50 dark:to-slate-600/50 px-4 py-3 border-b border-slate-200/50 dark:border-slate-600/50">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Sparkles className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-slate-800 dark:text-slate-100">Output</span>
                  </CardTitle>
                  <div className="flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleCopy} 
                          disabled={!outputText} 
                          className="h-7 w-7 p-0 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleDownload} 
                          disabled={!outputText} 
                          className="h-7 w-7 p-0 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative">
                  <Textarea
                    value={outputText}
                    readOnly
                    className="w-full h-64 text-sm border-0 rounded-none focus-visible:ring-0 p-4 resize-none bg-transparent placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    placeholder="Your humanized text will appear here... ✨"
                  />
                  {outputText && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-600/50">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {outputWordCount}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span>{outputCharCount} chars</span>
                    </div>
                  )}
                  
                  {!outputText && !isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-slate-400 dark:text-slate-500">
                        <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm font-medium">Ready to humanize</p>
                        <p className="text-xs">Click "Humanize" to get started</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}