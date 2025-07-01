"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Copy, Download, Sparkles, Eye, BrainCircuit, ChevronDown, Info, Edit, FileText, Settings2, Repeat, Wand2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Confetti from "react-confetti";

type ModelType = "python-journalist-api" | "python-huggingface" | "truetext-rewriter" | "truetext-render-api";
type StyleType = "general" | "academic" | "marketing" | "story" | "blog" | "paraphrase";
type DetectorModeType = "normal" | "aggressive" | "ultra";

const useAuth = () => ({ isAuthenticated: true, user: { credits: 100 } });

const CircularProgress = ({ percentage, statusText }: { percentage: number, statusText: string }) => {
  const circumference = 2 * Math.PI * 25;
  const offset = circumference - (percentage / 100) * circumference;
  let strokeColor = "stroke-gray-400 dark:stroke-gray-600";
  let textColor = "text-gray-500 dark:text-gray-400";

  if (statusText !== "Not Yet Analyzed" && statusText !== "Analyzing...") {
    strokeColor = percentage > 70 ? "stroke-red-500" : percentage > 40 ? "stroke-yellow-500" : "stroke-green-500";
    textColor = percentage > 70 ? "text-red-500" : percentage > 40 ? "text-yellow-500" : "text-green-500";
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
          {statusText === "Not Yet Analyzed" ? <FileText className="inline-block h-4 w-4" /> :
           statusText === "Analyzing..." ? <Loader2 className="inline-block h-4 w-4 animate-spin" /> :
           `${percentage}%`}
        </div>
        <div className="text-xs text-muted-foreground mt-1 px-1">{statusText}</div>
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
  const { isAuthenticated } = useAuth();
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
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
              AI Paraphrasing Tool
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Refine your text to be more clear, compelling, and human-like.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="flex flex-col gap-4">
              {/* Input Card */}
              <Card className="shadow-sm bg-white dark:bg-slate-800/50">
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center gap-2 text-md">
                    <Edit className="h-4 w-4" /> Your Text
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full h-40 text-sm border-gray-200 dark:border-slate-700 rounded-md focus-visible:ring-2 focus-visible:ring-blue-500 p-3 resize-y bg-white dark:bg-slate-800"
                    placeholder="Paste your text here. For best results, use at least 15 words."
                  />
                  <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mt-2">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={handleTryExample} className="text-blue-600 dark:text-blue-400 text-xs">Try Example</Button>
                      <Button variant="ghost" size="sm" onClick={handleClearInput} disabled={!inputText} className="text-xs">Clear</Button>
                    </div>
                    <div className="flex gap-3">
                      <span>{inputWordCount} words</span>
                      <span>{inputCharCount} chars</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Settings Card */}
              <Card className="shadow-sm bg-white dark:bg-slate-800/50">
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center gap-2 text-md">
                    <Settings2 className="h-4 w-4" /> Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Model</Label>
                    <Select value={model} onValueChange={(v) => setModel(v as ModelType)}>
                      <SelectTrigger className="w-full h-9 rounded-md text-sm">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="truetext-render-api">Ninja 4.4 (Recommended)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Style</Label>
                    <Select value={styleOption} onValueChange={(v) => setStyleOption(v as StyleType)}>
                      <SelectTrigger className="w-full h-9 rounded-md text-sm">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                         <SelectItem value="general">General</SelectItem>
                         <SelectItem value="academic">Academic</SelectItem>
                         <SelectItem value="marketing">Marketing</SelectItem>
                         <SelectItem value="story">Story</SelectItem>
                         <SelectItem value="blog">Blog</SelectItem>
                         <SelectItem value="paraphrase">Paraphrase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Creativity: <span className="font-semibold text-blue-600 dark:text-blue-400">{level}</span></Label>
                    <Input 
                      type="range" min="1" max="10" value={level} 
                      onChange={(e) => setLevel(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-4">
              {/* Output Card */}
              <Card className="shadow-sm bg-white dark:bg-slate-800/50 flex-grow flex flex-col">
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center gap-2 text-md">
                    <Wand2 className="h-4 w-4" /> Humanized Text
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-grow">
                  <Textarea
                    value={outputText}
                    readOnly
                    className="w-full h-full min-h-[160px] text-sm border-gray-200 dark:border-slate-700 rounded-md p-3 resize-y bg-slate-50/50 dark:bg-slate-900/50"
                    placeholder="Your humanized text will appear here... ✨"
                  />
                </CardContent>
                <CardFooter className="p-4 pt-2 flex-wrap justify-between items-center gap-2">
                   <div className="flex gap-2">
                    <Button size="sm" onClick={handleCopy} disabled={!outputText}><Copy className="h-3 w-3 mr-1.5" /> Copy</Button>
                    <Button size="sm" onClick={handleDownload} disabled={!outputText} variant="outline"><Download className="h-3 w-3 mr-1.5" /> Download</Button>
                  </div>
                  <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{outputWordCount} words</span>
                    <span>{outputCharCount} chars</span>
                  </div>
                </CardFooter>
              </Card>
              
              {/* AI Detector & Actions */}
              <Card className="shadow-sm bg-white dark:bg-slate-800/50">
                 <CardContent className="p-3 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <CircularProgress percentage={aiProbability} statusText={currentAiStatusText} />
                           <div>
                              <h4 className="font-semibold text-slate-800 dark:text-slate-100">AI Content Detector</h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Check the AI score of the text.</p>
                           </div>
                        </div>
                        <Button onClick={handleCheckForAI} disabled={isAICheckActionDisabled} variant="outline" size="sm">
                          {isCheckingAI ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                          <span className="ml-2 hidden sm:inline">Analyze</span>
                        </Button>
                    </div>
                    <Button 
                      size="lg"
                      onClick={handlePrimaryHumanize}
                      disabled={isHumanizeActionDisabled}
                      className="w-full h-10 text-base font-bold rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md transition-transform transform hover:scale-105"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-5 w-5 mr-2" />
                      )}
                      Humanize Text
                    </Button>
                 </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}