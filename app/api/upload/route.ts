import { NextResponse } from "next/server"
import { uploadFile } from "@/lib/blob-storage"

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || "documents"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    // Check file type
    const allowedTypes = [
      "text/plain",
      "text/markdown",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not supported. Please upload TXT, MD, PDF, DOC, or DOCX files." },
        { status: 400 },
      )
    }

    // Upload the file
    const uploadedFile = await uploadFile(file, folder)

    return NextResponse.json(uploadedFile)
  } catch (error) {
    console.error("Error in upload route:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
