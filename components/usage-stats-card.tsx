import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface UsageStatsCardProps {
  title: string
  value: number
  maxValue: number
  icon: React.ReactNode
  percentageChange?: number
  className?: string
}

export function UsageStatsCard({ title, value, maxValue, icon, percentageChange, className }: UsageStatsCardProps) {
  const percentage = Math.min(100, Math.round((value / maxValue) * 100))

  return (
    <Card className={cn("transition-all duration-300 hover:shadow-card-hover border-primary/10", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="rounded-full bg-primary/10 w-8 h-8 flex items-center justify-center">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {percentageChange !== undefined && (
          <div className="mt-2 flex items-center text-xs text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn("mr-1 h-3 w-3", percentageChange >= 0 ? "text-success" : "text-destructive")}
            >
              {percentageChange >= 0 ? <path d="m18 15-6-6-6 6" /> : <path d="m6 9 6 6 6-6" />}
            </svg>
            <span className={cn("font-medium", percentageChange >= 0 ? "text-success" : "text-destructive")}>
              {percentageChange >= 0 ? "+" : ""}
              {percentageChange}%
            </span>
            <span className="ml-1">from last month</span>
          </div>
        )}
        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{value.toLocaleString()}</span>
            <span>{maxValue.toLocaleString()}</span>
          </div>
          <Progress value={percentage} className="h-1.5" />
        </div>
      </CardContent>
    </Card>
  )
}
