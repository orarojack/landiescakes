"use client"

import { useState } from "react"
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FilterOption {
  id: string
  label: string
  count?: number
}

interface FilterGroup {
  id: string
  title: string
  options: FilterOption[]
  type: "checkbox" | "range" | "rating"
}

interface FilterSidebarProps {
  isOpen: boolean
  onClose: () => void
  filterGroups: FilterGroup[]
  priceRange: [number, number]
  maxPrice: number
  onPriceChange: (range: [number, number]) => void
  selectedFilters: Record<string, string[]>
  onFilterChange: (groupId: string, optionId: string, checked: boolean) => void
  onClearAll: () => void
  className?: string
}

export function FilterSidebar({
  isOpen,
  onClose,
  filterGroups,
  priceRange,
  maxPrice,
  onPriceChange,
  selectedFilters,
  onFilterChange,
  onClearAll,
  className,
}: FilterSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(filterGroups.map((group) => group.id)))

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
  }

  const totalActiveFilters = Object.values(selectedFilters).reduce((total, filters) => total + filters.length, 0)

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:shadow-lg lg:rounded-3xl",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className,
      )}
    >
      <Card className="h-full border-0 rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-pink-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Filters</CardTitle>
                {totalActiveFilters > 0 && <p className="text-sm text-gray-600">{totalActiveFilters} active</p>}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {totalActiveFilters > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl"
                >
                  Clear All
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden rounded-xl">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 h-full overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Price Range */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-lg text-gray-900">Price Range</h4>
                <Badge variant="outline" className="rounded-full">
                  KSh {priceRange[0]} - KSh {priceRange[1]}
                </Badge>
              </div>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  onValueChange={(value) => onPriceChange(value as [number, number])}
                  max={maxPrice}
                  step={5}
                  className="mb-4"
                />
                <div className="flex justify-between text-sm text-gray-600 font-medium">
                  <span>KSh {priceRange[0]}</span>
                  <span>KSh {priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Filter Groups */}
            {filterGroups.map((group) => (
              <div key={group.id} className="space-y-4">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h4 className="font-bold text-lg text-gray-900">{group.title}</h4>
                  <div className="flex items-center space-x-2">
                    {selectedFilters[group.id]?.length > 0 && (
                      <Badge className="bg-orange-100 text-orange-800 rounded-full text-xs">
                        {selectedFilters[group.id].length}
                      </Badge>
                    )}
                    {expandedGroups.has(group.id) ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </button>

                {expandedGroups.has(group.id) && (
                  <div className="space-y-3 pl-2">
                    {group.options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={`${group.id}-${option.id}`}
                          checked={selectedFilters[group.id]?.includes(option.id) || false}
                          onCheckedChange={(checked) => onFilterChange(group.id, option.id, checked as boolean)}
                          className="rounded-lg"
                        />
                        <label
                          htmlFor={`${group.id}-${option.id}`}
                          className="flex-1 text-gray-700 cursor-pointer font-medium"
                        >
                          <div className="flex items-center justify-between">
                            <span>{option.label}</span>
                            {option.count && <span className="text-sm text-gray-500">({option.count})</span>}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Apply Filters Button */}
          <div className="p-6 border-t bg-gray-50">
            <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl py-4 text-lg font-bold shadow-lg">
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
