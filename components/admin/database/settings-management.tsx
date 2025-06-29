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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, Plus, Edit } from "lucide-react"

type Setting = {
  id: number
  key: string
  value: string
  description: string
  updated_at: string
}

export default function SettingsManagement() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddSettingDialog, setShowAddSettingDialog] = useState(false)
  const [showEditSettingDialog, setShowEditSettingDialog] = useState(false)
  const [currentSetting, setCurrentSetting] = useState<Setting | null>(null)
  const [newSetting, setNewSetting] = useState({
    key: "",
    value: "",
    description: "",
  })

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/settings")
      if (!response.ok) {
        throw new Error("Failed to fetch settings")
      }
      const data = await response.json()
      setSettings(data.settings)
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        title: "Error fetching settings",
        description: "Could not load settings data.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [toast])

  const handleAddSetting = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSetting),
      })

      if (!response.ok) {
        throw new Error("Failed to add setting")
      }

      const data = await response.json()

      // Check if the setting already exists
      const existingIndex = settings.findIndex((s) => s.key === data.setting.key)

      if (existingIndex >= 0) {
        // Update existing setting
        setSettings(settings.map((s, i) => (i === existingIndex ? data.setting : s)))
      } else {
        // Add new setting
        setSettings([...settings, data.setting])
      }

      setShowAddSettingDialog(false)
      setNewSetting({
        key: "",
        value: "",
        description: "",
      })

      toast({
        title: "Setting added",
        description: `Setting "${data.setting.key}" has been added.`,
      })
    } catch (error) {
      console.error("Error adding setting:", error)
      toast({
        title: "Error adding setting",
        description: "Failed to add setting.",
        variant: "destructive",
      })
    }
  }

  const handleEditSetting = async () => {
    if (!currentSetting) return

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: currentSetting.key,
          value: currentSetting.value,
          description: currentSetting.description,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update setting")
      }

      const data = await response.json()

      // Update the setting in the list
      setSettings(settings.map((s) => (s.key === currentSetting.key ? data.setting : s)))
      setShowEditSettingDialog(false)
      setCurrentSetting(null)

      toast({
        title: "Setting updated",
        description: `Setting "${currentSetting.key}" has been updated.`,
      })
    } catch (error) {
      console.error("Error updating setting:", error)
      toast({
        title: "Error updating setting",
        description: "Failed to update setting.",
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
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">System Settings</h2>
          <p className="text-muted-foreground">Manage application settings and configurations.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddSettingDialog} onOpenChange={setShowAddSettingDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Setting
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Setting</DialogTitle>
                <DialogDescription>Create a new system setting.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="key">Key</Label>
                  <Input
                    id="key"
                    value={newSetting.key}
                    onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    value={newSetting.value}
                    onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newSetting.description}
                    onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddSettingDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSetting}>Add Setting</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={fetchSettings}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading skeletons
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[200px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[250px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
            ) : settings.length > 0 ? (
              settings.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell className="font-medium">{setting.key}</TableCell>
                  <TableCell>{setting.value}</TableCell>
                  <TableCell>{setting.description}</TableCell>
                  <TableCell>{formatDate(setting.updated_at)}</TableCell>
                  <TableCell>
                    <Dialog
                      open={showEditSettingDialog && currentSetting?.id === setting.id}
                      onOpenChange={(open) => {
                        setShowEditSettingDialog(open)
                        if (!open) setCurrentSetting(null)
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setCurrentSetting(setting)}>
                          <span className="sr-only">Edit</span>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Setting</DialogTitle>
                          <DialogDescription>Update system setting.</DialogDescription>
                        </DialogHeader>
                        {currentSetting && (
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-key">Key</Label>
                              <Input id="edit-key" value={currentSetting.key} disabled />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-value">Value</Label>
                              <Input
                                id="edit-value"
                                value={currentSetting.value}
                                onChange={(e) => setCurrentSetting({ ...currentSetting, value: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-description">Description</Label>
                              <Textarea
                                id="edit-description"
                                value={currentSetting.description}
                                onChange={(e) => setCurrentSetting({ ...currentSetting, description: e.target.value })}
                              />
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowEditSettingDialog(false)
                              setCurrentSetting(null)
                            }}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleEditSetting}>Save Changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No settings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
