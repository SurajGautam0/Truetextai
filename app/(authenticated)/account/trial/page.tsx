"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Clock, Crown, Info, CheckCircle, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { isTrialActive, isEligibleForTrial, getRemainingTrialDays, TRIAL_DURATION_DAYS } from "@/lib/trial-management"
import { useState } from "react"

export default function TrialManagementPage() {
  const { user, startTrial } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const isPremium = user?.plan === "premium"
  const isOnTrial = isTrialActive(user)
  const canStartTrial = isEligibleForTrial(user)
  const remainingDays = getRemainingTrialDays(user)
  const hasUsedTrial = user?.hasUsedTrial

  // Calculate progress if on trial
  const progress = isOnTrial
    ? Math.max(0, Math.min(100, ((TRIAL_DURATION_DAYS - remainingDays) / TRIAL_DURATION_DAYS) * 100))
    : 0

  const handleStartTrial = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const result = await startTrial()
      if (result) {
        toast({
          title: "Trial started!",
          description: "You now have 7 days of premium access. Enjoy!",
        })
        router.refresh()
      }
    } catch (error) {
      console.error("Error starting trial:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelTrial = async () => {
    // TODO: Implement cancel trial functionality
    toast({
      title: "Not implemented",
      description: "Cancel trial functionality is not yet implemented.",
      variant: "destructive",
    })
  }

  if (isPremium) {
    return (
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-6">Premium Trial</h1>

        <Alert className="mb-6 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <AlertTitle className="text-green-800 dark:text-green-300">Premium Plan Active</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-400">
            You're currently on the {user?.plan} plan. You have full access to all premium features.
          </AlertDescription>
        </Alert>

        <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Premium Trial</h1>

      {isOnTrial && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  <CardTitle>Your Premium Trial</CardTitle>
                </div>
                <div className="bg-amber-100 dark:bg-amber-950/50 px-3 py-1 rounded-full flex items-center gap-1 text-sm">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-amber-700 dark:text-amber-300 font-medium">
                    {remainingDays} day{remainingDays !== 1 ? "s" : ""} remaining
                  </span>
                </div>
              </div>
              <CardDescription>You have full access to all premium features during your trial period.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Trial progress</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <h3 className="font-medium mb-3">Premium Features Included:</h3>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Assignment Writer</p>
                    <p className="text-sm text-muted-foreground">AI-powered academic paper writing</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Advanced Editor</p>
                    <p className="text-sm text-muted-foreground">Professional document editing tools</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Premium AI Models</p>
                    <p className="text-sm text-muted-foreground">Access to more advanced AI models</p>
                  </div>
                </li>
              </ul>

              <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                <Info className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-700 dark:text-amber-400">
                  Your trial will end in {remainingDays} day{remainingDays !== 1 ? "s" : ""}. Upgrade to a premium plan
                  to keep access to all features.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex gap-3 flex-wrap">
              <Button className="flex-1" onClick={() => router.push("/pricing")}>
                <Crown className="mr-2 h-4 w-4" />
                Upgrade Now
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleCancelTrial} disabled={isLoading}>
                Cancel Trial
              </Button>
            </CardFooter>
          </Card>
        </>
      )}

      {!isOnTrial && hasUsedTrial && (
        <>
          <Alert className="mb-6 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <AlertTitle className="text-amber-800 dark:text-amber-300">Trial Used</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              You've already used your free premium trial. Upgrade to a premium plan to access all premium features.
            </AlertDescription>
          </Alert>

          <Button onClick={() => router.push("/pricing")} className="mb-6">
            <Crown className="mr-2 h-4 w-4" />
            View Pricing Plans
          </Button>
        </>
      )}

      {!isOnTrial && !hasUsedTrial && canStartTrial && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              <CardTitle>Try Premium for Free</CardTitle>
            </div>
            <CardDescription>Start a 7-day free trial to access all premium features</CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="font-medium mb-3">Premium Features You'll Get:</h3>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Assignment Writer</p>
                  <p className="text-sm text-muted-foreground">AI-powered academic paper writing</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Advanced Editor</p>
                  <p className="text-sm text-muted-foreground">Professional document editing tools</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Premium AI Models</p>
                  <p className="text-sm text-muted-foreground">Access to more advanced AI models</p>
                </div>
              </li>
            </ul>

            <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription className="text-blue-700 dark:text-blue-400">
                No credit card required. You can cancel anytime during the trial period.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleStartTrial} disabled={isLoading}>
              <Crown className="mr-2 h-4 w-4" />
              {isLoading ? "Starting trial..." : "Start Your 7-Day Free Trial"}
            </Button>
          </CardFooter>
        </Card>
      )}

      <Button variant="outline" onClick={() => router.push("/dashboard")}>
        Back to Dashboard
      </Button>
    </div>
  )
}
