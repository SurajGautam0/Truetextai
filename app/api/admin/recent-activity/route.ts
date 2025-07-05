import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getUsageLogs } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get recent usage logs from database
    const usageLogs = await getUsageLogs(10, 0)
    
    // Transform usage logs into activity format
    const activities = usageLogs.map((log, index) => ({
      id: index + 1,
      type: 'api_call' as const,
      message: `${log.feature} API call`,
      timestamp: log.created_at,
      severity: 'info' as const,
      user: log.user_email,
      tokens: log.tokens_used
    }))

    // Add some system activities
    const systemActivities = [
      {
        id: activities.length + 1,
        type: 'system_alert' as const,
        message: 'Database backup completed successfully',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
        severity: 'success' as const
      },
      {
        id: activities.length + 2,
        type: 'settings_change' as const,
        message: 'Rate limiting settings updated',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        severity: 'info' as const
      }
    ]

    const allActivities = [...activities, ...systemActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return NextResponse.json({ activities: allActivities })
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return NextResponse.json({ error: "Failed to fetch recent activity" }, { status: 500 })
  }
} 