import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { deleteSession } from "@/lib/redis"

export async function POST() {
  try {
    // Get session ID from cookie
    const sessionId = cookies().get("session_id")?.value

    // Delete session from Redis if it exists
    if (sessionId) {
      await deleteSession(sessionId)
    }

    // Clear cookies
    cookies().delete("session_id")
    cookies().delete("user_role")

    return NextResponse.json({ message: "Logged out successfully" }, { status: 200 })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
