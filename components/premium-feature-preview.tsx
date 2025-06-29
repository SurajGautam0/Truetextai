import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PremiumFeaturePreviewProps {
  title: string
  description: string
  imageSrc: string
  altText: string
}

export default function PremiumFeaturePreview({ title, description, imageSrc, altText }: PremiumFeaturePreviewProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-amber-500 hover:bg-amber-600">
            <Crown className="h-3.5 w-3.5 mr-1" /> Premium
          </Badge>
        </div>
        <div className="relative h-[200px] w-full">
          <Image src={imageSrc || "/placeholder.svg"} alt={altText} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-sm text-white/80">{description}</p>
        </div>
      </div>
    </Card>
  )
}
