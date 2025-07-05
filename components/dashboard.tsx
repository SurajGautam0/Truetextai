"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from "./header"
import { Button } from "./ui/button"
import { ArrowRight, BarChart2, Search, Sparkles, GraduationCap, TrendingUp, Clock, Award } from "lucide-react"
import Link from "next/link"
import { Progress } from "./ui/progress"
import { Badge } from "./ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
// Import the TrialPromotion and TrialStatus components
import { TrialPromotion } from "@/components/trial-promotion"
import { TrialStatus } from "@/components/trial-status"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore"

export default function Dashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    wordsUsed: 0,
    dailyWordsUsed: 0,
    paraphrasedTexts: 0,
    aiChecks: 0,
    assignments: 0,
  })

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    // Real-time Firestore listener
    const usageLogsQuery = query(collection(db, "usage_logs"), where("user_id", "==", user.id));
    const unsubscribe = onSnapshot(usageLogsQuery, (querySnapshot) => {
      let wordsUsed = 0;
      let dailyWordsUsed = 0;
      let paraphrasedTexts = 0;
      let aiChecks = 0;
      let assignments = 0;
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      querySnapshot.forEach((doc) => {
        const log = doc.data();
        const logDate = new Date(log.created_at);
        const tokensUsed = log.tokens_used || 0;
        wordsUsed += tokensUsed;
        if (logDate >= todayStart) {
          dailyWordsUsed += tokensUsed;
        }
        if (log.feature === "paraphraser") paraphrasedTexts++;
        else if (log.feature === "aiChecker") aiChecks++;
        else if (log.feature === "assignmentWriter") assignments++;
      });
      setStats({ wordsUsed, dailyWordsUsed, paraphrasedTexts, aiChecks, assignments });
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <>
      <Header title="Dashboard" />
      <main className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 animate-fade-in">
          {/* Daily Word Limit Card for Free Users */}
          {/* Removed Daily Word Limit card for free users */}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="card-hover border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {user?.plan === "free" ? "Words Used Today" : "Total Words Used"}
                </CardTitle>
                <BarChart2 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? "..." : (user?.plan === "free" ? stats.dailyWordsUsed : stats.wordsUsed).toLocaleString()}
                </div>
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  {user?.plan === "free" ? (
                    <>
                      <span className="text-muted-foreground">
                        {1000 - stats.dailyWordsUsed} words remaining today
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-1 h-3 w-3 text-success" />
                      <span className="text-success font-medium">Unlimited</span>
                    </>
                  )}
                </div>
                <Progress 
                  value={user?.plan === "free" 
                    ? Math.min(100, (stats.dailyWordsUsed / 1000) * 100)
                    : Math.min(100, (stats.wordsUsed / 50000) * 100)
                  } 
                  className="h-1 mt-3" 
                />
              </CardContent>
            </Card>
            <Card className="card-hover border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paraphrased Texts</CardTitle>
                <Sparkles className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : stats.paraphrasedTexts}</div>
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  {user?.plan === "free" ? (
                    <Badge variant="secondary" className="text-xs">
                      Free: 300 words/request
                    </Badge>
                  ) : (
                    <>
                      <TrendingUp className="mr-1 h-3 w-3 text-success" />
                      <span className="text-success font-medium">Unlimited</span>
                    </>
                  )}
                </div>
                <Progress value={stats.paraphrasedTexts ? Math.min(100, (stats.paraphrasedTexts / 50) * 100) : 0} className="h-1 mt-3" />
              </CardContent>
            </Card>
            <Card className="card-hover border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Checks</CardTitle>
                <Search className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : stats.aiChecks}</div>
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  {user?.plan === "free" ? (
                    <Badge variant="secondary" className="text-xs">
                      Free: 50+ word required
                    </Badge>
                  ) : (
                    <>
                      <TrendingUp className="mr-1 h-3 w-3 text-success" />
                      <span className="text-success font-medium">Unlimited</span>
                    </>
                  )}
                </div>
                <Progress value={stats.aiChecks ? Math.min(100, (stats.aiChecks / 100) * 100) : 0} className="h-1 mt-3" />
              </CardContent>
            </Card>
            <Card className="card-hover border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                <GraduationCap className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? "..." : stats.assignments}</div>
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  {user?.plan === "free" ? (
                    <Badge variant="outline" className="text-xs font-normal border-orange-300 text-orange-600">
                      Premium feature
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs font-normal">
                      New feature
                    </Badge>
                  )}
                </div>
                <Progress value={stats.assignments ? Math.min(100, (stats.assignments / 10) * 100) : 0} className="h-1 mt-3" />
              </CardContent>
            </Card>
            <TrialStatus />
          </div>

          <Tabs defaultValue="features" className="space-y-4">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="recent">Recent Activity</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
            <TabsContent value="features" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="card-hover border-primary/10 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-primary to-purple-400"></div>
                  <CardHeader>
                    <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Paraphraser</CardTitle>
                    <CardDescription>
                      Rewrite text to make it more human-like and less detectable as AI-generated.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/paraphraser">
                      <Button className="w-full rounded-full">
                        Go to Paraphraser
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
                <Card className="card-hover border-primary/10 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-primary to-purple-400"></div>
                  <CardHeader>
                    <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-2">
                      <Search className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>AI Checker</CardTitle>
                    <CardDescription>
                      Check if your text was written by AI with our advanced detection tool.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/ai-checker">
                      <Button className="w-full rounded-full">
                        Go to AI Checker
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
                <Card className="card-hover border-primary/10 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-primary to-purple-400"></div>
                  <CardHeader>
                    <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Assignment Writer</CardTitle>
                    <CardDescription>
                      Generate high-quality academic assignments that pass AI detection.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/assignment-writer">
                      <Button className="w-full rounded-full">
                        Go to Assignment Writer
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="recent" className="space-y-4">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent activity across all features.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 border-b border-border pb-4 last:border-0 last:pb-0 animate-slide-in-bottom"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        {i % 3 === 0 ? (
                          <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-primary" />
                          </div>
                        ) : i % 2 === 0 ? (
                          <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
                            <Search className="h-5 w-5 text-primary" />
                          </div>
                        ) : (
                          <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {i % 3 === 0
                              ? "Generated an assignment on Economics"
                              : i % 2 === 0
                                ? "Checked text for AI detection"
                                : "Paraphrased a document"}
                          </p>
                          <div className="flex items-center mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground mr-1" />
                            <p className="text-xs text-muted-foreground">
                              {new Date(Date.now() - i * 3600000).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="stats" className="space-y-4">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                  <CardDescription>Your usage statistics over time.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center">
                    <div className="text-center">
                      <Award className="h-10 w-10 text-primary mx-auto mb-2" />
                      <h3 className="text-lg font-medium">Premium Feature</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upgrade to Premium to access detailed statistics and analytics.
                      </p>
                      <Button className="mt-4 rounded-full">Upgrade Now</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <TrialPromotion />
        </div>
      </main>
    </>
  )
}
