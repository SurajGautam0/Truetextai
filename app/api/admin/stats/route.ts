import { type NextRequest, NextResponse } from "next/server"
import { getDashboardStats } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if database is available
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ 
        stats: {
          totalUsers: 0,
          activeUsers: 0,
          totalDocuments: 0,
          totalUsage: 0
        }
      })
    }

    const stats = await getDashboardStats()
    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
