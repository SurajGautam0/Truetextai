"use client"

import { useTheme } from "next-themes"
import { useThemeContext } from "./theme-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Paintbrush, Check, Palette, Settings, Moon, Sun, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { type Theme, themes } from "@/lib/themes"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
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

export function ThemeCustomizer() {
  const { theme: currentTheme, setTheme } = useTheme()
  const { themes: availableThemes, customTheme, setCustomTheme } = useThemeContext()
  const [activeTab, setActiveTab] = useState("themes")
  const [tempCustomTheme, setTempCustomTheme] = useState<Theme | null>(customTheme)

  const applyCustomTheme = () => {
    if (tempCustomTheme) {
      setCustomTheme(tempCustomTheme)
      document.documentElement.style.setProperty("--radius", `${tempCustomTheme.borderRadius}rem`)

      // Apply custom theme colors
      Object.entries(tempCustomTheme.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value)
      })

      setTheme("custom")
    }
  }

  const resetCustomTheme = () => {
    setTempCustomTheme(customTheme)
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Paintbrush className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Customize theme</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[900px] w-[90vw]">
        <DialogHeader>
          <DialogTitle>Customize Theme</DialogTitle>
          <DialogDescription>
            Personalize the appearance of the application by selecting a theme or creating your own.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="themes" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="themes">
              <Palette className="h-4 w-4 mr-2" />
              Preset Themes
            </TabsTrigger>
            <TabsTrigger value="custom">
              <Settings className="h-4 w-4 mr-2" />
              Custom Theme
            </TabsTrigger>
            <TabsTrigger value="mode">
              <Sun className="h-4 w-4 mr-2" />
              <Moon className="h-4 w-4 mr-2" />
              Mode
            </TabsTrigger>
          </TabsList>

          <TabsContent value="themes" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.values(themes).map((theme) => (
                <div
                  key={theme.id}
                  className={cn(
                    "cursor-pointer rounded-lg p-3 border-2 transition-all",
                    currentTheme === theme.id
                      ? "border-primary"
                      : "border-transparent hover:border-muted-foreground/20",
                  )}
                  onClick={() => setTheme(theme.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{theme.name}</span>
                    {currentTheme === theme.id && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    <div className="rounded-full w-6 h-6" style={{ background: `hsl(${theme.colors.background})` }} />
                    <div className="rounded-full w-6 h-6" style={{ background: `hsl(${theme.colors.primary})` }} />
                    <div className="rounded-full w-6 h-6" style={{ background: `hsl(${theme.colors.secondary})` }} />
                    <div className="rounded-full w-6 h-6" style={{ background: `hsl(${theme.colors.accent})` }} />
                    <div className="rounded-full w-6 h-6" style={{ background: `hsl(${theme.colors.destructive})` }} />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            {!tempCustomTheme && (
              <div className="text-center py-8">
                <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Custom Theme Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your own custom theme by selecting colors and styles.
                </p>
                <Button
                  onClick={() => {
                    setTempCustomTheme({
                      ...themes[currentTheme || "default"],
                      id: "custom",
                      name: "Custom Theme",
                    })
                  }}
                >
                  Create Custom Theme
                </Button>
              </div>
            )}

            {tempCustomTheme && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Primary Colors</h3>
                    <div className="space-y-4">
                      <ColorPicker
                        label="Primary"
                        value={tempCustomTheme.colors.primary}
                        onChange={(value) => updateCustomColor("primary", value)}
                      />
                      <ColorPicker
                        label="Secondary"
                        value={tempCustomTheme.colors.secondary}
                        onChange={(value) => updateCustomColor("secondary", value)}
                      />
                      <ColorPicker
                        label="Accent"
                        value={tempCustomTheme.colors.accent}
                        onChange={(value) => updateCustomColor("accent", value)}
                      />
                      <ColorPicker
                        label="Destructive"
                        value={tempCustomTheme.colors.destructive}
                        onChange={(value) => updateCustomColor("destructive", value)}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Background Colors</h3>
                    <div className="space-y-4">
                      <ColorPicker
                        label="Background"
                        value={tempCustomTheme.colors.background}
                        onChange={(value) => updateCustomColor("background", value)}
                      />
                      <ColorPicker
                        label="Foreground"
                        value={tempCustomTheme.colors.foreground}
                        onChange={(value) => updateCustomColor("foreground", value)}
                      />
                      <ColorPicker
                        label="Card"
                        value={tempCustomTheme.colors.card}
                        onChange={(value) => updateCustomColor("card", value)}
                      />
                      <ColorPicker
                        label="Muted"
                        value={tempCustomTheme.colors.muted}
                        onChange={(value) => updateCustomColor("muted", value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Border Radius</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          className="w-16 h-16 border-2 border-primary"
                          style={{ borderRadius: `${tempCustomTheme.borderRadius}rem` }}
                        ></div>
                        <div
                          className="px-4 py-2 bg-primary text-primary-foreground text-sm"
                          style={{ borderRadius: `${tempCustomTheme.borderRadius}rem` }}
                        >
                          Button
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tempCustomTheme && (
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={resetCustomTheme}>
                  Reset
                </Button>
                <Button onClick={applyCustomTheme}>Apply Custom Theme</Button>
              </DialogFooter>
            )}
          </TabsContent>

          <TabsContent value="mode" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div
                className={cn(
                  "cursor-pointer rounded-lg p-4 border-2 transition-all flex flex-col items-center",
                  currentTheme === "light" ? "border-primary" : "border-transparent hover:border-muted-foreground/20",
                )}
                onClick={() => setTheme("light")}
              >
                <Sun className="h-10 w-10 mb-2" />
                <span className="font-medium">Light</span>
                {currentTheme === "light" && <Check className="h-4 w-4 text-primary mt-2" />}
              </div>

              <div
                className={cn(
                  "cursor-pointer rounded-lg p-4 border-2 transition-all flex flex-col items-center",
                  currentTheme === "dark" ? "border-primary" : "border-transparent hover:border-muted-foreground/20",
                )}
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-10 w-10 mb-2" />
                <span className="font-medium">Dark</span>
                {currentTheme === "dark" && <Check className="h-4 w-4 text-primary mt-2" />}
              </div>

              <div
                className={cn(
                  "cursor-pointer rounded-lg p-4 border-2 transition-all flex flex-col items-center",
                  currentTheme === "system" ? "border-primary" : "border-transparent hover:border-muted-foreground/20",
                )}
                onClick={() => setTheme("system")}
              >
                <Monitor className="h-10 w-10 mb-2" />
                <span className="font-medium">System</span>
                {currentTheme === "system" && <Check className="h-4 w-4 text-primary mt-2" />}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export function ModeToggle() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56">
        <ThemeCustomizer />
      </PopoverContent>
    </Popover>
  )
}
