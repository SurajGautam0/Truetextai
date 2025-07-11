import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getSettings, updateSetting, createSetting } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get settings from database
    const settings = await getSettings()
    
    // Transform settings into the expected format
    const settingsMap = settings.reduce((acc: Record<string, string>, setting: { key: string; value: string }) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)

    // Return default settings if database is empty
    const defaultSettings = {
      siteName: "TrueText AI",
      siteDescription: "Advanced AI-powered text analysis and writing tools",
      maintenanceMode: "false",
      registrationEnabled: "true",
      emailVerification: "true",
      maxFileSize: "10",
      rateLimitPerMinute: "100",
      aiProvider: "openai",
      aiApiKey: "sk-...",
      databaseBackupEnabled: "true",
      backupFrequency: "daily",
      logLevel: "info",
      emailNotifications: "true",
      securityAlerts: "true",
      autoScaling: "true",
      cacheEnabled: "true",
      cdnEnabled: "false",
      isParaphraserEnabled: "true",
      paraphraserDisabledMessage: "The paraphrasing tool is currently undergoing maintenance. We expect to be back shortly. Thank you for your patience."
    }

    const mergedSettings = { ...defaultSettings, ...settingsMap }

    return NextResponse.json({ settings: mergedSettings })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: "Invalid settings data" }, { status: 400 })
    }

    // Update each setting in the database
    const updatePromises = Object.entries(settings).map(([key, value]) => {
      return updateSetting(key, String(value))
    })

    await Promise.all(updatePromises)

    return NextResponse.json({ 
      message: "Settings updated successfully",
      settings 
    })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
