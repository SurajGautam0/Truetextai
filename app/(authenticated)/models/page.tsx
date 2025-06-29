import { ModelInfoGrid } from "@/components/model-info-card"

export default function ModelsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Available AI Models</h1>
      <p className="text-lg mb-8">
        SurajWriter provides access to a variety of AI models to help with your writing needs. Each model has different
        strengths and capabilities.
      </p>
      <ModelInfoGrid />
    </div>
  )
}
