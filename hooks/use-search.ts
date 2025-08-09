"use client"

import { useState, useEffect, useMemo } from "react"
import { useDebounce } from "./use-debounce"

// Mock data for cakes
const mockCakes = [
  {
    id: "1",
    name: "Chocolate Truffle Delight",
    price: 4599,
    originalPrice: 5299,
    rating: 4.8,
    reviews: 124,
    seller: "Sweet Dreams Bakery",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=500&fit=crop&crop=center",
    badge: "Best Seller",
    discount: 13,
    category: "chocolate",
    description: "Rich chocolate cake with truffle filling and ganache coating",
    preparationTime: "2-3 hours",
    serves: "8-10 people",
    isNew: false,
    isHot: true,
    inStock: true,
    freeShipping: true,
  },
  {
    id: "2",
    name: "Vanilla Bean Wedding Cake",
    price: 8999,
    rating: 4.9,
    reviews: 89,
    seller: "Elegant Cakes Co.",
    image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&h=500&fit=crop&crop=center",
    badge: "Premium",
    category: "wedding",
    description: "Elegant 3-tier vanilla bean cake with buttercream roses",
    preparationTime: "24 hours",
    serves: "50+ people",
    isNew: true,
    isHot: false,
    inStock: true,
    freeShipping: true,
  },
  {
    id: "3",
    name: "Red Velvet Classic",
    price: 3299,
    rating: 4.7,
    reviews: 156,
    seller: "Artisan Bakers",
    image: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=600&h=500&fit=crop&crop=center",
    badge: "Popular",
    category: "birthday",
    description: "Traditional red velvet with cream cheese frosting",
    preparationTime: "1-2 hours",
    serves: "6-8 people",
    isNew: false,
    isHot: true,
    inStock: true,
    freeShipping: false,
  },
  {
    id: "4",
    name: "Strawberry Shortcake",
    price: 2899,
    rating: 4.6,
    reviews: 98,
    seller: "Fresh Berry Cakes",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=500&fit=crop&crop=center",
    badge: "Seasonal",
    category: "fruit",
    description: "Fresh strawberries with whipped cream and sponge layers",
    preparationTime: "1 hour",
    serves: "4-6 people",
    isNew: true,
    isHot: false,
    inStock: true,
    freeShipping: false,
  },
  {
    id: "5",
    name: "Lemon Drizzle Cake",
    price: 2499,
    rating: 4.5,
    reviews: 67,
    seller: "Citrus Delights",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&h=500&fit=crop&crop=center",
    category: "fruit",
    description: "Zesty lemon cake with tangy drizzle glaze",
    preparationTime: "45 minutes",
    serves: "6-8 people",
    isNew: false,
    isHot: false,
    inStock: true,
    freeShipping: false,
  },
  {
    id: "6",
    name: "Black Forest Gateau",
    price: 3899,
    rating: 4.7,
    reviews: 112,
    seller: "European Bakehouse",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=500&fit=crop&crop=center",
    badge: "Traditional",
    category: "chocolate",
    description: "Classic German cake with cherries and whipped cream",
    preparationTime: "3-4 hours",
    serves: "8-10 people",
    isNew: false,
    isHot: false,
    inStock: true,
    freeShipping: true,
  },
  {
    id: "7",
    name: "Carrot Cake Supreme",
    price: 2999,
    rating: 4.6,
    reviews: 89,
    seller: "Healthy Treats Co.",
    image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=600&h=500&fit=crop&crop=center",
    category: "birthday",
    description: "Moist carrot cake with cream cheese frosting and walnuts",
    preparationTime: "2 hours",
    serves: "8-10 people",
    isNew: true,
    isHot: false,
    inStock: true,
    freeShipping: false,
  },
  {
    id: "8",
    name: "Tiramisu Cake",
    price: 4299,
    rating: 4.8,
    reviews: 134,
    seller: "Italian Delicacies",
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&h=500&fit=crop&crop=center",
    badge: "Gourmet",
    category: "custom",
    description: "Coffee-soaked layers with mascarpone and cocoa",
    preparationTime: "4+ hours",
    serves: "6-8 people",
    isNew: false,
    isHot: true,
    inStock: true,
    freeShipping: true,
  },
]

export function useSearch() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000])
  const [sortBy, setSortBy] = useState("popular")
  const [isLoading, setIsLoading] = useState(false)

  const debouncedQuery = useDebounce(query, 300)

  const results = useMemo(() => {
    let filtered = [...mockCakes]

    // Filter by search query
    if (debouncedQuery) {
      filtered = filtered.filter(
        (cake) =>
          cake.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          cake.description.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          cake.seller.toLowerCase().includes(debouncedQuery.toLowerCase()),
      )
    }

    // Filter by category
    if (category && category !== "all") {
      filtered = filtered.filter((cake) => cake.category === category)
    }

    // Filter by price range
    filtered = filtered.filter((cake) => cake.price >= priceRange[0] && cake.price <= priceRange[1])

    // Sort results
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
      case "popular":
      default:
        filtered.sort((a, b) => b.reviews - a.reviews)
        break
    }

    return filtered
  }, [debouncedQuery, category, priceRange, sortBy])

  const resultCount = results.length

  // Simulate loading state
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [debouncedQuery, category, priceRange, sortBy])

  const clearFilters = () => {
    setQuery("")
    setCategory("all")
    setPriceRange([0, 20000])
    setSortBy("popular")
  }

  return {
    query,
    setQuery,
    category,
    setCategory,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    results,
    isLoading,
    resultCount,
    clearFilters,
  }
}
