"use client"

import type React from "react"

import { TabsContent } from "@/components/ui/tabs"
import { FeatureCard } from "@/components/feature-card"
import { Button } from "@/components/ui/button"
import { Crown, ArrowRight, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import PremiumFeaturePreview from "@/components/premium-feature-preview"

interface PremiumFeaturesShowcaseProps {
  premiumFeatures: {
    title: string
    description: string
    icon: React.ReactNode
    comingSoon?: boolean
  }[]
  isPremium: boolean
}

export default function PremiumFeaturesShowcase({ premiumFeatures, isPremium }: PremiumFeaturesShowcaseProps) {
  const router = useRouter()

  return (
    <TabsContent value="features" className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {premiumFeatures.map((feature, index) => (
          <FeatureCard
            key={index}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            comingSoon={feature.comingSoon}
          />
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Feature Previews</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <PremiumFeaturePreview
            title="Assignment Writer"
            description="Generate high-quality academic papers with AI assistance"
            imageSrc="/images/assignment-writer-preview.png"
            altText="Assignment Writer Preview"
          />
          <PremiumFeaturePreview
            title="Advanced Editor"
            description="Full-featured rich text editor with formatting tools"
            imageSrc="/images/editor-preview.png"
            altText="Advanced Editor Preview"
          />
          <PremiumFeaturePreview
            title="Premium AI Models"
            description="Access to advanced AI models for better results"
            imageSrc="/images/ai-models-preview.png"
            altText="Premium AI Models Preview"
          />
          <PremiumFeaturePreview
            title="Collaboration Tools"
            description="Share and collaborate on documents in real-time"
            imageSrc="/images/collaboration-preview.png"
            altText="Collaboration Tools Preview"
          />
        </div>
      </div>

      <div className="flex justify-center mt-12">
        {isPremium ? (
          <div className="text-center space-y-4">
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              <Check className="h-3.5 w-3.5 mr-1" /> Active Subscription
            </Badge>
            <p className="text-muted-foreground">You already have access to all premium features</p>
            <Button onClick={() => router.push("/dashboard")} className="mt-2">
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button size="lg" onClick={() => router.push("/pricing")} className="mt-8">
            <Crown className="mr-2 h-5 w-5" /> Upgrade to Premium
          </Button>
        )}
      </div>
    </TabsContent>
  )
}
