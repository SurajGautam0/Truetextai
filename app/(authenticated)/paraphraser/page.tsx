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
      <ParaphraserTool />
    </div>
  )
}
