"use client"

import { useAuth } from "@/contexts/auth-context"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Clock, Crown } from "lucide-react"
import { isTrialActive, getRemainingTrialDays, TRIAL_DURATION_DAYS } from "@/lib/trial-management"

export function TrialStatus() {
  const { user } = useAuth()
  const router = useRouter()

  // If user is already on a paid plan, don't show trial status
  if (!user || user.plan === "pro" || user.plan === "enterprise") {
    return null
  }

  // Check if user is on a trial
  const isOnTrial = isTrialActive(user)
  if (!isOnTrial) return null

  const remainingDays = getRemainingTrialDays(user)
  const progress = Math.max(0, Math.min(100, ((TRIAL_DURATION_DAYS - remainingDays) / TRIAL_DURATION_DAYS) * 100))

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          <h3 className="font-medium text-amber-800 dark:text-amber-300">Premium Trial Active</h3>
        </div>
        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">
            {remainingDays} day{remainingDays !== 1 ? "s" : ""} remaining
          </span>
        </div>
      </div>

      <Progress value={progress} className="h-2 bg-amber-200 dark:bg-amber-800 mb-3">
        <div className="h-full bg-amber-500" style={{ width: `${progress}%` }} />
      </Progress>

      <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
        Your trial gives you access to all premium features. Upgrade before your trial ends to keep access.
      </p>

      <Button
        variant="outline"
        className="border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50 w-full"
        onClick={() => router.push("/pricing")}
      >
        <Crown className="mr-2 h-4 w-4" />
        Upgrade to Premium
      </Button>
    </div>
  )
}
