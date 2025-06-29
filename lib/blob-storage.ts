import { put, list, del, type PutBlobResult } from "@vercel/blob"
import { nanoid } from "nanoid"

export type UploadedFile = {
  id: string
  url: string
  filename: string
  size: number
  uploadedAt: Date
  contentType: string
}

/**
 * Upload a file to Vercel Blob storage
 */
export async function uploadFile(file: File, folder = "documents"): Promise<UploadedFile> {
  try {
    // Generate a unique ID for the file
    const id = nanoid()

    // Create a path with folder structure
    const path = `${folder}/${id}-${file.name}`

    // Upload the file to Vercel Blob
    const blob: PutBlobResult = await put(path, file, {
      access: "public",
      addRandomSuffix: false,
    })

    // Return the file metadata
    return {
      id,
      url: blob.url,
      filename: file.name,
      size: file.size,
      uploadedAt: new Date(),
      contentType: file.type,
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    throw new Error("Failed to upload file")
  }
}

/**
 * Delete a file from Vercel Blob storage
 */
export async function deleteFile(url: string): Promise<void> {
  try {
    await del(url)
  } catch (error) {
    console.error("Error deleting file:", error)
    throw new Error("Failed to delete file")
  }
}

/**
 * List files in a specific folder in Vercel Blob storage
 */
export async function listFiles(folder = "documents"): Promise<UploadedFile[]> {
  try {
    const { blobs } = await list({ prefix: `${folder}/` })

    return blobs.map((blob) => {
      // Extract the original filename from the path
      const pathParts = blob.pathname.split("/")
      const filenameWithId = pathParts[pathParts.length - 1]
      const idAndFilename = filenameWithId.split("-")
      const id = idAndFilename.shift() || ""
      const filename = idAndFilename.join("-")

      return {
        id,
        url: blob.url,
        filename,
        size: blob.size,
        uploadedAt: new Date(blob.uploadedAt),
        contentType: blob.contentType || "application/octet-stream",
      }
    })
  } catch (error) {
    console.error("Error listing files:", error)
    throw new Error("Failed to list files")
  }
}
