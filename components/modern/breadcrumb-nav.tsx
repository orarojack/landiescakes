"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
  isActive?: boolean
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[]
  showHome?: boolean
  className?: string
}

export function BreadcrumbNav({ items, showHome = true, className }: BreadcrumbNavProps) {
  const allItems = showHome ? [{ label: "Home", href: "/" }, ...items] : items

  return (
    <nav className={cn("flex items-center space-x-2 text-sm", className)}>
      {allItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}

          {index === 0 && showHome && <Home className="h-4 w-4 text-gray-500 mr-1" />}

          {item.href && !item.isActive ? (
            <Link href={item.href} className="text-gray-600 hover:text-orange-500 transition-colors font-medium">
              {item.label}
            </Link>
          ) : (
            <span className={cn("font-medium", item.isActive ? "text-gray-900" : "text-gray-500")}>{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
