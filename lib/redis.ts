import { createHash } from "crypto"
import { kv } from "@vercel/kv"

// User type definition
export interface StoredUser {
  id: string
  name: string
  email: string
  hashedPassword: string
  role: "user" | "admin"
  plan: "free" | "pro" | "enterprise"
  createdAt: string
  trialStartDate?: string
  trialEndDate?: string
  hasUsedTrial?: boolean
  isBanned?: boolean
  wordLimit?: number
  isPremium?: boolean
}

export interface PublicUser {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  plan: "free" | "pro" | "enterprise"
  createdAt: string
  trialStartDate?: string
  trialEndDate?: string
  hasUsedTrial?: boolean
  isBanned?: boolean
  wordLimit?: number
  isPremium?: boolean
}

// In-memory storage for development/preview environments
const inMemoryUsers: Record<string, StoredUser> = {}
const inMemoryEmailIndex: Record<string, string> = {}
const inMemorySessions: Record<string, string> = {}

// Check if KV is available
const isKVAvailable = () => {
  try {
    return process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  } catch (error) {
    return false
  }
}

// Hash password using SHA-256 (in production, use bcrypt or Argon2)
export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

// Verify password
export function verifyPassword(password: string, hashedPassword: string): boolean {
  const hashedInput = hashPassword(password)
  return hashedInput === hashedPassword
}

// Helper function to safely parse JSON or return the original value if it's already an object
function safelyParseJSON(data: any): any {
  if (typeof data === "string") {
    try {
      return JSON.parse(data)
    } catch (e) {
      console.error("Error parsing JSON:", e)
      return null
    }
  }
  return data // Already an object, return as is
}

// Add demo user for development/preview
function addDemoUser() {
  const demoUser: StoredUser = {
    id: "user_demo",
    name: "Demo User",
    email: "demo@example.com",
    hashedPassword: hashPassword("password"),
    role: "user",
    plan: "free",
    createdAt: new Date().toISOString(),
    isBanned: false,
    wordLimit: 300,
    isPremium: false,
  }

  const adminUser: StoredUser = {
    id: "user_admin",
    name: "Admin User",
    email: "admin@example.com",
    hashedPassword: hashPassword("password"),
    role: "admin",
    plan: "enterprise",
    createdAt: new Date().toISOString(),
    isBanned: false,
    wordLimit: 10000,
    isPremium: true,
  }

  inMemoryUsers[demoUser.id] = demoUser
  inMemoryEmailIndex[demoUser.email] = demoUser.id

  inMemoryUsers[adminUser.id] = adminUser
  inMemoryEmailIndex[adminUser.email] = adminUser.id
}

// Initialize demo users
addDemoUser()

// User management functions
export async function createUser(
  name: string,
  email: string,
  password: string,
  role: "user" | "admin" = "user",
  plan: "free" | "pro" | "enterprise" = "free",
): Promise<PublicUser | null> {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return null
    }

    // Create new user
    const id = `user_${Date.now()}`
    const hashedPassword = hashPassword(password)
    const createdAt = new Date().toISOString()

    const user: StoredUser = {
      id,
      name,
      email,
      hashedPassword,
      role,
      plan,
      createdAt,
      isBanned: false,
      wordLimit: 300,
      isPremium: plan !== "free",
    }

    if (isKVAvailable()) {
      // Store user in Redis
      // 1. Store user object
      await kv.set(`user:${id}`, JSON.stringify(user))
      // 2. Create email index for lookup
      await kv.set(`user:email:${email}`, id)
    } else {
      // Store in memory for development
      inMemoryUsers[id] = user
      inMemoryEmailIndex[email] = id
    }

    // Return user without password
    const { hashedPassword: _, ...publicUser } = user
    return publicUser as PublicUser
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  try {
    let user: StoredUser | null = null

    if (isKVAvailable()) {
      const userData = await kv.get(`user:${id}`)
      if (!userData) return null
      user = safelyParseJSON(userData) as StoredUser
    } else {
      // Get from memory for development
      user = inMemoryUsers[id] || null
    }

    if (!user) return null

    // Return user without password
    const { hashedPassword, ...publicUser } = user
    return publicUser as PublicUser
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return null
  }
}

export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  try {
    let userId: string | null = null

    if (isKVAvailable()) {
      userId = (await kv.get(`user:email:${email}`)) as string | null
      if (!userId) return null

      const userData = await kv.get(`user:${userId}`)
      if (!userData) return null

      return safelyParseJSON(userData) as StoredUser
    } else {
      // Get from memory for development
      userId = inMemoryEmailIndex[email] || null
      if (!userId) return null

      return inMemoryUsers[userId] || null
    }
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

// Session management
export async function createSession(userId: string): Promise<string> {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

  if (isKVAvailable()) {
    // Store session with 7-day expiration (604800 seconds)
    await kv.set(`session:${sessionId}`, userId, { ex: 604800 })
  } else {
    // Store in memory for development
    inMemorySessions[sessionId] = userId
  }

  return sessionId
}

export async function getSessionUser(sessionId: string): Promise<PublicUser | null> {
  try {
    let userId: string | null = null

    if (isKVAvailable()) {
      userId = (await kv.get(`session:${sessionId}`)) as string | null
    } else {
      // Get from memory for development
      userId = inMemorySessions[sessionId] || null
    }

    if (!userId) return null
    return getUserById(userId)
  } catch (error) {
    console.error("Error getting session user:", error)
    return null
  }
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  try {
    if (isKVAvailable()) {
      await kv.del(`session:${sessionId}`)
    } else {
      // Delete from memory for development
      delete inMemorySessions[sessionId]
    }
    return true
  } catch (error) {
    console.error("Error deleting session:", error)
    return false
  }
}
