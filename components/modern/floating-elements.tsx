"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface FloatingElement {
  id: string
  icon: string
  size: number
  color: string
  duration: number
  delay: number
}

interface FloatingElementsProps {
  count?: number
  className?: string
}

export function FloatingElements({ count = 6, className }: FloatingElementsProps) {
  const [elements, setElements] = useState<FloatingElement[]>([])

  useEffect(() => {
    const icons = ["🎂", "🧁", "🍰", "🎉", "✨", "💖", "🌟", "🎈"]
    const colors = [
      "text-orange-400",
      "text-pink-400",
      "text-purple-400",
      "text-blue-400",
      "text-green-400",
      "text-yellow-400",
    ]

    const newElements = Array.from({ length: count }, (_, i) => ({
      id: `floating-${i}`,
      icon: icons[Math.floor(Math.random() * icons.length)],
      size: Math.random() * 20 + 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }))

    setElements(newElements)
  }, [count])

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {elements.map((element) => (
        <div
          key={element.id}
          className={cn("absolute animate-float opacity-20 hover:opacity-40 transition-opacity", element.color)}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${element.size}px`,
            animationDuration: `${element.duration}s`,
            animationDelay: `${element.delay}s`,
          }}
        >
          {element.icon}
        </div>
      ))}
    </div>
  )
}
