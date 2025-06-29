"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { hasPremiumAccess, isEligibleForTrial, getRemainingTrialDays, startTrial } from "@/lib/trial-management"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface PremiumFeatureGuardProps {
  children: React.ReactNode
  featureName: string
  description?: string
}

export default function PremiumFeatureGuard({ children, featureName, description }: PremiumFeatureGuardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isStartingTrial, setIsStartingTrial] = useState(false)

  const isPremium = user?.plan === "pro" || user?.plan === "enterprise"
  const isOnTrial = !isPremium && hasPremiumAccess(user)
  const canStartTrial = isEligibleForTrial(user)
  const remainingDays = getRemainingTrialDays(user)

  // Handle premium access (either paid or on trial)
  if (isPremium || isOnTrial) {
    return (
      <>
        {isOnTrial && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" />
              <p className="font-medium text-amber-800 dark:text-amber-300">
                Trial Mode - {remainingDays} day{remainingDays !== 1 ? "s" : ""} remaining
              </p>
            </div>
            <p className="text-amber-600 dark:text-amber-400 mt-1 pl-6">
              You're currently trying {featureName} as part of your premium trial.
            </p>
          </div>
        )}
        {children}
      </>
    )
  }

  // If the user cannot access the feature, show the upgrade card
  const handleStartTrial = async () => {
    if (!user) return

    setIsStartingTrial(true)
    try {
      const result = await startTrial(user.id)
      if (result) {
        toast({
          title: "Trial started!",
          description: `You now have ${getRemainingTrialDays(result)} days of premium access.`,
        })
        // Force page refresh to update user data
        window.location.reload()
      } else {
        toast({
          title: "Failed to start trial",
          description: "There was an error starting your trial. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error starting trial:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsStartingTrial(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Premium Feature: {featureName}</CardTitle>
          <CardDescription>
            {description || `The ${featureName} is available exclusively to Pro and Enterprise subscribers.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            <div className="flex items-start gap-2">
              <Crown className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Advanced AI Models</p>
                <p className="text-sm text-muted-foreground">Access to premium AI models for better results</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Crown className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Unlimited Usage</p>
                <p className="text-sm text-muted-foreground">No daily limits on tokens or requests</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Crown className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Priority Support</p>
                <p className="text-sm text-muted-foreground">Get help faster when you need it</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {canStartTrial ? (
            <>
              <Button className="w-full" onClick={handleStartTrial} disabled={isStartingTrial}>
                <Crown className="mr-2 h-4 w-4" />
                {isStartingTrial ? "Starting trial..." : "Start 7-Day Free Trial"}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-1">
                No credit card required. Try all premium features for 7 days.
              </p>
            </>
          ) : (
            <>
              <Button className="w-full" onClick={() => router.push("/pricing")}>
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
              {user?.hasUsedTrial && (
                <p className="text-xs text-center text-muted-foreground mt-1">
                  You've already used your free trial. Upgrade to continue using premium features.
                </p>
              )}
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
