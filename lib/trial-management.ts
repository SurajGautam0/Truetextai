import { kv } from "@vercel/kv"
import type { StoredUser, PublicUser } from "./redis"

// Set the trial duration in days
export const TRIAL_DURATION_DAYS = 7

// Function to check if a user is in trial period
export function isTrialActive(user: PublicUser | null): boolean {
  if (!user) return false

  // If user is already premium, no need for trial
  if (user.plan === "pro" || user.plan === "enterprise") return false

  // Check if user has an active trial
  if (user.trialStartDate && user.trialEndDate) {
    const now = new Date()
    const trialEnd = new Date(user.trialEndDate)
    return now < trialEnd
  }

  return false
}

// Function to check if user is eligible for trial
export function isEligibleForTrial(user: PublicUser | null): boolean {
  if (!user) return false

  // If user is already premium, they don't need a trial
  if (user.plan === "pro" || user.plan === "enterprise") return false

  // If user has already used their trial, they're not eligible
  if (user.hasUsedTrial) return false

  // If user has an active trial, they're not eligible for a new one
  if (isTrialActive(user)) return false

  return true
}

// Function to start a trial for a user
export async function startTrial(userId: string): Promise<PublicUser | null> {
  try {
    // Get the user
    const userData = await kv.get(`user:${userId}`)
    if (!userData) return null

    // Parse user data
    const user = typeof userData === "string" ? JSON.parse(userData) : (userData as StoredUser)

    // Check eligibility
    if (!isEligibleForTrial(user)) return null

    // Set trial dates
    const now = new Date()
    const trialEndDate = new Date()
    trialEndDate.setDate(now.getDate() + TRIAL_DURATION_DAYS)

    // Update user with trial info
    const updatedUser: StoredUser = {
      ...user,
      trialStartDate: now.toISOString(),
      trialEndDate: trialEndDate.toISOString(),
      hasUsedTrial: true,
    }

    // Save updated user to Redis
    await kv.set(`user:${userId}`, JSON.stringify(updatedUser))

    // Return user without password
    const { hashedPassword, ...publicUser } = updatedUser
    return publicUser as PublicUser
  } catch (error) {
    console.error("Error starting trial:", error)
    return null
  }
}

// Function to cancel a trial
export async function cancelTrial(userId: string): Promise<boolean> {
  try {
    // Get the user
    const userData = await kv.get(`user:${userId}`)
    if (!userData) return false

    // Parse user data
    const user = typeof userData === "string" ? JSON.parse(userData) : (userData as StoredUser)

    // Update user to remove trial info but keep hasUsedTrial true
    const updatedUser: StoredUser = {
      ...user,
      trialStartDate: undefined,
      trialEndDate: undefined,
      // Keep hasUsedTrial true to prevent multiple trials
    }

    // Save updated user to Redis
    await kv.set(`user:${userId}`, JSON.stringify(updatedUser))

    return true
  } catch (error) {
    console.error("Error canceling trial:", error)
    return false
  }
}

// Function to get remaining trial days
export function getRemainingTrialDays(user: PublicUser | null): number {
  if (!user || !user.trialEndDate) return 0

  const now = new Date()
  const trialEnd = new Date(user.trialEndDate)

  // If trial has ended, return 0
  if (now > trialEnd) return 0

  // Calculate days remaining
  const diffTime = trialEnd.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

// Function to check if user has premium access (either paid or trial)
export function hasPremiumAccess(user: PublicUser | null): boolean {
  if (!user) return false
  return user.plan === "pro" || user.plan === "enterprise" || isTrialActive(user)
}
