import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/redis"
import { cookies } from "next/headers"
import { cancelTrial, isTrialActive } from "@/lib/trial-management"

export async function POST() {
  // Get user from session
  const sessionId = cookies().get("session_id")?.value
  if (!sessionId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const user = await getSessionUser(sessionId)
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Check if user has an active trial
  if (!isTrialActive(user)) {
    return NextResponse.json({ error: "No active trial to cancel" }, { status: 400 })
  }

  // Cancel trial
  const success = await cancelTrial(user.id)
  if (!success) {
    return NextResponse.json({ error: "Failed to cancel trial" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
