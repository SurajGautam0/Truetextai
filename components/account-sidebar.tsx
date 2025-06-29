"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Crown, CreditCard, KeyRound, User, Bell, Shield } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { isTrialActive } from "@/lib/trial-management"

const accountLinks = [
  {
    title: "Profile",
    href: "/account",
    icon: User,
    exact: true,
  },
  {
    title: "Billing",
    href: "/account/billing",
    icon: CreditCard,
  },
  {
    title: "Security",
    href: "/account/security",
    icon: Shield,
  },
  {
    title: "Notifications",
    href: "/account/notifications",
    icon: Bell,
  },
  {
    title: "API Keys",
    href: "/account/api-keys",
    icon: KeyRound,
  },
  {
    title: "Premium Trial",
    href: "/account/trial",
    icon: Crown,
    showBadge: true,
  },
]

export function AccountSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const isOnTrial = isTrialActive(user)

  return (
    <div className="w-64 border-r min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Account Settings</h2>
        <div className="space-y-1">
          {accountLinks.map((link) => {
            // Only show the Premium Trial link if user is on free plan
            if (link.title === "Premium Trial" && user?.plan !== "free") {
              return null
            }

            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href)

            return (
              <Button
                key={link.href}
                variant="ghost"
                asChild
                className={cn("w-full justify-start", isActive && "bg-muted font-medium")}
              >
                <Link href={link.href}>
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.title}
                  {link.showBadge && isOnTrial && (
                    <span className="ml-auto text-xs font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </Link>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
