"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"
import { useThemeContext } from "./theme-provider"
import { Button } from "@/components/ui/button"
import { Check, Palette, Moon, Sun, Monitor, Paintbrush, Trash, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { type Theme, themes } from "@/lib/themes"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function ColorPickerInput({ label, value, onChange }: ColorPickerProps) {
  // Parse the HSL value
  const hslMatch = value.match(/(\d+)\s+(\d+)%\s+(\d+)%/)
  const [h, s, l] = hslMatch ? [hslMatch[1], hslMatch[2], hslMatch[3]] : ["0", "0", "0"]

  // Convert HSL to hex for the color input
  const hslToHex = (h: number, s: number, l: number) => {
    s /= 100
    l /= 100
    const a = s * Math.min(l, 1 - l)
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0")
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  const hexColor = hslToHex(Number.parseInt(h), Number.parseInt(s), Number.parseInt(l))

  // Convert hex to HSL for the onChange handler
  const hexToHsl = (hex: string) => {
    // Remove the # if present
    hex = hex.replace(/^#/, "")

    // Parse the hex values
    const r = Number.parseInt(hex.substring(0, 2), 16) / 255
    const g = Number.parseInt(hex.substring(2, 4), 16) / 255
    const b = Number.parseInt(hex.substring(4, 6), 16) / 255

    // Find the min and max values to calculate the lightness
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0,
      s = 0,
      l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }

      h = Math.round(h * 60)
    }

    s = Math.round(s * 100)
    l = Math.round(l * 100)

    return `${h} ${s}% ${l}%`
  }

  const handleChange = (hex: string) => {
    const hslValue = hexToHsl(hex)
    onChange(hslValue)
  }

  return (
    <div className="flex items-center gap-4">
      <Label className="w-24">{label}</Label>
      <div className="w-8 h-8 rounded-full border" style={{ backgroundColor: `hsl(${value})` }} />
      <Input
        type="color"
        value={hexColor}
        onChange={(e) => handleChange(e.target.value)}
        className="w-16 h-8 p-0 overflow-hidden"
      />
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1" />
    </div>
  )
}

export function ThemeSettings() {
  const { theme: currentTheme, setTheme } = useTheme()
  const { themes: availableThemes, customTheme, setCustomTheme } = useThemeContext()
  const [tempCustomTheme, setTempCustomTheme] = useState<Theme | null>(customTheme)
  const [activeTab, setActiveTab] = useState("themes")
  const [saveSuccess, setSaveSuccess] = useState(false)

  const applyCustomTheme = () => {
    if (tempCustomTheme) {
      setCustomTheme(tempCustomTheme)
      document.documentElement.style.setProperty("--radius", `${tempCustomTheme.borderRadius}rem`)

      // Apply custom theme colors
      Object.entries(tempCustomTheme.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value)
      })

      setTheme("custom")
      setSaveSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    }
  }

  const resetCustomTheme = () => {
    setTempCustomTheme(customTheme)
  }

  const deleteCustomTheme = () => {
    setCustomTheme(null)
    setTempCustomTheme(null)
    localStorage.removeItem("surajwriter-custom-theme")
    setTheme("dark")
  }

  const updateCustomColor = (colorKey: string, value: string) => {
    if (!tempCustomTheme) return

    setTempCustomTheme({
      ...tempCustomTheme,
      colors: {
        ...tempCustomTheme.colors,
        [colorKey]: value,
      },
    })
  }

  const updateBorderRadius = (value: number) => {
    if (!tempCustomTheme) return

    setTempCustomTheme({
      ...tempCustomTheme,
      borderRadius: value,
    })
  }

  const createNewCustomTheme = () => {
    setTempCustomTheme({
      ...themes[currentTheme || "default"],
      id: "custom",
      name: "Custom Theme",
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Theme Settings</CardTitle>
          <CardDescription>
            Customize the appearance of the application by selecting a theme or creating your own.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {saveSuccess && (
            <Alert className="mb-6 bg-success/20 text-success border-success">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Your theme settings have been saved successfully.</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="themes" value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="themes">
                <Palette className="h-4 w-4 mr-2" />
                Preset Themes
              </TabsTrigger>
              <TabsTrigger value="custom">
                <Paintbrush className="h-4 w-4 mr-2" />
                Custom Theme
              </TabsTrigger>
              <TabsTrigger value="mode">
                <Sun className="h-4 w-4 mr-2" />
                <Moon className="h-4 w-4 mr-2" />
                Mode
              </TabsTrigger>
            </TabsList>

            <TabsContent value="themes" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.values(themes).map((theme) => (
                  <div
                    key={theme.id}
                    className={cn(
                      "cursor-pointer rounded-lg p-4 border-2 transition-all",
                      currentTheme === theme.id
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground/20",
                    )}
                    onClick={() => setTheme(theme.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">{theme.name}</span>
                      {currentTheme === theme.id && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="rounded-full w-6 h-6" style={{ background: `hsl(${theme.colors.background})` }} />
                      <div className="rounded-full w-6 h-6" style={{ background: `hsl(${theme.colors.primary})` }} />
                      <div className="rounded-full w-6 h-6" style={{ background: `hsl(${theme.colors.secondary})` }} />
                      <div className="rounded-full w-6 h-6" style={{ background: `hsl(${theme.colors.accent})` }} />
                      <div
                        className="rounded-full w-6 h-6"
                        style={{ background: `hsl(${theme.colors.destructive})` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-6">
              {!tempCustomTheme && (
                <div className="text-center py-12">
                  <Palette className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Custom Theme Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Create your own custom theme by selecting colors and styles. Your custom theme will be saved and can
                    be used across the application.
                  </p>
                  <Button onClick={createNewCustomTheme} className="rounded-full">
                    <Paintbrush className="mr-2 h-4 w-4" />
                    Create Custom Theme
                  </Button>
                </div>
              )}

              {tempCustomTheme && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Primary Colors</h3>
                      <div className="space-y-4">
                        <ColorPickerInput
                          label="Primary"
                          value={tempCustomTheme.colors.primary}
                          onChange={(value) => updateCustomColor("primary", value)}
                        />
                        <ColorPickerInput
                          label="Secondary"
                          value={tempCustomTheme.colors.secondary}
                          onChange={(value) => updateCustomColor("secondary", value)}
                        />
                        <ColorPickerInput
                          label="Accent"
                          value={tempCustomTheme.colors.accent}
                          onChange={(value) => updateCustomColor("accent", value)}
                        />
                        <ColorPickerInput
                          label="Destructive"
                          value={tempCustomTheme.colors.destructive}
                          onChange={(value) => updateCustomColor("destructive", value)}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Background Colors</h3>
                      <div className="space-y-4">
                        <ColorPickerInput
                          label="Background"
                          value={tempCustomTheme.colors.background}
                          onChange={(value) => updateCustomColor("background", value)}
                        />
                        <ColorPickerInput
                          label="Foreground"
                          value={tempCustomTheme.colors.foreground}
                          onChange={(value) => updateCustomColor("foreground", value)}
                        />
                        <ColorPickerInput
                          label="Card"
                          value={tempCustomTheme.colors.card}
                          onChange={(value) => updateCustomColor("card", value)}
                        />
                        <ColorPickerInput
                          label="Muted"
                          value={tempCustomTheme.colors.muted}
                          onChange={(value) => updateCustomColor("muted", value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Border Radius</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <Label>Border Radius: {tempCustomTheme.borderRadius}rem</Label>
                        </div>
                        <Slider
                          value={[tempCustomTheme.borderRadius]}
                          min={0}
                          max={2}
                          step={0.05}
                          onValueChange={(value) => updateBorderRadius(value[0])}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Square</span>
                          <span>Rounded</span>
                          <span>Circular</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                          <div
                            className="w-20 h-20 border-2 border-primary"
                            style={{ borderRadius: `${tempCustomTheme.borderRadius}rem` }}
                          ></div>
                          <div
                            className="px-6 py-2 bg-primary text-primary-foreground text-sm"
                            style={{ borderRadius: `${tempCustomTheme.borderRadius}rem` }}
                          >
                            Button
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="destructive" onClick={deleteCustomTheme}>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete Custom Theme
                    </Button>
                    <div className="space-x-2">
                      <Button variant="outline" onClick={resetCustomTheme}>
                        Reset
                      </Button>
                      <Button onClick={applyCustomTheme}>Save & Apply Custom Theme</Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="mode" className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div
                  className={cn(
                    "cursor-pointer rounded-lg p-6 border-2 transition-all flex flex-col items-center",
                    currentTheme === "light" ? "border-primary" : "border-transparent hover:border-muted-foreground/20",
                  )}
                  onClick={() => setTheme("light")}
                >
                  <Sun className="h-12 w-12 mb-3" />
                  <span className="font-medium">Light</span>
                  {currentTheme === "light" && <Check className="h-4 w-4 text-primary mt-2" />}
                </div>

                <div
                  className={cn(
                    "cursor-pointer rounded-lg p-6 border-2 transition-all flex flex-col items-center",
                    currentTheme === "dark" ? "border-primary" : "border-transparent hover:border-muted-foreground/20",
                  )}
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="h-12 w-12 mb-3" />
                  <span className="font-medium">Dark</span>
                  {currentTheme === "dark" && <Check className="h-4 w-4 text-primary mt-2" />}
                </div>

                <div
                  className={cn(
                    "cursor-pointer rounded-lg p-6 border-2 transition-all flex flex-col items-center",
                    currentTheme === "system"
                      ? "border-primary"
                      : "border-transparent hover:border-muted-foreground/20",
                  )}
                  onClick={() => setTheme("system")}
                >
                  <Monitor className="h-12 w-12 mb-3" />
                  <span className="font-medium">System</span>
                  {currentTheme === "system" && <Check className="h-4 w-4 text-primary mt-2" />}
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h3 className="text-sm font-medium mb-2">About Theme Modes</h3>
                <p className="text-sm text-muted-foreground">
                  <strong>Light Mode:</strong> Uses a bright color scheme that works well in well-lit environments.
                  <br />
                  <strong>Dark Mode:</strong> Uses a darker color scheme that reduces eye strain in low-light
                  environments.
                  <br />
                  <strong>System:</strong> Automatically switches between light and dark mode based on your system
                  preferences.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
