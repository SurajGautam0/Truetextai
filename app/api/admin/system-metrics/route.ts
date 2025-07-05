import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // In a real application, you would collect actual system metrics
    // For now, we'll return simulated metrics
    const metrics = {
      cpu: Math.floor(Math.random() * 30) + 20, // 20-50%
      memory: Math.floor(Math.random() * 40) + 50, // 50-90%
      disk: Math.floor(Math.random() * 30) + 50, // 50-80%
      network: Math.floor(Math.random() * 50) + 30, // 30-80%
      uptime: 99.8 + (Math.random() * 0.2), // 99.8-100%
      responseTime: Math.floor(Math.random() * 100) + 50, // 50-150ms
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({ metrics })
  } catch (error) {
    console.error("Error fetching system metrics:", error)
    return NextResponse.json({ error: "Failed to fetch system metrics" }, { status: 500 })
  }
} 