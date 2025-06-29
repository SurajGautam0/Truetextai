import AssignmentWriter from "@/components/assignment-writer"
import Header from "@/components/header"
import PremiumFeatureGuard from "@/components/premium-feature-guard"

export default function AssignmentWriterPage() {
  return (
    <>
      <Header title="Assignment Writer" />
      <main className="flex-1 overflow-auto p-6">
        <PremiumFeatureGuard
          featureName="Assignment Writer"
          description="Generate high-quality academic assignments with our advanced AI. Available exclusively to Pro and Enterprise subscribers."
        >
          <AssignmentWriter />
        </PremiumFeatureGuard>
      </main>
    </>
  )
}
