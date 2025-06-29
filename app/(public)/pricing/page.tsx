import PricingSection from "@/components/pricing-section"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing - TrueTextAI",
  description: "Choose the perfect plan for your needs with our flexible pricing options.",
}

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan for your needs. Upgrade or downgrade at any time.
        </p>
      </div>

      <PricingSection />

      <div className="mt-24 text-center">
        <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6 text-left">
          <div>
            <h3 className="text-xl font-semibold mb-2">Can I change plans later?</h3>
            <p className="text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Do you offer refunds?</h3>
            <p className="text-muted-foreground">
              We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied, contact our support
              team.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-muted-foreground">
              We accept all major credit cards, PayPal, and bank transfers for annual plans.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Do you offer custom plans for teams?</h3>
            <p className="text-muted-foreground">
              Yes, we offer custom plans for teams and organizations. Contact our sales team for more information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
