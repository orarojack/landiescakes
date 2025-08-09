"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, ShoppingCart, Eye, Star, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface MorphingCardProps {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  seller: string
  category: string
  preparationTime?: string
  serves?: string
  isNew?: boolean
  discount?: number
  className?: string
}

export function MorphingCard({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviews,
  seller,
  category,
  preparationTime,
  serves,
  isNew,
  discount,
  className,
}: MorphingCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  return (
    <div
      className={cn("group relative overflow-hidden transition-all duration-700 transform hover:scale-105", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-3xl blur-xl" />

      {/* Main Card */}
      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl overflow-hidden">
        {/* Image Section */}
        <div className="relative h-64 overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className={cn(
              "object-cover transition-all duration-700",
              isHovered ? "scale-125 rotate-3" : "scale-100 rotate-0",
            )}
          />

          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex flex-col space-y-2">
            {isNew && (
              <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-lg rounded-full px-3 py-1 animate-pulse">
                NEW
              </Badge>
            )}
            {discount && (
              <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg rounded-full px-3 py-1">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Morphing Action Buttons */}
          <div
            className={cn(
              "absolute top-4 right-4 flex flex-col space-y-3 transition-all duration-500",
              isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8",
            )}
          >
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsLiked(!isLiked)}
              className={cn(
                "bg-white/90 backdrop-blur-sm shadow-xl rounded-full h-12 w-12 transition-all duration-300",
                isLiked ? "text-red-500 scale-110" : "text-gray-700 hover:scale-105",
              )}
            >
              <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
            </Button>

            <Button
              size="icon"
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-xl rounded-full h-12 w-12 transition-all duration-300 hover:scale-105"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="bg-white/90 backdrop-blur-sm text-gray-700 shadow-xl rounded-full h-12 w-12 transition-all duration-300 hover:scale-105"
            >
              <Eye className="h-5 w-5" />
            </Button>
          </div>

          {/* Gradient Overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-500",
              isHovered ? "opacity-100" : "opacity-0",
            )}
          />
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Category */}
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-semibold">
            {category}
          </Badge>

          {/* Title */}
          <h3 className="font-bold text-xl text-gray-900 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-500">
            {name}
          </h3>

          {/* Seller */}
          <p className="text-gray-600 font-medium">by {seller}</p>

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-yellow-50 rounded-full px-3 py-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 font-bold text-gray-700">{rating}</span>
            </div>
            <span className="text-gray-500 text-sm">({reviews} reviews)</span>
          </div>

          {/* Additional Info */}
          {(preparationTime || serves) && (
            <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 rounded-2xl p-3">
              {preparationTime && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{preparationTime}</span>
                </div>
              )}
              {serves && (
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{serves}</span>
                </div>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-black bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                KSh {price.toLocaleString()}
              </span>
              {originalPrice && (
                <span className="text-lg text-gray-500 line-through font-medium">KSh {originalPrice.toLocaleString()}</span>
              )}
            </div>
          </div>

          {/* Morphing CTA Button */}
          <Button
            className={cn(
              "w-full transition-all duration-500 rounded-2xl py-3 font-bold text-lg shadow-lg",
              isHovered
                ? "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 scale-105"
                : "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black",
            )}
          >
            {isHovered ? "Add to Cart" : "View Details"}
          </Button>
        </div>
      </div>
    </div>
  )
}
