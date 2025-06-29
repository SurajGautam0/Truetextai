"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIChecker() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ai_probability: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!text || text.length < 50) {
      setError("Text must be at least 50 characters long");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/ai-checker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze text");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getResultColor = (probability: number) => {
    if (probability > 70) return "text-red-500";
    if (probability > 30) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>AI Content Checker</CardTitle>
          <CardDescription>
            Check if your text was written by AI. Paste your text below to analyze.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Paste your text here (minimum 50 characters)..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px]"
            />
            <Button
              onClick={handleCheck}
              disabled={loading || text.length < 50}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Check Text"
              )}
            </Button>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-500 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="mt-4 p-6 bg-muted rounded-lg shadow-lg"
                >
                  <motion.h3 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="font-semibold mb-4 text-xl"
                  >
                    Analysis Result
                  </motion.h3>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-4 mb-4"
                  >
                    <div className="relative w-24 h-24">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <motion.circle
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: result.ai_probability / 100 }}
                          transition={{ duration: 1, ease: "easeInOut" }}
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke={result.ai_probability > 70 ? "#ef4444" : result.ai_probability > 30 ? "#eab308" : "#22c55e"}
                          strokeWidth="8"
                          strokeLinecap="round"
                          className="transform -rotate-90 origin-center"
                        />
                        <text
                          x="50"
                          y="50"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-2xl font-bold"
                          fill={result.ai_probability > 70 ? "#ef4444" : result.ai_probability > 30 ? "#eab308" : "#22c55e"}
                        >
                          {result.ai_probability.toFixed(0)}%
                        </text>
                      </svg>
                    </div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className={`text-lg font-medium ${getResultColor(result.ai_probability)}`}
                    >
                      {result.ai_probability > 70
                        ? "This text is likely written by AI"
                        : result.ai_probability > 30
                        ? "This text might be written by AI"
                        : "This text is likely written by a human"}
                    </motion.p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-sm text-muted-foreground"
                  >
                    <p className="mb-2">Confidence Level:</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.ai_probability}%` }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        className={`h-2.5 rounded-full ${
                          result.ai_probability > 70
                            ? "bg-red-500"
                            : result.ai_probability > 30
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
