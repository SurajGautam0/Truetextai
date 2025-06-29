import ParaphraserTool from "@/components/paraphraser-tool"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export const metadata = {
  title: "Paraphraser | TrueTextAI",
  description: "Paraphrase your text to make it more human-like and less detectable as AI-generated content.",
}

export default function ParaphraserPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Paraphraser</h1>
      </div>

      <ParaphraserTool />
    </div>
  )
}
