"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, Download } from "lucide-react"

type UsageLog = {
  id: number
  user_id: number
  feature: string
  tokens_used: number
  created_at: string
  user_email: string
  user_name: string
}

export default function UsageLogsManagement() {
  const { toast } = useToast()
  const [logs, setLogs] = useState<UsageLog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(20)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/usage-logs?limit=${limit}&offset=${page * limit}`)
      if (!response.ok) {
        throw new Error("Failed to fetch usage logs")
      }
      const data = await response.json()
      setLogs(data.logs)
    } catch (error) {
      console.error("Error fetching usage logs:", error)
      toast({
        title: "Error fetching logs",
        description: "Could not load usage logs data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page, limit, toast])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  const exportToCSV = () => {
    if (logs.length === 0) return

    // Create CSV content
    const headers = ["ID", "User ID", "User Email", "Feature", "Tokens Used", "Created At"]
    const csvContent = [
      headers.join(","),
      ...logs.map((log) =>
        [
          log.id,
          log.user_id,
          `"${log.user_email}"`,
          `"${log.feature}"`,
          log.tokens_used,
          new Date(log.created_at).toISOString(),
        ].join(","),
      ),
    ].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `usage-logs-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export successful",
      description: "Usage logs have been exported to CSV.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Usage Logs</h2>
          <p className="text-muted-foreground">View and analyze feature usage across the application.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV} disabled={logs.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={fetchLogs}>
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
              <TableHead>User</TableHead>
              <TableHead>Feature</TableHead>
              <TableHead>Tokens Used</TableHead>
              <TableHead>Timestamp</TableHead>
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
                      <Skeleton className="h-5 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[150px]" />
                    </TableCell>
                  </TableRow>
                ))
            ) : logs.length > 0 ? (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{log.user_name || "Unnamed"}</div>
                    <div className="text-sm text-muted-foreground">{log.user_email}</div>
                  </TableCell>
                  <TableCell>{log.feature}</TableCell>
                  <TableCell>{log.tokens_used.toLocaleString()}</TableCell>
                  <TableCell>{formatDate(log.created_at)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No usage logs found.
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
          <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={logs.length < limit}>
            Next
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Page {page + 1} • Showing {logs.length} logs
        </p>
      </div>
    </div>
  )
}
