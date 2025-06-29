"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Users, Settings, Activity, BarChart2, TrendingUp, FileText, AlertTriangle, CheckCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

// Mock data - in a real app, this would come from your API
const mockStats = {
  totalUsers: 256,
  activeUsers: 187,
  documentsProcessed: 1432,
  averageScore: 92,
  systemHealth: 98,
  recentSignups: 24,
  aiUsage: 78,
  errorRate: 0.5,
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState<typeof mockStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchStats = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await fetch('/api/admin/stats')
        // const data = await response.json()
        // setStats(data)

        // Using mock data for now
        setTimeout(() => {
          setStats(mockStats)
          setLoading(false)
        }, 1000)
      } catch (error) {
        toast({
          title: "Error fetching stats",
          description: "Could not load admin dashboard statistics.",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchStats()
  }, [toast])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Welcome to Admin Dashboard</h2>
          <p className="text-muted-foreground">Monitor system performance, manage users, and configure settings.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/users">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats?.totalUsers}</div>
                )}
                <p className="text-xs text-muted-foreground">
                  {loading ? <Skeleton className="h-4 w-28 mt-1" /> : <>+{stats?.recentSignups} from last month</>}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">{stats?.documentsProcessed}</div>
                )}
                <p className="text-xs text-muted-foreground">
                  {loading ? <Skeleton className="h-4 w-28 mt-1" /> : <>+143 from last week</>}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Usage</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats?.aiUsage}%</div>
                    <Progress value={stats?.aiUsage} className="h-2 mt-2" />
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats?.systemHealth}%</div>
                    <Progress value={stats?.systemHealth} className="h-2 mt-2" />
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>User signups and activity over the past 30 days</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                {loading ? (
                  <Skeleton className="h-[250px] w-full" />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <BarChart2 className="h-16 w-16 mx-auto mb-2 opacity-50" />
                    <p>Analytics chart would go here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events and user actions</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">New user registered (john@example.com)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Document processed (Assignment #42)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm">API rate limit warning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">System settings updated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">User role changed (admin@example.com)</span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  View All Activity
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="h-[400px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <BarChart2 className="h-16 w-16 mx-auto mb-2 opacity-50" />
            <h3 className="text-lg font-medium">Analytics Dashboard</h3>
            <p>Detailed analytics would be displayed here</p>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="h-[400px] flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Activity className="h-16 w-16 mx-auto mb-2 opacity-50" />
            <h3 className="text-lg font-medium">Activity Logs</h3>
            <p>System and user activity logs would be displayed here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
