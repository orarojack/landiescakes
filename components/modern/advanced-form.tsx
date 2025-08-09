"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Check, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  name: string
  type?: "text" | "email" | "password" | "textarea" | "tel" | "url"
  placeholder?: string
  required?: boolean
  validation?: (value: string) => string | null
  className?: string
}

interface AdvancedFormProps {
  fields: FormFieldProps[]
  onSubmit: (data: Record<string, string>) => void | Promise<void>
  submitLabel?: string
  className?: string
}

export function AdvancedForm({ fields, onSubmit, submitLabel = "Submit", className }: AdvancedFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateField = (name: string, value: string) => {
    const field = fields.find((f) => f.name === name)
    if (!field) return null

    if (field.required && !value.trim()) {
      return `${field.label} is required`
    }

    if (field.validation) {
      return field.validation(value)
    }

    // Built-in validations
    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return "Please enter a valid email address"
      }
    }

    return null
  }

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (touched[name]) {
      const error = validateField(name, value)
      setErrors((prev) => ({ ...prev, [name]: error || "" }))
    }
  }

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    const error = validateField(name, formData[name] || "")
    setErrors((prev) => ({ ...prev, [name]: error || "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const newErrors: Record<string, string> = {}
    const newTouched: Record<string, boolean> = {}

    fields.forEach((field) => {
      newTouched[field.name] = true
      const error = validateField(field.name, formData[field.name] || "")
      if (error) {
        newErrors[field.name] = error
      }
    })

    setTouched(newTouched)
    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      try {
        setIsSubmitting(true)
        await onSubmit(formData)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const togglePasswordVisibility = (name: string) => {
    setShowPasswords((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const getFieldStatus = (name: string) => {
    if (!touched[name]) return "default"
    if (errors[name]) return "error"
    return "success"
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {fields.map((field) => {
        const status = getFieldStatus(field.name)
        const value = formData[field.name] || ""
        const error = errors[field.name]

        return (
          <div key={field.name} className="space-y-2">
            <Label
              htmlFor={field.name}
              className={cn(
                "text-sm font-semibold transition-colors",
                status === "error" ? "text-red-600" : status === "success" ? "text-green-600" : "text-gray-700",
              )}
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            <div className="relative">
              {field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  onBlur={() => handleBlur(field.name)}
                  className={cn(
                    "transition-all duration-300 rounded-2xl border-2 focus:ring-0 focus:ring-offset-0",
                    status === "error"
                      ? "border-red-300 focus:border-red-500"
                      : status === "success"
                        ? "border-green-300 focus:border-green-500"
                        : "border-gray-200 focus:border-orange-500",
                  )}
                  rows={4}
                />
              ) : (
                <Input
                  id={field.name}
                  type={field.type === "password" && showPasswords[field.name] ? "text" : field.type}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  onBlur={() => handleBlur(field.name)}
                  className={cn(
                    "transition-all duration-300 rounded-2xl border-2 focus:ring-0 focus:ring-offset-0 pr-12",
                    status === "error"
                      ? "border-red-300 focus:border-red-500"
                      : status === "success"
                        ? "border-green-300 focus:border-green-500"
                        : "border-gray-200 focus:border-orange-500",
                  )}
                />
              )}

              {/* Field Status Icon */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                {field.type === "password" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePasswordVisibility(field.name)}
                    className="h-8 w-8 p-0 hover:bg-transparent"
                  >
                    {showPasswords[field.name] ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                )}

                {touched[field.name] && (
                  <>
                    {status === "success" && <Check className="h-5 w-5 text-green-500" />}
                    {status === "error" && <AlertCircle className="h-5 w-5 text-red-500" />}
                  </>
                )}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 flex items-center space-x-1 animate-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </p>
            )}
          </div>
        )
      })}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
      >
        {isSubmitting ? "Submitting..." : submitLabel}
      </Button>
    </form>
  )
}
