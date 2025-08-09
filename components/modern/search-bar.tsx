"use client"

import { useState } from "react"
import { Search, X, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  onFilter?: () => void
  suggestions?: string[]
  filters?: string[]
  onRemoveFilter?: (filter: string) => void
  className?: string
}

export function SearchBar({
  placeholder = "Search...",
  onSearch,
  onFilter,
  suggestions = [],
  filters = [],
  onRemoveFilter,
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleSearch = (value: string) => {
    setQuery(value)
    onSearch?.(value)
  }

  const clearSearch = () => {
    setQuery("")
    onSearch?.("")
    setShowSuggestions(false)
  }

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      {/* Search Input */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/30 shadow-xl">
          <div className="flex items-center">
            <Search className="absolute left-6 text-gray-400 h-6 w-6" />
            <Input
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder={placeholder}
              className="w-full pl-14 pr-20 py-5 border-0 bg-transparent text-lg placeholder:text-gray-400 focus:ring-0 rounded-3xl"
            />
            <div className="absolute right-2 top-2 flex items-center space-x-2">
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="h-10 w-10 rounded-2xl hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {onFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onFilter}
                  className="h-10 w-10 rounded-2xl hover:bg-gray-100"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 rounded-2xl shadow-lg px-6 py-2"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {filters.map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="bg-orange-100 text-orange-800 hover:bg-orange-200 rounded-full px-4 py-2 cursor-pointer"
              onClick={() => onRemoveFilter?.(filter)}
            >
              {filter}
              <X className="h-3 w-3 ml-2" />
            </Badge>
          ))}
        </div>
      )}

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-60 overflow-y-auto">
          {suggestions
            .filter((suggestion) => suggestion.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5)
            .map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  handleSearch(suggestion)
                  setShowSuggestions(false)
                }}
                className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
              >
                <div className="flex items-center space-x-3">
                  <Search className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700">{suggestion}</span>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  )
}
