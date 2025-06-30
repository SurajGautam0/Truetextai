import { type NextRequest, NextResponse } from "next/server"
import { getDocuments, updateDocument, deleteDocument } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const userId = searchParams.get("userId")

    // Check if database is available
    if (!process.env.DATABASE_URL) {
      console.warn('Database not configured - returning mock data')
      return NextResponse.json({ documents: [] })
    }

    const documents = await getDocuments(limit, offset, userId ? Number.parseInt(userId) : undefined)

    return NextResponse.json({ documents })
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id, ...data } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    // Check if database is available
    if (!process.env.DATABASE_URL) {
      console.warn('Database not configured - cannot update document')
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    const document = await updateDocument(id, data)
    return NextResponse.json({ document })
  } catch (error) {
    console.error("Error updating document:", error)
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check if user is admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    // Check if database is available
    if (!process.env.DATABASE_URL) {
      console.warn('Database not configured - cannot delete document')
      return NextResponse.json({ error: "Database not available" }, { status: 503 })
    }

    await deleteDocument(Number.parseInt(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}
