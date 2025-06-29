import { NextResponse } from "next/server"
import { getUserById } from "@/lib/firebase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get("uid")

    if (!uid) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const user = await getUserById(uid)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error("Error fetching user:", error)
    
    // Handle specific Firestore errors
    if (error.message.includes('Firestore is not enabled')) {
      return NextResponse.json({ 
        error: "Database not configured. Please enable Firestore in Firebase Console.",
        details: "Visit https://console.firebase.google.com/project/truetextai-658fa/firestore to enable Firestore."
      }, { status: 503 })
    } else if (error.message.includes('client is offline')) {
      return NextResponse.json({ 
        error: "Unable to connect to database. Please check your internet connection."
      }, { status: 503 })
    } else {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }
}
