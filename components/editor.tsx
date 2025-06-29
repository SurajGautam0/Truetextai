"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Quote,
  LinkIcon,
  ImageIcon,
  Save,
  Download,
  FileUp,
  Loader2,
} from "lucide-react"
import type { UploadedFile } from "@/lib/blob-storage"

export default function Editor() {
  const [title, setTitle] = useState("Untitled Document")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write")
  const [savedDocuments, setSavedDocuments] = useState<UploadedFile[]>([])
  const [isLoadingSaved, setIsLoadingSaved] = useState(false)
  const [currentDocument, setCurrentDocument] = useState<UploadedFile | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Load saved documents on mount
  useEffect(() => {
    loadSavedDocuments()
  }, [])

  const loadSavedDocuments = async () => {
    try {
      setIsLoadingSaved(true)
      const response = await fetch("/api/list-files?folder=documents")

      if (!response.ok) {
        throw new Error("Failed to load saved documents")
      }

      const files = await response.json()
      setSavedDocuments(files)
    } catch (error) {
      console.error("Error loading saved documents:", error)
      toast({
        title: "Error",
        description: "Failed to load saved documents",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSaved(false)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a title for your document",
        variant: "destructive",
      })
      return
    }

    if (!content.trim() && !editorRef.current?.innerHTML) {
      toast({
        title: "Empty document",
        description: "Cannot save an empty document",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Get content from the contentEditable div if using rich text
      const documentContent = activeTab === "write" ? editorRef.current?.innerHTML || content : content

      // Create a Blob with the document content
      const blob = new Blob([documentContent], { type: "text/html" })

      // Create a File object from the Blob
      const file = new File([blob], `${title.replace(/\s+/g, "-")}.html`, { type: "text/html" })

      // Create form data
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "documents")

      // Upload file to Vercel Blob
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save document")
      }

      const savedFile = await response.json()
      setCurrentDocument(savedFile)

      // Refresh the list of saved documents
      loadSavedDocuments()

      toast({
        title: "Document saved",
        description: "Your document has been saved successfully",
      })
    } catch (error) {
      console.error("Error saving document:", error)
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save document",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoadDocument = async (file: UploadedFile) => {
    try {
      const response = await fetch(file.url)

      if (!response.ok) {
        throw new Error("Failed to load document")
      }

      const documentContent = await response.text()

      // Set the document content
      setContent(documentContent)
      if (editorRef.current) {
        editorRef.current.innerHTML = documentContent
      }

      // Set the document title (remove extension and replace hyphens with spaces)
      setTitle(file.filename.replace(/\.[^/.]+$/, "").replace(/-/g, " "))

      setCurrentDocument(file)

      toast({
        title: "Document loaded",
        description: `${file.filename} has been loaded successfully`,
      })
    } catch (error) {
      console.error("Error loading document:", error)
      toast({
        title: "Error",
        description: "Failed to load the document",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "documents")

      // Upload file to Vercel Blob
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload file")
      }

      const uploadedFile = await response.json()

      // Load the uploaded document
      await handleLoadDocument(uploadedFile)

      // Refresh the list of saved documents
      loadSavedDocuments()
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      })
    }
  }

  const handleDownload = () => {
    if (!content.trim() && !editorRef.current?.innerHTML) {
      toast({
        title: "Empty document",
        description: "Cannot download an empty document",
        variant: "destructive",
      })
      return
    }

    const documentContent = activeTab === "write" ? editorRef.current?.innerHTML || content : content

    const blob = new Blob([documentContent], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.replace(/\s+/g, "-")}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatText = (command: string, value = "") => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault()
      document.execCommand("insertHTML", false, "&nbsp;&nbsp;&nbsp;&nbsp;")
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Card className="bg-card/50 border-border">
        <CardContent className="p-6">
          <div className="mb-4">
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
              placeholder="Enter document title"
            />
          </div>

          <Tabs
            defaultValue="write"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "write" | "preview")}
          >
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <FileUp className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".txt,.html,.md,.doc,.docx"
                />

                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>

                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>

            <TabsContent value="write" className="mt-0">
              <div className="bg-background border border-border rounded-md">
                <div className="flex items-center gap-1 p-2 border-b border-border">
                  <Button variant="ghost" size="sm" onClick={() => formatText("bold")}>
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => formatText("italic")}>
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => formatText("underline")}>
                    <Underline className="h-4 w-4" />
                  </Button>
                  <div className="h-4 w-px bg-border mx-1" />
                  <Button variant="ghost" size="sm" onClick={() => formatText("insertUnorderedList")}>
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => formatText("insertOrderedList")}>
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <div className="h-4 w-px bg-border mx-1" />
                  <Button variant="ghost" size="sm" onClick={() => formatText("justifyLeft")}>
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => formatText("justifyCenter")}>
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => formatText("justifyRight")}>
                    <AlignRight className="h-4 w-4" />
                  </Button>
                  <div className="h-4 w-px bg-border mx-1" />
                  <Button variant="ghost" size="sm" onClick={() => formatText("formatBlock", "<h1>")}>
                    <Heading1 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => formatText("formatBlock", "<h2>")}>
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => formatText("formatBlock", "<blockquote>")}>
                    <Quote className="h-4 w-4" />
                  </Button>
                  <div className="h-4 w-px bg-border mx-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const url = prompt("Enter URL:")
                      if (url) formatText("createLink", url)
                    }}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const url = prompt("Enter image URL:")
                      if (url) formatText("insertImage", url)
                    }}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>

                <div
                  ref={editorRef}
                  contentEditable
                  className="min-h-[400px] p-4 focus:outline-none"
                  onInput={(e) => setContent((e.target as HTMLDivElement).innerHTML)}
                  onKeyDown={handleKeyDown}
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="border border-border rounded-md bg-background min-h-[400px] p-4">
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {savedDocuments.length > 0 && (
        <Card className="bg-card/50 border-border">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Saved Documents</h3>

            {isLoadingSaved ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedDocuments.map((doc) => (
                  <Card
                    key={doc.id}
                    className={`cursor-pointer hover:border-primary transition-colors ${
                      currentDocument?.id === doc.id ? "border-primary" : ""
                    }`}
                    onClick={() => handleLoadDocument(doc)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded">
                          <FileUp className="h-5 w-5 text-primary" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-medium truncate">{doc.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
