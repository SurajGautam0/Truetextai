import type React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface FeatureSpotlightProps {
  title: string
  description: string
  icon: React.ReactNode
  href: string
  gradient?: string
  isNew?: boolean
  className?: string
}

export function FeatureSpotlight({
  title,
  description,
  icon,
  href,
  gradient = "from-primary to-purple-400",
  isNew = false,
  className,
}: FeatureSpotlightProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 border-primary/10",
        className,
      )}
    >
      <div className={cn("h-1.5 bg-gradient-to-r", gradient)}></div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center">{icon}</div>
          {isNew && (
            <Badge variant="outline" className="text-xs font-normal bg-primary/5 text-primary">
              New
            </Badge>
          )}
        </div>
        <CardTitle className="mt-4">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="h-[120px] flex items-center justify-center bg-muted/30 rounded-lg">
          <span className="text-sm text-muted-foreground">Feature Preview</span>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={href} className="w-full">
          <Button className="w-full rounded-full group">
            <span>Try {title}</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
