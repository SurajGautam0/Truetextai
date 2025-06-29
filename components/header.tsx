"use client"

import { useState, useEffect } from "react"
import { Bell, Crown, Search, Menu, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeCustomizer } from "./theme-customizer"
import { useAuth } from "@/contexts/auth-context"

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [wordsUsed, setWordsUsed] = useState(12345)
  const [totalWords, setTotalWords] = useState(20000)
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-10 transition-all duration-200 ${
        scrolled ? "border-b shadow-sm" : ""
      } border-border bg-background/95 backdrop-blur-sm`}
    >
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left - Title & Badge */}
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">{title}</h1>
          <Badge variant="outline" className="hidden md:inline-flex animate-slide-in-bottom">
            <span className="text-primary mr-1">New!</span> AI models updated
          </Badge>
        </div>

        {/* Right - Desktop Content */}
        <div className="hidden md:flex items-center gap-4">
          <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            <span className="font-medium text-foreground">{wordsUsed.toLocaleString()}</span>
            <span className="mx-1">/</span>
            <span>{totalWords.toLocaleString()}</span>
            <span className="ml-1">words</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Crown className="h-4 w-4 text-amber-500" />
                <span>{user?.plan === "free" ? "Upgrade" : user?.plan === "pro" ? "Pro" : "Enterprise"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Subscription</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Crown className="mr-2 h-4 w-4 text-amber-500" />
                <span>Upgrade to Pro</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Search className="mr-2 h-4 w-4" />
                <span>View Plans</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </Button>

          <ThemeCustomizer />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user?.name || "User"} />
                <AvatarFallback>{user?.name ? user.name.substring(0, 2).toUpperCase() : "U"}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.name || "My Account"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex items-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Content */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 space-y-2 bg-background border-t border-border">
          <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full w-fit">
            <span className="font-medium text-foreground">{wordsUsed.toLocaleString()}</span>
            <span className="mx-1">/</span>
            <span>{totalWords.toLocaleString()}</span>
            <span className="ml-1">words</span>
          </div>
          <Button variant="outline" className="w-full flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-500" />
            Upgrade to Pro
          </Button>
          <Button variant="ghost" className="w-full flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </Button>
          <ThemeCustomizer />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>{user?.name || "My Account"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  )
}
