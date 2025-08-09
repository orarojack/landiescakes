"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  blur?: "sm" | "md" | "lg" | "xl"
  opacity?: number
  border?: boolean
  shadow?: "sm" | "md" | "lg" | "xl" | "2xl"
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"
  gradient?: boolean
}

export function GlassCard({
  children,
  className,
  blur = "xl",
  opacity = 80,
  border = true,
  shadow = "2xl",
  rounded = "3xl",
  gradient = false,
}: GlassCardProps) {
  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  }

  const shadowClasses = {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
    "2xl": "shadow-2xl",
  }

  const roundedClasses = {
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        blurClasses[blur],
        shadowClasses[shadow],
        roundedClasses[rounded],
        border && "border border-white/20",
        gradient ? "bg-gradient-to-br from-white/20 via-white/10 to-white/5" : `bg-white/${opacity}`,
        className,
      )}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-orange-500/10 pointer-events-none" />
      )}
      {children}
    </div>
  )
}
