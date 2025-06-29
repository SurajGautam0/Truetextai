"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"
import { useRouter } from "next/navigation"
import { isEligibleForTrial, startTrial } from "@/lib/trial-management"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function TrialPromotion() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isStartingTrial, setIsStartingTrial] = useState(false)

  // If user is not eligible for trial, don't show promotion
  if (!user || !isEligibleForTrial(user)) {
    return null
  }

  const handleStartTrial = async () => {
    if (!user) return

    setIsStartingTrial(true)
    try {
      const result = await startTrial(user.id)
      if (result) {
        toast({
          title: "Trial started!",
          description: "You now have 7 days of premium access. Enjoy!",
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
    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-amber-800 dark:text-amber-300">Try Premium for Free</CardTitle>
        </div>
        <CardDescription className="text-amber-700 dark:text-amber-400">
          Experience all premium features for 7 days with no commitment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 mb-2">
          <li className="flex items-start gap-2">
            <div className="text-amber-600 mt-0.5">✓</div>
            <div className="text-sm text-amber-700 dark:text-amber-400">
              <span className="font-medium">Assignment Writer</span> - Create high-quality academic papers
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="text-amber-600 mt-0.5">✓</div>
            <div className="text-sm text-amber-700 dark:text-amber-400">
              <span className="font-medium">Advanced Editor</span> - Professional writing environment
            </div>
          </li>
          <li className="flex items-start gap-2">
            <div className="text-amber-600 mt-0.5">✓</div>
            <div className="text-sm text-amber-700 dark:text-amber-400">
              <span className="font-medium">Premium AI Models</span> - Better quality outputs
            </div>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700"
          onClick={handleStartTrial}
          disabled={isStartingTrial}
        >
          <Crown className="mr-2 h-4 w-4" />
          {isStartingTrial ? "Starting trial..." : "Start Your Free Trial"}
        </Button>
      </CardFooter>
    </Card>
  )
}
