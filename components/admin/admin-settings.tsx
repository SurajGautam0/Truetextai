"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminSettings() {
  const { toast } = useToast()

  // General settings
  const [siteName, setSiteName] = useState("TrueTextAI")
  const [siteDescription, setSiteDescription] = useState("AI-powered writing assistant")
  const [contactEmail, setContactEmail] = useState("support@truetextai.com")

  // API settings
  const [apiRateLimit, setApiRateLimit] = useState("100")
  const [defaultModel, setDefaultModel] = useState("gpt-4o")
  const [enableLogging, setEnableLogging] = useState(true)

  // Security settings
  const [sessionTimeout, setSessionTimeout] = useState("7")
  const [requireMFA, setRequireMFA] = useState(false)
  const [passwordPolicy, setPasswordPolicy] = useState("medium")

  // Email settings
  const [smtpServer, setSmtpServer] = useState("smtp.example.com")
  const [smtpPort, setSmtpPort] = useState("587")
  const [smtpUser, setSmtpUser] = useState("notifications@truetextai.com")
  const [smtpPassword, setSmtpPassword] = useState("••••••••••••")
  const [emailFrom, setEmailFrom] = useState("noreply@truetextai.com")

  const [globalWordLimit, setGlobalWordLimit] = useState(1000)

  const handleSaveGeneral = () => {
    // In a real app, this would be an API call
    // await fetch('/api/admin/settings/general', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     siteName,
    //     siteDescription,
    //     contactEmail,
    //   }),
    // })

    toast({
      title: "Settings saved",
      description: "General settings have been updated successfully.",
    })
  }

  const handleSaveAPI = () => {
    // In a real app, this would be an API call
    toast({
      title: "API settings saved",
      description: "API configuration has been updated successfully.",
    })
  }

  const handleSaveSecurity = () => {
    // In a real app, this would be an API call
    toast({
      title: "Security settings saved",
      description: "Security configuration has been updated successfully.",
    })
  }

  const handleSaveEmail = () => {
    // In a real app, this would be an API call
    toast({
      title: "Email settings saved",
      description: "Email configuration has been updated successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">Configure system-wide settings and preferences.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic information about your application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Site Name</Label>
                <Input id="site-name" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-description">Site Description</Label>
                <Textarea
                  id="site-description"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveGeneral}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>Configure API rate limits and default models.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rate-limit">API Rate Limit (requests per minute)</Label>
                <Input
                  id="rate-limit"
                  type="number"
                  value={apiRateLimit}
                  onChange={(e) => setApiRateLimit(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-model">Default AI Model</Label>
                <Select value={defaultModel} onValueChange={setDefaultModel}>
                  <SelectTrigger id="default-model">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="enable-logging" checked={enableLogging} onCheckedChange={setEnableLogging} />
                <Label htmlFor="enable-logging">Enable API Request Logging</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAPI}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security policies and authentication settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (days)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="require-mfa" checked={requireMFA} onCheckedChange={setRequireMFA} />
                <Label htmlFor="require-mfa">Require Multi-Factor Authentication</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-policy">Password Policy</Label>
                <Select value={passwordPolicy} onValueChange={setPasswordPolicy}>
                  <SelectTrigger id="password-policy">
                    <SelectValue placeholder="Select policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (8+ characters)</SelectItem>
                    <SelectItem value="medium">Medium (8+ chars, mixed case, numbers)</SelectItem>
                    <SelectItem value="high">High (12+ chars, mixed case, numbers, symbols)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSecurity}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Configure email server settings for notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-server">SMTP Server</Label>
                <Input id="smtp-server" value={smtpServer} onChange={(e) => setSmtpServer(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input id="smtp-port" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-user">SMTP Username</Label>
                <Input id="smtp-user" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-password">SMTP Password</Label>
                <Input
                  id="smtp-password"
                  type="password"
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-from">From Email Address</Label>
                <Input id="email-from" type="email" value={emailFrom} onChange={(e) => setEmailFrom(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveEmail}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-2">Global Word Limit</h3>
        <p className="text-sm text-muted-foreground mb-4">Set the maximum number of words allowed per user (default applies if user-specific limit is not set).</p>
        <Input
          type="number"
          min={0}
          value={globalWordLimit}
          onChange={e => setGlobalWordLimit(parseInt(e.target.value))}
          className="w-40"
        />
      </div>
    </div>
  )
}
