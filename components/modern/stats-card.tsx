import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  gradient: string
  bgColor: string
  textColor: string
  change?: string
  changeType?: "positive" | "negative"
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  gradient,
  bgColor,
  textColor,
  change,
  changeType,
}: StatsCardProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-black text-gray-900">{value}</p>
            {change && (
              <p
                className={cn(
                  "text-sm font-medium mt-1",
                  changeType === "positive" ? "text-green-600" : "text-red-600",
                )}
              >
                {change}
              </p>
            )}
          </div>
          <div className={cn("p-4 rounded-2xl", bgColor)}>
            <Icon className={cn("h-8 w-8", textColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
