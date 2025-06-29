import { NextResponse } from "next/server"
import { deleteFile } from "@/lib/blob-storage"

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "No file URL provided" }, { status: 400 })
    }

    await deleteFile(url)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete file route:", error)
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
  }
}
