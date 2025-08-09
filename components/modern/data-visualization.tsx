"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatPriceKsh } from "@/lib/utils"

interface ChartData {
  label: string
  value: number
  color: string
}

interface SimpleBarChartProps {
  data: ChartData[]
  title: string
  className?: string
}

export function SimpleBarChart({ data, title, className }: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <Card className={cn("border-0 shadow-xl rounded-3xl", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className="text-sm font-bold text-gray-900">KSh {Number(item.value || 0).toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface DonutChartProps {
  data: ChartData[]
  title: string
  centerValue: number
  centerLabel: string
  className?: string
}

export function DonutChart({ data, title, centerValue, centerLabel, className }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className={cn("border-0 shadow-xl rounded-3xl", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-black text-gray-900">{centerValue}</div>
                <div className="text-sm text-gray-600">{centerLabel}</div>
              </div>
            </div>
            {/* Simple representation - in a real app, you'd use a proper chart library */}
            <div className="w-full h-full rounded-full border-8 border-gray-200"></div>
          </div>
        </div>
        {/* REMOVE DonutChart built-in legend below */}
        {/*
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">{item.value}%</div>
              </div>
            </div>
          ))}
        </div>
        */}
      </CardContent>
    </Card>
  )
}

interface MetricCardProps {
  title: string
  value: number
  format: "currency" | "percentage" | "number"
  icon: React.ReactNode
  trend: "up" | "down"
  previousValue: number
}

export function MetricCard({ title, value, format, icon, trend, previousValue }: MetricCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case "currency":
        return formatPriceKsh(val)
      case "percentage":
        return `${Number(val || 0).toFixed(1)}%`
      default:
        return Number(val || 0).toFixed(1)
    }
  }

  const change = ((value - previousValue) / previousValue) * 100

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-gray-600">{icon}</div>
          <div className={`text-sm font-bold ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
            {trend === "up" ? "↗" : "↘"} {Number(Math.abs(change) || 0).toFixed(1)}%
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-black text-gray-900">{formatValue(value)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
