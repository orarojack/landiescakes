"use client"

import { cn } from "@/lib/utils"

interface SkeletonLoaderProps {
  variant?: "text" | "circular" | "rectangular" | "card" | "product"
  width?: string | number
  height?: string | number
  className?: string
  animate?: boolean
}

export function SkeletonLoader({
  variant = "rectangular",
  width,
  height,
  className,
  animate = true,
}: SkeletonLoaderProps) {
  const baseClasses = cn(
    "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]",
    animate && "animate-shimmer",
    className,
  )

  switch (variant) {
    case "text":
      return <div className={cn(baseClasses, "h-4 rounded-md", className)} style={{ width, height }} />

    case "circular":
      return (
        <div
          className={cn(baseClasses, "rounded-full", className)}
          style={{ width: width || 40, height: height || 40 }}
        />
      )

    case "rectangular":
      return <div className={cn(baseClasses, "rounded-lg", className)} style={{ width, height }} />

    case "card":
      return (
        <div className={cn("space-y-4 p-6 bg-white rounded-3xl shadow-lg", className)}>
          <div className={cn(baseClasses, "h-48 rounded-2xl")} />
          <div className="space-y-3">
            <div className={cn(baseClasses, "h-4 rounded-md w-3/4")} />
            <div className={cn(baseClasses, "h-4 rounded-md w-1/2")} />
            <div className={cn(baseClasses, "h-6 rounded-md w-1/4")} />
          </div>
        </div>
      )

    case "product":
      return (
        <div className={cn("space-y-4 p-6 bg-white rounded-3xl shadow-lg", className)}>
          <div className={cn(baseClasses, "h-64 rounded-2xl")} />
          <div className="space-y-3">
            <div className={cn(baseClasses, "h-3 rounded-full w-20")} />
            <div className={cn(baseClasses, "h-6 rounded-md w-full")} />
            <div className={cn(baseClasses, "h-4 rounded-md w-2/3")} />
            <div className="flex items-center space-x-2">
              <div className={cn(baseClasses, "h-4 w-16 rounded-full")} />
              <div className={cn(baseClasses, "h-4 w-24 rounded-md")} />
            </div>
            <div className={cn(baseClasses, "h-8 rounded-md w-1/3")} />
            <div className={cn(baseClasses, "h-12 rounded-2xl w-full")} />
          </div>
        </div>
      )

    default:
      return <div className={cn(baseClasses, "rounded-lg", className)} style={{ width, height }} />
  }
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonLoader key={index} variant="product" />
      ))}
    </div>
  )
}
