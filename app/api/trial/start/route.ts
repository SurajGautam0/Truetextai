import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/redis"
import { cookies } from "next/headers"
import { startTrial, isEligibleForTrial } from "@/lib/trial-management"

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

  // Check if user is eligible for trial
  if (!isEligibleForTrial(user)) {
    return NextResponse.json({ error: "Not eligible for trial" }, { status: 400 })
  }

  // Start trial
  const updatedUser = await startTrial(user.id)
  if (!updatedUser) {
    return NextResponse.json({ error: "Failed to start trial" }, { status: 500 })
  }

  return NextResponse.json({ success: true, user: updatedUser })
}
