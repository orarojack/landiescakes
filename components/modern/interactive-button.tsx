"use client"

import type React from "react"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface InteractiveButtonProps {
  children: React.ReactNode
  onClick?: () => void | Promise<void>
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost"
  size?: "sm" | "md" | "lg" | "xl"
  disabled?: boolean
  loading?: boolean
  ripple?: boolean
  glow?: boolean
  className?: string
}

export function InteractiveButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  ripple = true,
  glow = false,
  className,
}: InteractiveButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || isLoading || loading) return

    // Create ripple effect
    if (ripple) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const newRipple = { id: Date.now(), x, y }

      setRipples((prev) => [...prev, newRipple])

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
      }, 600)
    }

    if (onClick) {
      try {
        setIsLoading(true)
        await onClick()
      } finally {
        setIsLoading(false)
      }
    }
  }

  const variants = {
    primary: "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white",
    secondary: "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white",
    success: "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white",
    danger: "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300",
  }

  const sizes = {
    sm: "px-4 py-2 text-sm rounded-xl",
    md: "px-6 py-3 text-base rounded-2xl",
    lg: "px-8 py-4 text-lg rounded-2xl",
    xl: "px-10 py-5 text-xl rounded-3xl",
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading || loading}
      className={cn(
        "relative overflow-hidden transition-all duration-300 transform hover:scale-105 active:scale-95",
        "shadow-lg hover:shadow-xl disabled:hover:scale-100 disabled:opacity-50",
        variants[variant],
        sizes[size],
        glow && "shadow-2xl hover:shadow-orange-500/25",
        className,
      )}
    >
      {/* Ripple Effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}

      {/* Content */}
      <span className="relative flex items-center justify-center space-x-2">
        {(isLoading || loading) && <Loader2 className="h-4 w-4 animate-spin" />}
        <span>{children}</span>
      </span>

      {/* Glow Effect */}
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-pink-500/20 blur-xl -z-10 transition-opacity duration-300 opacity-0 hover:opacity-100" />
      )}
    </Button>
  )
}
