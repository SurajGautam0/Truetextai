import { NextResponse } from "next/server"
import { listFiles } from "@/lib/blob-storage"

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const folder = searchParams.get("folder") || "documents"

    const files = await listFiles(folder)

    return NextResponse.json(files)
  } catch (error) {
    console.error("Error in list files route:", error)
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 })
  }
}
