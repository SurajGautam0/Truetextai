"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function PricingSection() {
  const [annual, setAnnual] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  const handleSubscribe = (plan: string) => {
    if (!isAuthenticated) {
      router.push("/signup?plan=" + plan)
    } else {
      // For now, just redirect to dashboard
      // In a real app, this would go to a checkout page
      router.push("/dashboard")
    }
  }

  return (
    <div>
      <div className="flex justify-center mb-8">
        <div className="bg-muted p-1 rounded-lg flex items-center">
          <button
            onClick={() => setAnnual(false)}
            className={`px-4 py-2 rounded-md ${!annual ? "bg-background shadow-sm" : ""}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-4 py-2 rounded-md ${annual ? "bg-background shadow-sm" : ""}`}
          >
            Annual <span className="text-sm text-emerald-600 font-medium">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Free Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>For casual users and students</CardDescription>
            <div className="mt-4 text-3xl font-bold">$0</div>
          </CardHeader>
          <CardContent className="h-64">
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>1,000 tokens per day</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Basic AI text detection</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Simple paraphrasing</span>
              </li>
              <li className="flex items-center">
                <X className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-muted-foreground">Advanced models</span>
              </li>
              <li className="flex items-center">
                <X className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-muted-foreground">Priority support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => handleSubscribe("free")}>
              {isAuthenticated ? "Current Plan" : "Get Started"}
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="border-primary">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Pro</CardTitle>
                <CardDescription>For professionals and creators</CardDescription>
              </div>
              <Badge variant="default">Popular</Badge>
            </div>
            <div className="mt-4 text-3xl font-bold">
              ${annual ? "19" : "24"}
              <span className="text-sm font-normal text-muted-foreground">/{annual ? "mo" : "mo"}</span>
            </div>
            {annual && <div className="text-sm text-muted-foreground">Billed annually (${19 * 12})</div>}
          </CardHeader>
          <CardContent className="h-64">
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>10,000 tokens per day</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Advanced AI text detection</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Advanced paraphrasing</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Premium AI models</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Email support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handleSubscribe("pro")}>
              {isAuthenticated && user?.plan === "pro" ? "Current Plan" : "Subscribe"}
            </Button>
          </CardFooter>
        </Card>

        {/* Enterprise Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Enterprise</CardTitle>
            <CardDescription>For teams and organizations</CardDescription>
            <div className="mt-4 text-3xl font-bold">
              ${annual ? "79" : "99"}
              <span className="text-sm font-normal text-muted-foreground">/{annual ? "mo" : "mo"}</span>
            </div>
            {annual && <div className="text-sm text-muted-foreground">Billed annually (${79 * 12})</div>}
          </CardHeader>
          <CardContent className="h-64">
            <ul className="space-y-2">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Unlimited tokens</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Enterprise-grade AI detection</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>All premium features</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Team management</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-2" />
                <span>Priority 24/7 support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => handleSubscribe("enterprise")}>
              {isAuthenticated && user?.plan === "enterprise" ? "Current Plan" : "Contact Sales"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
