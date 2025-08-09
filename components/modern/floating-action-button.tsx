"use client"

import type React from "react"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FloatingAction {
  id: string
  icon: React.ReactNode
  label: string
  onClick: () => void
  color?: string
}

interface FloatingActionButtonProps {
  actions: FloatingAction[]
  className?: string
}

export function FloatingActionButton({ actions, className }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOpen = () => setIsOpen(!isOpen)

  return (
    <div className={cn("fixed bottom-8 right-8 z-50", className)}>
      {/* Action Items */}
      <div className="flex flex-col-reverse items-end space-y-reverse space-y-4 mb-4">
        {actions.map((action, index) => (
          <div
            key={action.id}
            className={cn(
              "flex items-center space-x-4 transition-all duration-500 transform",
              isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-75 pointer-events-none",
            )}
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : `${(actions.length - index - 1) * 50}ms`,
            }}
          >
            {/* Label */}
            <div className="bg-black/80 backdrop-blur-xl text-white px-4 py-2 rounded-2xl text-sm font-medium shadow-2xl border border-white/10">
              {action.label}
            </div>

            {/* Action Button */}
            <Button
              size="icon"
              onClick={action.onClick}
              className={cn(
                "h-14 w-14 rounded-full shadow-2xl border-2 border-white/20 backdrop-blur-xl transition-all duration-300 hover:scale-110",
                action.color || "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
              )}
            >
              {action.icon}
            </Button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <Button
        size="icon"
        onClick={toggleOpen}
        className={cn(
          "h-16 w-16 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-110",
          "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600",
          "hover:from-orange-600 hover:via-pink-600 hover:to-purple-700",
          "border-4 border-white/20 backdrop-blur-xl",
          isOpen && "rotate-45",
        )}
      >
        {isOpen ? <X className="h-8 w-8 text-white" /> : <Plus className="h-8 w-8 text-white" />}
      </Button>

      {/* Ripple Effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-1000",
          "bg-gradient-to-r from-orange-500/20 via-pink-500/20 to-purple-600/20",
          isOpen ? "scale-150 opacity-0" : "scale-100 opacity-100",
        )}
      />
    </div>
  )
}
