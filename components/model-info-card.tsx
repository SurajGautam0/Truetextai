import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ModelInfoProps {
  internalName: string
  displayName: string
  description: string
  strengths: string[]
  tokenLimit: number
  speed: "Fast" | "Medium" | "Slow"
}

const modelInfo: Record<string, ModelInfoProps> = {
  "ninja-3.2": {
    internalName: "ninja-3.2",
    displayName: "Llama 3 (8B)",
    description: "Efficient general-purpose model with good performance",
    strengths: ["General writing", "Code assistance", "Quick responses"],
    tokenLimit: 8192,
    speed: "Fast",
  },
  "ninja-pro": {
    internalName: "ninja-pro",
    displayName: "Llama 3 (70B)",
    description: "Powerful model with excellent reasoning capabilities",
    strengths: ["Complex writing", "Detailed analysis", "Creative content"],
    tokenLimit: 8192,
    speed: "Medium",
  },
  "stealth-2.0": {
    internalName: "stealth-2.0",
    displayName: "Mixtral 8x7B",
    description: "Versatile model with long context window",
    strengths: ["Long documents", "Research assistance", "Detailed responses"],
    tokenLimit: 32768,
    speed: "Medium",
  },
  "ghost-1.5": {
    internalName: "ghost-1.5",
    displayName: "Gemma 7B",
    description: "Efficient instruction-following model",
    strengths: ["Following instructions", "Quick responses", "Efficient processing"],
    tokenLimit: 8192,
    speed: "Fast",
  },
  "sage-opus": {
    internalName: "sage-opus",
    displayName: "Claude 3 Opus",
    description: "Most powerful Claude model for complex tasks",
    strengths: ["Complex reasoning", "Nuanced understanding", "High-quality output"],
    tokenLimit: 200000,
    speed: "Slow",
  },
  "sage-sonnet": {
    internalName: "sage-sonnet",
    displayName: "Claude 3 Sonnet",
    description: "Balanced Claude model for general use",
    strengths: ["Balanced performance", "Good reasoning", "Quality writing"],
    tokenLimit: 200000,
    speed: "Medium",
  },
  "sage-haiku": {
    internalName: "sage-haiku",
    displayName: "Claude 3 Haiku",
    description: "Fast, efficient Claude model",
    strengths: ["Quick responses", "Efficient processing", "Good quality"],
    tokenLimit: 200000,
    speed: "Fast",
  },
}

export function ModelInfoCard({ modelName }: { modelName: string }) {
  const model = modelInfo[modelName] || modelInfo["ninja-3.2"]

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case "Fast":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Slow":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{model.displayName}</CardTitle>
          <Badge className={getSpeedColor(model.speed)}>{model.speed}</Badge>
        </div>
        <CardDescription>{model.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <span className="font-medium">Best for:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {model.strengths.map((strength, index) => (
                <Badge key={index} variant="outline">
                  {strength}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <span className="font-medium">Token limit:</span> {model.tokenLimit.toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ModelInfoGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.keys(modelInfo).map((modelName) => (
        <ModelInfoCard key={modelName} modelName={modelName} />
      ))}
    </div>
  )
}
