import { type NextRequest, NextResponse } from "next/server"
import { getUsageLogs } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    // Use session user id if userId is not provided
    const userId = searchParams.get("userId") || session.user.id

    // Check if database is available
    if (!process.env.DATABASE_URL) {
      console.warn('Database not configured - returning mock data')
      return NextResponse.json({ logs: [] })
    }

    const logs = await getUsageLogs(limit, offset, userId ? Number.parseInt(userId) : undefined)

    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Error fetching usage logs:", error)
    return NextResponse.json({ error: "Failed to fetch usage logs" }, { status: 500 })
  }
} 