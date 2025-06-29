"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { MoreHorizontal, RefreshCw, ExternalLink } from "lucide-react"

type Document = {
  id: number
  user_id: number
  title: string
  content: string
  blob_url: string
  document_type: string
  created_at: string
  updated_at: string
  user_email: string
  user_name: string
}

export default function DocumentManagement() {
  const { toast } = useToast()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showEditDocumentDialog, setShowEditDocumentDialog] = useState(false)
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null)
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/documents?limit=${limit}&offset=${page * limit}`)
      if (!response.ok) {
        throw new Error("Failed to fetch documents")
      }
      const data = await response.json()
      setDocuments(data.documents)
    } catch (error) {
      console.error("Error fetching documents:", error)
      toast({
        title: "Error fetching documents",
        description: "Could not load document data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [page, limit, toast])

  const handleEditDocument = async () => {
    if (!currentDocument) return

    try {
      const response = await fetch("/api/admin/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(currentDocument),
      })

      if (!response.ok) {
        throw new Error("Failed to update document")
      }

      const data = await response.json()

      // Update the document in the list
      setDocuments(documents.map((doc) => (doc.id === currentDocument.id ? data.document : doc)))
      setShowEditDocumentDialog(false)
      setCurrentDocument(null)

      toast({
        title: "Document updated",
        description: `"${currentDocument.title}" has been updated.`,
      })
    } catch (error) {
      console.error("Error updating document:", error)
      toast({
        title: "Error updating document",
        description: "Failed to update document information.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteDocument = async (documentId: number) => {
    try {
      const response = await fetch(`/api/admin/documents?id=${documentId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete document")
      }

      // Remove the document from the list
      setDocuments(documents.filter((doc) => doc.id !== documentId))

      toast({
        title: "Document deleted",
        description: "Document has been removed successfully.",
      })
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({
        title: "Error deleting document",
        description: "Failed to delete document.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Document Management</h2>
          <p className="text-muted-foreground">View and manage all documents in the database.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchDocuments}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeletons
              Array(limit)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-[40px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[180px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
            ) : documents.length > 0 ? (
              documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>{document.id}</TableCell>
                  <TableCell className="font-medium">{document.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{document.document_type || "Unknown"}</Badge>
                  </TableCell>
                  <TableCell>{document.user_email}</TableCell>
                  <TableCell>{formatDate(document.created_at)}</TableCell>
                  <TableCell>{formatDate(document.updated_at)}</TableCell>
                  <TableCell>
                    <Dialog
                      open={showEditDocumentDialog && currentDocument?.id === document.id}
                      onOpenChange={(open) => {
                        setShowEditDocumentDialog(open)
                        if (!open) setCurrentDocument(null)
                      }}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setCurrentDocument(document)
                              setShowEditDocumentDialog(true)
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          {document.blob_url && (
                            <DropdownMenuItem onClick={() => window.open(document.blob_url, "_blank")}>
                              View File
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteDocument(document.id)}>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Edit Document</DialogTitle>
                          <DialogDescription>Update document information.</DialogDescription>
                        </DialogHeader>
                        {currentDocument && (
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-title">Title</Label>
                              <Input
                                id="edit-title"
                                value={currentDocument.title}
                                onChange={(e) => setCurrentDocument({ ...currentDocument, title: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-type">Document Type</Label>
                              <Input
                                id="edit-type"
                                value={currentDocument.document_type || ""}
                                onChange={(e) =>
                                  setCurrentDocument({ ...currentDocument, document_type: e.target.value })
                                }
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-content">Content</Label>
                              <Textarea
                                id="edit-content"
                                rows={10}
                                value={currentDocument.content || ""}
                                onChange={(e) => setCurrentDocument({ ...currentDocument, content: e.target.value })}
                              />
                            </div>
                            {currentDocument.blob_url && (
                              <div className="grid gap-2">
                                <Label htmlFor="edit-blob-url">File URL</Label>
                                <div className="flex gap-2">
                                  <Input
                                    id="edit-blob-url"
                                    value={currentDocument.blob_url}
                                    onChange={(e) =>
                                      setCurrentDocument({ ...currentDocument, blob_url: e.target.value })
                                    }
                                    className="flex-1"
                                  />
                                  <Button
                                    variant="outline"
                                    onClick={() => window.open(currentDocument.blob_url, "_blank")}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowEditDocumentDialog(false)
                              setCurrentDocument(null)
                            }}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleEditDocument}>Save Changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No documents found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={documents.length < limit}>
            Next
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Page {page + 1} • Showing {documents.length} documents
        </p>
      </div>
    </div>
  )
}
