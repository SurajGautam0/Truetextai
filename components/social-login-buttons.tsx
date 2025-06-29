"use client"

import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { Github, Mail } from "lucide-react"

export function SocialLoginButtons() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button variant="outline" onClick={() => signIn("github", { callbackUrl: "/dashboard" })} className="w-full">
        <Github className="mr-2 h-4 w-4" />
        GitHub
      </Button>
      <Button variant="outline" onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="w-full">
        <Mail className="mr-2 h-4 w-4" />
        Google
      </Button>
    </div>
  )
}
