"use client"

import type * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { createContext, useContext, useEffect, useState } from "react"
import { type Theme, themes } from "@/lib/themes"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: string
  enableSystem?: boolean
  storageKey?: string
  disableTransitionOnChange?: boolean
}

type ThemeContextType = {
  theme: string
  setTheme: (theme: string) => void
  themes: Record<string, Theme>
  customTheme: Theme | null
  setCustomTheme: (theme: Theme | null) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  enableSystem = false,
  storageKey = "truetext-theme",
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [customTheme, setCustomTheme] = useState<Theme | null>(null)

  // Load custom theme from localStorage if available
  useEffect(() => {
    const savedCustomTheme = localStorage.getItem("truetext-custom-theme")
    if (savedCustomTheme) {
      try {
        setCustomTheme(JSON.parse(savedCustomTheme))
      } catch (e) {
        console.error("Failed to parse custom theme", e)
      }
    }
  }, [])

  // Save custom theme to localStorage when it changes
  useEffect(() => {
    if (customTheme) {
      localStorage.setItem("truetext-custom-theme", JSON.stringify(customTheme))
    }
  }, [customTheme])

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      storageKey={storageKey}
      disableTransitionOnChange={disableTransitionOnChange}
      {...props}
    >
      <ThemeContext.Provider
        value={{
          theme: defaultTheme,
          setTheme: () => {},
          themes,
          customTheme,
          setCustomTheme,
        }}
      >
        {children}
      </ThemeContext.Provider>
    </NextThemesProvider>
  )
}

export const useThemeContext = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider")
  }
  return context
}
