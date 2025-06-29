import { kv } from "@vercel/kv"

// Define rate limits for different features and user tiers
const RATE_LIMITS = {
  paraphraser: {
    free: { limit: 6, window: 3600 }, // 6 per hour
    pro: { limit: 50, window: 3600 }, // 50 per hour
    premium: { limit: Number.POSITIVE_INFINITY, window: 0 }, // Unlimited
  },
  aiChecker: {
    free: { limit: Number.POSITIVE_INFINITY, window: 0 }, // Unlimited for all tiers
    pro: { limit: Number.POSITIVE_INFINITY, window: 0 },
    premium: { limit: Number.POSITIVE_INFINITY, window: 0 },
  },
  assignmentWriter: {
    free: { limit: 3, window: 86400 }, // 3 per day
    pro: { limit: 15, window: 86400 }, // 15 per day
    premium: { limit: Number.POSITIVE_INFINITY, window: 0 }, // Unlimited
  },
}

// Check if a user has exceeded their rate limit
export async function checkRateLimit(
  userId: string,
  feature: keyof typeof RATE_LIMITS,
  tier: keyof (typeof RATE_LIMITS)[keyof typeof RATE_LIMITS] = "free",
) {
  // Get the rate limit configuration for this feature and tier
  const { limit, window } = RATE_LIMITS[feature][tier]

  // If the limit is infinite, always allow
  if (limit === Number.POSITIVE_INFINITY) {
    return {
      allowed: true,
      remaining: Number.POSITIVE_INFINITY,
      limit: Number.POSITIVE_INFINITY,
      reset: 0,
    }
  }

  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    throw new Error("Missing required environment variables KV_REST_API_URL and KV_REST_API_TOKEN")
  }

  const now = Math.floor(Date.now() / 1000)
  const key = `ratelimit:${feature}:${userId}`

  // Get the current usage data
  const data = await kv.get<{ count: number; reset: number }>(key)

  // If no data exists or the window has expired, create a new entry
  if (!data || data.reset <= now) {
    const reset = now + window
    await kv.set(key, { count: 1, reset }, { ex: window })
    return {
      allowed: true,
      remaining: limit - 1,
      limit,
      reset,
    }
  }

  // Check if the user has exceeded their limit
  if (data.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      limit,
      reset: data.reset,
    }
  }

  // Increment the usage count
  await kv.set(key, { count: data.count + 1, reset: data.reset }, { ex: data.reset - now })

  return {
    allowed: true,
    remaining: limit - (data.count + 1),
    limit,
    reset: data.reset,
  }
}

// Get the remaining usage for a feature
export async function getRemainingUsage(
  userId: string,
  feature: keyof typeof RATE_LIMITS,
  tier: keyof (typeof RATE_LIMITS)[keyof typeof RATE_LIMITS] = "free",
) {
  // Get the rate limit configuration for this feature and tier
  const { limit, window } = RATE_LIMITS[feature][tier]

  // If the limit is infinite, always allow
  if (limit === Number.POSITIVE_INFINITY) {
    return {
      remaining: Number.POSITIVE_INFINITY,
      limit: Number.POSITIVE_INFINITY,
      reset: 0,
    }
  }

  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    throw new Error("Missing required environment variables KV_REST_API_URL and KV_REST_API_TOKEN")
  }

  const now = Math.floor(Date.now() / 1000)
  const key = `ratelimit:${feature}:${userId}`

  // Get the current usage data
  const data = await kv.get<{ count: number; reset: number }>(key)

  // If no data exists or the window has expired, return full limit
  if (!data || data.reset <= now) {
    return {
      remaining: limit,
      limit,
      reset: now + window,
    }
  }

  return {
    remaining: Math.max(0, limit - data.count),
    limit,
    reset: data.reset,
  }
}

// Format time until reset in a human-readable format
export function formatTimeUntilReset(resetTimestamp: number): string {
  const now = Math.floor(Date.now() / 1000)
  const secondsRemaining = Math.max(0, resetTimestamp - now)

  if (secondsRemaining === 0) return "now"

  const hours = Math.floor(secondsRemaining / 3600)
  const minutes = Math.floor((secondsRemaining % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}
