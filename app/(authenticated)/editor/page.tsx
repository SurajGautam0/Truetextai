import Header from "@/components/header"
import Editor from "@/components/editor"
import PremiumFeatureGuard from "@/components/premium-feature-guard"

export default function EditorPage() {
  return (
    <>
      <Header title="Document Editor" />
      <main className="flex-1 overflow-auto p-6">
        <PremiumFeatureGuard
          featureName="Document Editor"
          description="Create, edit, and format documents with our advanced editor. Available exclusively to Pro and Enterprise subscribers."
        >
          <Editor />
        </PremiumFeatureGuard>
      </main>
    </>
  )
}
