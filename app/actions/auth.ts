"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createUser, getUserByEmail, verifyPassword, createSession, deleteSession, type PublicUser } from "@/lib/redis"

// Define the state type for form actions
type AuthState = {
  error: string | null
  success: boolean
  user: PublicUser | null
}

// Default state
const defaultState: AuthState = {
  error: null,
  success: false,
  user: null,
}

export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return {
      ...prevState,
      error: "All fields are required",
      success: false,
      user: null,
    }
  }

  try {
    // Create user in database
    const user = await createUser(name, email, password)

    if (!user) {
      return {
        ...prevState,
        error: "User with this email already exists",
        success: false,
        user: null,
      }
    }

    // Create session
    const sessionId = await createSession(user.id)

    // Set session cookie
    cookies().set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return {
      error: null,
      success: true,
      user,
    }
  } catch (error) {
    console.error("Signup error:", error)
    return {
      ...prevState,
      error: "Failed to create account. Please try again.",
      success: false,
      user: null,
    }
  }
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return {
      ...prevState,
      error: "Email and password are required",
      success: false,
      user: null,
    }
  }

  try {
    // Get user from database
    const user = await getUserByEmail(email)

    if (!user) {
      return {
        ...prevState,
        error: "Invalid email or password",
        success: false,
        user: null,
      }
    }

    // Verify password
    const isValidPassword = verifyPassword(password, user.hashedPassword)

    if (!isValidPassword) {
      return {
        ...prevState,
        error: "Invalid email or password",
        success: false,
        user: null,
      }
    }

    // Create session
    const sessionId = await createSession(user.id)

    // Set session cookie
    cookies().set("session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    // Return user without password
    const { hashedPassword, ...publicUser } = user

    return {
      error: null,
      success: true,
      user: publicUser,
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      ...prevState,
      error: "Failed to log in. Please try again.",
      success: false,
      user: null,
    }
  }
}

export async function logout() {
  const sessionId = cookies().get("session_id")?.value

  if (sessionId) {
    await deleteSession(sessionId)
  }

  cookies().delete("session_id")
  redirect("/")
}

export async function getSession(): Promise<PublicUser | null> {
  const sessionId = cookies().get("session_id")?.value

  if (!sessionId) {
    return null
  }

  try {
    const user = await import("@/lib/redis").then((mod) => mod.getSessionUser(sessionId))
    return user
  } catch (error) {
    console.error("Get session error:", error)
    return null
  }
}
