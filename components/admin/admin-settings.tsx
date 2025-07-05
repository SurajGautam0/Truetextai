"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  Shield, 
  Database, 
  Globe, 
  Zap, 
  Bell, 
  Key, 
  Users, 
  FileText,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface SystemSettings {
  siteName: string
  siteDescription: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  emailVerification: boolean
  maxFileSize: number
  rateLimitPerMinute: number
  aiProvider: string
  aiApiKey: string
  databaseBackupEnabled: boolean
  backupFrequency: string
  logLevel: string
  emailNotifications: boolean
  securityAlerts: boolean
  autoScaling: boolean
  cacheEnabled: boolean
  cdnEnabled: boolean
}

const defaultSettings: SystemSettings = {
  siteName: "TrueText AI",
  siteDescription: "Advanced AI-powered text analysis and writing tools",
  maintenanceMode: false,
  registrationEnabled: true,
  emailVerification: true,
  maxFileSize: 10,
  rateLimitPerMinute: 100,
  aiProvider: "openai",
  aiApiKey: "sk-...",
  databaseBackupEnabled: true,
  backupFrequency: "daily",
  logLevel: "info",
  emailNotifications: true,
  securityAlerts: true,
  autoScaling: true,
  cacheEnabled: true,
  cdnEnabled: false
}

export default function AdminSettings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      
      const data = await response.json()
      const fetchedSettings = data.settings || defaultSettings
      
      // Convert string values to appropriate types
      const typedSettings = {
        ...fetchedSettings,
        maintenanceMode: fetchedSettings.maintenanceMode === 'true',
        registrationEnabled: fetchedSettings.registrationEnabled === 'true',
        emailVerification: fetchedSettings.emailVerification === 'true',
        maxFileSize: parseInt(fetchedSettings.maxFileSize) || 10,
        rateLimitPerMinute: parseInt(fetchedSettings.rateLimitPerMinute) || 100,
        databaseBackupEnabled: fetchedSettings.databaseBackupEnabled === 'true',
        emailNotifications: fetchedSettings.emailNotifications === 'true',
        securityAlerts: fetchedSettings.securityAlerts === 'true',
        autoScaling: fetchedSettings.autoScaling === 'true',
        cacheEnabled: fetchedSettings.cacheEnabled === 'true',
        cdnEnabled: fetchedSettings.cdnEnabled === 'true'
      }
      
      setSettings(typedSettings)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching settings:', error)
      setSettings(defaultSettings)
      setLoading(false)
      toast({
        title: "Using default settings",
        description: "Could not load system settings, using defaults.",
        variant: "default",
      })
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save settings')
      }
      
      setHasChanges(false)
      toast({
        title: "Settings saved",
        description: "System settings have been updated successfully.",
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error saving settings",
        description: "Could not save system settings.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const resetToDefaults = () => {
    setSettings(defaultSettings)
    setHasChanges(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
          <p className="text-muted-foreground mt-1">
            Configure system behavior, security, and performance settings.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={resetToDefaults}
            disabled={saving}
          >
            Reset to Defaults
          </Button>
          <Button 
            onClick={saveSettings}
            disabled={saving || !hasChanges}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic site configuration and appearance settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
                placeholder="Enter site name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                placeholder="Enter site description"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable the site for maintenance
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>User Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new users to register
                </p>
              </div>
              <Switch
                checked={settings.registrationEnabled}
                onCheckedChange={(checked) => handleSettingChange('registrationEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure security policies and authentication.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Require email verification for new accounts
                </p>
              </div>
              <Switch
                checked={settings.emailVerification}
                onCheckedChange={(checked) => handleSettingChange('emailVerification', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rateLimit">Rate Limit (per minute)</Label>
              <Input
                id="rateLimit"
                type="number"
                value={settings.rateLimitPerMinute}
                onChange={(e) => handleSettingChange('rateLimitPerMinute', parseInt(e.target.value))}
                min="1"
                max="1000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={settings.maxFileSize}
                onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                min="1"
                max="100"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Security Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Enable security alert notifications
                </p>
              </div>
              <Switch
                checked={settings.securityAlerts}
                onCheckedChange={(checked) => handleSettingChange('securityAlerts', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              AI Configuration
            </CardTitle>
            <CardDescription>
              Configure AI providers and API settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aiProvider">AI Provider</Label>
              <Select
                value={settings.aiProvider}
                onValueChange={(value) => handleSettingChange('aiProvider', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select AI provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aiApiKey">API Key</Label>
              <Input
                id="aiApiKey"
                type="password"
                value={settings.aiApiKey}
                onChange={(e) => handleSettingChange('aiApiKey', e.target.value)}
                placeholder="Enter API key"
              />
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Key className="mr-1 h-3 w-3" />
                API Key Status
              </Badge>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="mr-1 h-3 w-3" />
                Valid
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Database & Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database & Backup
            </CardTitle>
            <CardDescription>
              Database configuration and backup settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Backup</Label>
                <p className="text-sm text-muted-foreground">
                  Enable automatic database backups
                </p>
              </div>
              <Switch
                checked={settings.databaseBackupEnabled}
                onCheckedChange={(checked) => handleSettingChange('databaseBackupEnabled', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backupFrequency">Backup Frequency</Label>
              <Select
                value={settings.backupFrequency}
                onValueChange={(value) => handleSettingChange('backupFrequency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logLevel">Log Level</Label>
              <Select
                value={settings.logLevel}
                onValueChange={(value) => handleSettingChange('logLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select log level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Clock className="mr-1 h-3 w-3" />
                Last Backup
              </Badge>
              <span className="text-sm text-muted-foreground">
                2 hours ago
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Performance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Performance
            </CardTitle>
            <CardDescription>
              Optimize system performance and caching.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Scaling</Label>
                <p className="text-sm text-muted-foreground">
                  Enable automatic resource scaling
                </p>
              </div>
              <Switch
                checked={settings.autoScaling}
                onCheckedChange={(checked) => handleSettingChange('autoScaling', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cache Enabled</Label>
                <p className="text-sm text-muted-foreground">
                  Enable response caching
                </p>
              </div>
              <Switch
                checked={settings.cacheEnabled}
                onCheckedChange={(checked) => handleSettingChange('cacheEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>CDN Enabled</Label>
                <p className="text-sm text-muted-foreground">
                  Use content delivery network
                </p>
              </div>
              <Switch
                checked={settings.cdnEnabled}
                onCheckedChange={(checked) => handleSettingChange('cdnEnabled', checked)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>System Status</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Database</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Cache</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>API</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>CDN</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure email and system notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email notifications for system events
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Notification Types</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="user-signup" defaultChecked />
                  <Label htmlFor="user-signup" className="text-sm">User signups</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="system-alerts" defaultChecked />
                  <Label htmlFor="system-alerts" className="text-sm">System alerts</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="backup-complete" defaultChecked />
                  <Label htmlFor="backup-complete" className="text-sm">Backup completion</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="api-errors" />
                  <Label htmlFor="api-errors" className="text-sm">API errors</Label>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Recent Notifications</Label>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Database backup completed</span>
                  <span className="text-muted-foreground ml-auto">2h ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-yellow-600" />
                  <span>High API usage detected</span>
                  <span className="text-muted-foreground ml-auto">4h ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>New user registered</span>
                  <span className="text-muted-foreground ml-auto">6h ago</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
