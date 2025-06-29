"use client"

import type React from "react"
import type { UploadedFile } from "@/lib/blob-storage"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Download, Copy, GraduationCap, Upload, FileText, FileUp, Trash2, Crown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AssignmentWriter() {
  const [topic, setTopic] = useState("")
  const [subject, setSubject] = useState("general")
  const [level, setLevel] = useState("undergraduate")
  const [wordCount, setWordCount] = useState(1000)
  const [style, setStyle] = useState("academic")
  const [model, setModel] = useState("ninja-3.2")
  const [humanLevel, setHumanLevel] = useState(80)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState("")
  const [aiScore, setAiScore] = useState<number | null>(null)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<"parameters" | "document" | "advanced">("parameters")
  const [error, setError] = useState<string | null>(null)
  const [savedFiles, setSavedFiles] = useState<UploadedFile[]>([])
  const [isLoadingSavedFiles, setIsLoadingSavedFiles] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Load saved files when component mounts
  useEffect(() => {
    loadSavedFiles()
  }, [])

  const loadSavedFiles = async () => {
    try {
      setIsLoadingSavedFiles(true)
      const response = await fetch("/api/list-files?folder=assignments")

      if (!response.ok) {
        throw new Error("Failed to load saved files")
      }

      const files = await response.json()
      setSavedFiles(files)
    } catch (error) {
      console.error("Error loading saved files:", error)
      toast({
        title: "Error",
        description: "Failed to load saved files",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSavedFiles(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    // Simulate initial upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 5
      })
    }, 100)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "assignments")

      // Upload file to Vercel Blob
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload file")
      }

      const uploadedFileData: UploadedFile = await response.json()
      setUploadedFile(uploadedFileData)

      // Now fetch the file content
      const fileResponse = await fetch(uploadedFileData.url)
      if (!fileResponse.ok) {
        throw new Error("Failed to fetch file content")
      }

      let content = ""

      // Handle different file types
      if (uploadedFileData.contentType === "application/pdf") {
        // For PDF files, we'd need a PDF parser
        // This is a placeholder - in a real app, you'd use a PDF parsing library
        content = "PDF content would be extracted here. This is a placeholder."
      } else if (
        uploadedFileData.contentType === "application/msword" ||
        uploadedFileData.contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // For Word documents, we'd need a DOCX parser
        // This is a placeholder - in a real app, you'd use a DOCX parsing library
        content = "Word document content would be extracted here. This is a placeholder."
      } else {
        // For text files, just get the text
        content = await fileResponse.text()
      }

      setFileContent(content)

      // Extract topic from filename if not already set
      if (!topic) {
        const fileName = uploadedFileData.filename.replace(/\.[^/.]+$/, "") // Remove extension
        setTopic(fileName)
      }

      // Refresh the list of saved files
      loadSavedFiles()

      toast({
        title: "Document uploaded",
        description: `${uploadedFileData.filename} has been uploaded successfully.`,
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      setError(error instanceof Error ? error.message : "Failed to upload file")
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      })
    } finally {
      clearInterval(progressInterval)
      setUploadProgress(100)
      setTimeout(() => {
        setIsUploading(false)
      }, 500)
    }
  }

  const handleRemoveFile = async () => {
    if (!uploadedFile) return

    try {
      // Delete the file from Vercel Blob
      const response = await fetch("/api/delete-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: uploadedFile.url }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete file")
      }

      setUploadedFile(null)
      setFileContent(null)
      if (fileInputRef.current) fileInputRef.current.value = ""

      // Refresh the list of saved files
      loadSavedFiles()

      toast({
        title: "Document removed",
        description: "The uploaded document has been removed.",
      })
    } catch (error) {
      console.error("Error removing file:", error)
      toast({
        title: "Error",
        description: "Failed to remove the document",
        variant: "destructive",
      })
    }
  }

  const handleSelectSavedFile = async (file: UploadedFile) => {
    try {
      setIsUploading(true)
      setUploadProgress(50)

      // Fetch the file content
      const response = await fetch(file.url)
      if (!response.ok) {
        throw new Error("Failed to fetch file content")
      }

      let content = ""

      // Handle different file types
      if (file.contentType === "application/pdf") {
        // For PDF files, we'd need a PDF parser
        content = "PDF content would be extracted here. This is a placeholder."
      } else if (
        file.contentType === "application/msword" ||
        file.contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // For Word documents, we'd need a DOCX parser
        content = "Word document content would be extracted here. This is a placeholder."
      } else {
        // For text files, just get the text
        content = await response.text()
      }

      setUploadedFile(file)
      setFileContent(content)

      // Extract topic from filename if not already set
      if (!topic) {
        const fileName = file.filename.replace(/\.[^/.]+$/, "") // Remove extension
        setTopic(fileName)
      }

      toast({
        title: "Document loaded",
        description: `${file.filename} has been loaded successfully.`,
      })
    } catch (error) {
      console.error("Error loading saved file:", error)
      toast({
        title: "Error",
        description: "Failed to load the document",
        variant: "destructive",
      })
    } finally {
      setUploadProgress(100)
      setTimeout(() => {
        setIsUploading(false)
      }, 500)
    }
  }

  const handleGenerate = async () => {
    if (!topic.trim() && !fileContent) {
      toast({
        title: "Missing information",
        description: "Please enter a topic or upload a document.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/assignment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          subject,
          level,
          wordCount,
          style,
          model,
          humanLevel,
          documentContent: fileContent,
          documentName: uploadedFile?.filename,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate assignment")
      }

      const data = await response.json()
      setResult(data.assignment)
      setAiScore(data.aiScore)

      toast({
        title: "Assignment generated",
        description: "Your assignment has been generated successfully.",
      })
    } catch (error) {
      console.error("Error generating assignment:", error)
      setError(error instanceof Error ? error.message : "Failed to generate assignment")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate assignment",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result)
      toast({
        title: "Copied!",
        description: "Assignment copied to clipboard",
      })
    }
  }

  const handleDownload = () => {
    if (result) {
      const blob = new Blob([result], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${topic || uploadedFile?.filename?.replace(/\.[^/.]+$/, "") || "assignment"}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Assignment Writer</h2>
        </div>
        <Badge
          variant="outline"
          className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-500 border-amber-500/20"
        >
          <Crown className="h-3.5 w-3.5" />
          <span>Premium Feature</span>
        </Badge>
      </div>

      <Card className="bg-card/50 border-border">
        <CardContent className="p-6">
          <Tabs defaultValue="parameters" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="parameters">Parameters</TabsTrigger>
              <TabsTrigger value="document">Upload Document</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="parameters" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic or Title</Label>
                  <Input
                    id="topic"
                    placeholder="Enter the topic of your assignment"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="computer-science">Computer Science</SelectItem>
                      <SelectItem value="economics">Economics</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="literature">Literature</SelectItem>
                      <SelectItem value="philosophy">Philosophy</SelectItem>
                      <SelectItem value="psychology">Psychology</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Academic Level</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger id="level">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="masters">Master's</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="word-count">Word Count: {wordCount}</Label>
                  <Slider
                    id="word-count"
                    value={[wordCount]}
                    min={250}
                    max={20000}
                    step={250}
                    onValueChange={(value) => setWordCount(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="style">Writing Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger id="style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="analytical">Analytical</SelectItem>
                      <SelectItem value="argumentative">Argumentative</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="descriptive">Descriptive</SelectItem>
                      <SelectItem value="expository">Expository</SelectItem>
                      <SelectItem value="narrative">Narrative</SelectItem>
                      <SelectItem value="persuasive">Persuasive</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">AI Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger id="model">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ninja-3.2">Ninja 3.2 (Fast)</SelectItem>
                      <SelectItem value="stealth-2.0">Stealth 2.0 (Balanced)</SelectItem>
                      <SelectItem value="ghost-1.5">Ghost 1.5 (Advanced)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {uploadedFile && (
                <div className="mt-4 p-3 border border-border rounded-md bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{uploadedFile.filename}</span>
                    <Badge variant="outline" className="ml-2">
                      Document Uploaded
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("document")}>
                    View
                  </Button>
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="pt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || (!topic.trim() && !fileContent)}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Assignment...
                    </>
                  ) : (
                    <>
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Generate Assignment
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="document" className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                {isUploading ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Uploading document...</p>
                      <Progress value={uploadProgress} className="h-2 mt-2 w-full max-w-md mx-auto" />
                    </div>
                  </div>
                ) : uploadedFile ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <FileText className="h-12 w-12 text-primary mx-auto" />
                        <p className="mt-2 text-sm font-medium">{uploadedFile.filename}</p>
                        <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>

                    {fileContent && (
                      <div className="mt-4">
                        <Label htmlFor="file-preview">Document Preview</Label>
                        <Textarea id="file-preview" value={fileContent} readOnly className="mt-2 h-48 text-sm" />
                      </div>
                    )}

                    <div className="flex justify-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleRemoveFile}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (fileInputRef.current) fileInputRef.current.click()
                        }}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Replace
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <FileUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Upload Your Document</h3>
                    <p className="text-sm text-muted-foreground mt-2 mb-4">
                      Upload a document to generate an assignment based on its content
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (fileInputRef.current) fileInputRef.current.click()
                      }}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Select Document
                    </Button>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".txt,.doc,.docx,.pdf,.md"
                />
              </div>

              {savedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3">Your Saved Documents</h3>
                  <div className="space-y-2">
                    {isLoadingSavedFiles ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      savedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{file.filename}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(file.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleSelectSavedFile(file)}>
                            Select
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="bg-muted/20 rounded-lg p-4">
                <h4 className="text-sm font-medium flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  How Document Upload Works
                </h4>
                <ul className="mt-2 text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Upload your document (TXT, DOC, DOCX, PDF, or MD)</li>
                  <li>Our AI will analyze the content of your document</li>
                  <li>Generate an assignment based on the document's content</li>
                  <li>Customize the output with the parameters in the other tabs</li>
                </ul>
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={() => setActiveTab("parameters")} disabled={isUploading}>
                  Continue to Parameters
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Human-like Level: {humanLevel}%</Label>
                  </div>
                  <Slider
                    value={[humanLevel]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setHumanLevel(value[0])}
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher values make the text more human-like and less detectable as AI-generated.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Additional Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Enter any additional instructions or requirements for your assignment..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>References</Label>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Enter number of references" type="number" min="0" max="50" defaultValue="5" />
                    <Select defaultValue="apa">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Citation style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apa">APA</SelectItem>
                        <SelectItem value="mla">MLA</SelectItem>
                        <SelectItem value="chicago">Chicago</SelectItem>
                        <SelectItem value="harvard">Harvard</SelectItem>
                        <SelectItem value="ieee">IEEE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {result && (
        <Card className="bg-card/50 border-border">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Generated Assignment</h3>
                <div className="flex items-center gap-2">
                  {aiScore !== null && (
                    <Badge variant={aiScore < 30 ? "success" : "destructive"}>AI Score: {aiScore.toFixed(1)}%</Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>

              <Textarea
                readOnly
                value={result}
                className="min-h-[400px] resize-none bg-background/50 border-border text-foreground"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center">
        <Button variant="link" className="text-xs text-muted-foreground">
          How to Use? (Must Read)
        </Button>
      </div>
    </div>
  )
}
