"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ParaphraseTest() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<{
    originalWords: number;
    paraphrasedWords: number;
    wordChangePercentage: number;
  } | null>(null);

  const handleParaphrase = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to paraphrase");
      return;
    }

    setLoading(true);
    setError(null);
    setOutputText("");
    setMetrics(null);

    try {
      const response = await fetch("/api/paraphrase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to paraphrase text");
      }

      setOutputText(data.paraphrasedText);
      setMetrics(data.metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Paraphrasing Test</CardTitle>
          <CardDescription>
            Test the paraphrasing functionality with this simple interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Original Text</label>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to paraphrase..."
                className="min-h-[150px]"
              />
            </div>

            <Button
              onClick={handleParaphrase}
              disabled={loading || !inputText.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Paraphrasing...
                </>
              ) : (
                "Paraphrase Text"
              )}
            </Button>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-500 text-sm p-4 bg-red-50 rounded-md"
                >
                  {error}
                </motion.div>
              )}

              {outputText && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-2">Paraphrased Text</label>
                    <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
                      {outputText}
                    </div>
                  </div>

                  {metrics && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="text-sm text-muted-foreground">Original Words</p>
                        <p className="text-lg font-medium">{metrics.originalWords}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Paraphrased Words</p>
                        <p className="text-lg font-medium">{metrics.paraphrasedWords}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Change</p>
                        <p className="text-lg font-medium">{metrics.wordChangePercentage}%</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 