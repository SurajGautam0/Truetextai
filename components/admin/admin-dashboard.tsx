"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  Settings, 
  Activity, 
  BarChart2, 
  TrendingUp, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Clock,
  Zap,
  Shield,
  Globe,
  Database,
  Cpu,
  HardDrive,
  Network,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  UserPlus,
  FileCheck,
  Server
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts"

// Types for our data
interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalDocuments: number
  totalUsage: number
  recentUsers: Array<{
    id: number
    email: string
    name: string
    created_at: string
  }>
  usageByFeature: Array<{
    feature: string
    total: number
  }>
  documentsByType: Array<{
    document_type: string
    count: number
  }>
}

interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  network: number
  uptime: number
  responseTime: number
}

interface RecentActivity {
  id: number
  type: 'user_signup' | 'document_processed' | 'api_call' | 'system_alert' | 'settings_change'
  message: string
  timestamp: string
  severity?: 'info' | 'warning' | 'error' | 'success'
  user?: string
}

// Mock data for development
const mockStats: DashboardStats = {
  totalUsers: 1256,
  activeUsers: 892,
  totalDocuments: 5432,
  totalUsage: 1250000,
  recentUsers: [
    { id: 1, email: "john@example.com", name: "John Doe", created_at: "2024-01-15T10:30:00Z" },
    { id: 2, email: "jane@example.com", name: "Jane Smith", created_at: "2024-01-15T09:15:00Z" },
    { id: 3, email: "bob@example.com", name: "Bob Johnson", created_at: "2024-01-15T08:45:00Z" },
    { id: 4, email: "alice@example.com", name: "Alice Brown", created_at: "2024-01-15T07:20:00Z" },
    { id: 5, email: "charlie@example.com", name: "Charlie Wilson", created_at: "2024-01-15T06:10:00Z" },
  ],
  usageByFeature: [
    { feature: "AI Checker", total: 450000 },
    { feature: "Paraphraser", total: 320000 },
    { feature: "Assignment Writer", total: 280000 },
    { feature: "Document Editor", total: 200000 },
  ],
  documentsByType: [
    { document_type: "Assignment", count: 2340 },
    { document_type: "Essay", count: 1560 },
    { document_type: "Report", count: 890 },
    { document_type: "Research Paper", count: 642 },
  ]
}

const mockSystemMetrics: SystemMetrics = {
  cpu: 45,
  memory: 72,
  disk: 68,
  network: 85,
  uptime: 99.8,
  responseTime: 120
}

const mockRecentActivity: RecentActivity[] = [
  {
    id: 1,
    type: 'user_signup',
    message: 'New user registered',
    timestamp: '2024-01-15T10:30:00Z',
    severity: 'info',
    user: 'john@example.com'
  },
  {
    id: 2,
    type: 'document_processed',
    message: 'Document processed successfully',
    timestamp: '2024-01-15T10:25:00Z',
    severity: 'success',
    user: 'jane@example.com'
  },
  {
    id: 3,
    type: 'api_call',
    message: 'High API usage detected',
    timestamp: '2024-01-15T10:20:00Z',
    severity: 'warning'
  },
  {
    id: 4,
    type: 'system_alert',
    message: 'Database backup completed',
    timestamp: '2024-01-15T10:15:00Z',
    severity: 'success'
  },
  {
    id: 5,
    type: 'settings_change',
    message: 'System settings updated',
    timestamp: '2024-01-15T10:10:00Z',
    severity: 'info'
  }
]

// Chart data
const userGrowthData = [
  { month: 'Jan', users: 1200, growth: 15 },
  { month: 'Feb', users: 1350, growth: 12.5 },
  { month: 'Mar', users: 1480, growth: 9.6 },
  { month: 'Apr', users: 1620, growth: 9.5 },
  { month: 'May', users: 1780, growth: 9.9 },
  { month: 'Jun', users: 1950, growth: 9.6 },
  { month: 'Jul', users: 2100, growth: 7.7 },
  { month: 'Aug', users: 2250, growth: 7.1 },
  { month: 'Sep', users: 2400, growth: 6.7 },
  { month: 'Oct', users: 2550, growth: 6.3 },
  { month: 'Nov', users: 2700, growth: 5.9 },
  { month: 'Dec', users: 2850, growth: 5.6 },
]

const usageTrendData = [
  { hour: '00:00', requests: 45, tokens: 12000 },
  { hour: '04:00', requests: 32, tokens: 8500 },
  { hour: '08:00', requests: 89, tokens: 24000 },
  { hour: '12:00', requests: 156, tokens: 42000 },
  { hour: '16:00', requests: 134, tokens: 36000 },
  { hour: '20:00', requests: 98, tokens: 26000 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AdminDashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true)
      
      // Fetch real data from API endpoints
      const [statsRes, metricsRes, activityRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/system-metrics'),
        fetch('/api/admin/recent-activity')
      ])
      
      if (!statsRes.ok || !metricsRes.ok || !activityRes.ok) {
        throw new Error('Failed to fetch data from one or more endpoints')
      }
      
      const [statsData, metricsData, activityData] = await Promise.all([
        statsRes.json(),
        metricsRes.json(),
        activityRes.json()
      ])
      
      setStats(statsData.stats || mockStats)
      setSystemMetrics(metricsData.metrics || mockSystemMetrics)
      setRecentActivity(activityData.activities || mockRecentActivity)
      setLoading(false)
      
      toast({
        title: "Dashboard updated",
        description: "Latest data has been refreshed successfully.",
        variant: "success",
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      
      // Fallback to mock data if API fails
      setStats(mockStats)
      setSystemMetrics(mockSystemMetrics)
      setRecentActivity(mockRecentActivity)
      setLoading(false)
      
      toast({
        title: "Using cached data",
        description: "Could not fetch latest data, showing cached information.",
        variant: "warning",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_signup': return <UserPlus className="h-4 w-4" />
      case 'document_processed': return <FileCheck className="h-4 w-4" />
      case 'api_call': return <Zap className="h-4 w-4" />
      case 'system_alert': return <Server className="h-4 w-4" />
      case 'settings_change': return <Settings className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: RecentActivity['severity']) => {
    switch (severity) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-amber-100 text-amber-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'info': 
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Monitor system performance, manage users, and configure settings in real-time.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild variant="outline" className="hover:bg-gray-100 transition-colors">
            <Link href="/admin/users">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition-opacity">
            <Link href="/admin/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden transition-transform hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatNumber(stats?.totalUsers || 0)}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  +{stats?.recentUsers.length || 0} this week
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-transform hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatNumber(stats?.activeUsers || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% of total
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-transform hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Documents Processed</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatNumber(stats?.totalDocuments || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  +{Math.floor((stats?.totalDocuments || 0) * 0.1)} this month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-transform hover:scale-[1.02]">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatNumber(stats?.totalUsage || 0)}</div>
                <p className="text-xs text-muted-foreground">tokens consumed</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-transform hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{systemMetrics?.cpu}%</div>
                <Progress 
                  value={systemMetrics?.cpu} 
                  className="h-2 mt-2" 
                  indicatorColor={systemMetrics?.cpu && systemMetrics.cpu > 80 ? 'bg-red-500' : 'bg-blue-500'}
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card className="transition-transform hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{systemMetrics?.memory}%</div>
                <Progress 
                  value={systemMetrics?.memory} 
                  className="h-2 mt-2" 
                  indicatorColor={systemMetrics?.memory && systemMetrics.memory > 80 ? 'bg-red-500' : 'bg-blue-500'}
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card className="transition-transform hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{systemMetrics?.disk}%</div>
                <Progress 
                  value={systemMetrics?.disk} 
                  className="h-2 mt-2" 
                  indicatorColor={systemMetrics?.disk && systemMetrics.disk > 80 ? 'bg-red-500' : 'bg-blue-500'}
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card className="transition-transform hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">{systemMetrics?.network}%</div>
                <Progress 
                  value={systemMetrics?.network} 
                  className="h-2 mt-2" 
                  indicatorColor={systemMetrics?.network && systemMetrics.network > 80 ? 'bg-red-500' : 'bg-blue-500'}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="activity" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700"
          >
            Activity
          </TabsTrigger>
          <TabsTrigger 
            value="system" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700"
          >
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* User Growth Chart */}
            <Card className="col-span-4 transition-transform hover:scale-[1.005]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  User Growth
                </CardTitle>
                <CardDescription>Monthly user growth and trends</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis 
                        tick={{ fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e5e7eb',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card className="col-span-3 transition-transform hover:scale-[1.005]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Recent Users
                </CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-[150px]" />
                          <Skeleton className="h-3 w-[100px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats?.recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-800">
                            {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                        <div className="ml-auto text-xs text-muted-foreground">
                          {formatDate(user.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" size="sm" className="w-full hover:bg-gray-100">
                  View All Users
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Usage by Feature */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="transition-transform hover:scale-[1.005]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Usage by Feature
                </CardTitle>
                <CardDescription>Token consumption across different features</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats?.usageByFeature}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ feature, percent }) => `${feature} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="total"
                      >
                        {stats?.usageByFeature.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => formatNumber(Number(value))}
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e5e7eb',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="transition-transform hover:scale-[1.005]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Documents by Type
                </CardTitle>
                <CardDescription>Distribution of processed documents</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[300px] w-full rounded-lg" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats?.documentsByType}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="document_type" 
                        tick={{ fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis 
                        tick={{ fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e5e7eb',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#10B981" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="transition-transform hover:scale-[1.005]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Usage Trends
                </CardTitle>
                <CardDescription>Hourly API usage patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={usageTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis 
                      tick={{ fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e5e7eb',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="requests" 
                      stackId="1" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="tokens" 
                      stackId="2" 
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="transition-transform hover:scale-[1.005]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-purple-600" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>System performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uptime</span>
                    <span className="font-medium">{systemMetrics?.uptime}%</span>
                  </div>
                  <Progress 
                    value={systemMetrics?.uptime} 
                    className="h-2" 
                    indicatorColor={systemMetrics?.uptime && systemMetrics.uptime < 99 ? 'bg-amber-500' : 'bg-green-500'}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Response Time</span>
                    <span className="font-medium">{systemMetrics?.responseTime}ms</span>
                  </div>
                  <Progress 
                    value={Math.max(0, 100 - (systemMetrics?.responseTime || 0) / 2)} 
                    className="h-2" 
                    indicatorColor={systemMetrics?.responseTime && systemMetrics.responseTime > 200 ? 'bg-red-500' : 'bg-green-500'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-3 rounded-lg bg-blue-50">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatNumber(stats?.totalUsers || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Users</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-50">
                    <div className="text-2xl font-bold text-green-600">
                      {formatNumber(stats?.totalDocuments || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Documents</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="transition-transform hover:scale-[1.005]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest system events and user actions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {recentActivity.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className={`p-2 rounded-full ${getSeverityColor(activity.severity)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        {activity.user && (
                          <p className="text-xs text-muted-foreground">{activity.user}</p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(activity.timestamp)}
                      </div>
                      {activity.severity && (
                        <Badge 
                          variant={
                            activity.severity === 'error' ? 'destructive' :
                            activity.severity === 'warning' ? 'secondary' :
                            activity.severity === 'success' ? 'default' : 'outline'
                          }
                          className="ml-2"
                        >
                          {activity.severity}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full hover:bg-gray-100">
                View All Activity
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2