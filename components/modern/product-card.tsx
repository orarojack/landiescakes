"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPriceKsh } from "@/lib/utils"
import { Star, Heart, ShoppingCart, Clock, MapPin, Truck, Eye } from "lucide-react"
import { useCart } from "@/components/modern/cart-provider"
import { useToast } from "@/components/providers/toast-provider"

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  seller: string
  image: string
  badge?: string
  discount?: number
  category: string
  description: string
  preparationTime: string
  serves: string
  isNew?: boolean
  isHot?: boolean
  inStock: boolean
  freeShipping?: boolean
}

interface ProductCardProps {
  product: Product
  viewMode?: "grid" | "list"
  isInWishlist?: boolean
}

export function ProductCard({ product, viewMode = "grid", isInWishlist = false }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [wishlistState, setWishlistState] = useState(isInWishlist)
  const { addToCart } = useCart()
  const toast = useToast()

  const handleAddToCart = async () => {
    setIsLoading(true)
    const result = addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      seller: product.seller,
      inStock: product.inStock,
      freeShipping: product.freeShipping,
    })
    
    if (result.success) {
      toast.success(`${product.name} added to cart!`)
    } else {
      toast.error(result.message || "Failed to add item to cart")
    }
    setIsLoading(false)
  }

  const handleToggleWishlist = () => {
    setWishlistState(!wishlistState)
    // Here you would typically dispatch to a wishlist context or state management
  }

  return (
    <Card
      className={`group hover:shadow-2xl transition-all duration-700 border-0 shadow-lg overflow-hidden bg-white hover:-translate-y-2 rounded-3xl ${
        viewMode === "list" ? "flex" : ""
      }`}
    >
      <CardContent className={`p-0 ${viewMode === "list" ? "flex w-full" : ""}`}>
        <div className={`relative overflow-hidden ${viewMode === "list" ? "w-80 flex-shrink-0" : "rounded-t-3xl"}`}>
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={600}
            height={400}
            className={`object-cover group-hover:scale-110 transition-transform duration-700 ${
              viewMode === "list" ? "w-full h-full" : "w-full h-64"
            }`}
          />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col space-y-2">
            {product.badge && (
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 shadow-lg rounded-2xl px-3 py-1 font-bold">
                {product.badge}
              </Badge>
            )}
            {product.isNew && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg rounded-2xl px-3 py-1 font-bold">
                New
              </Badge>
            )}
            {product.isHot && (
              <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg rounded-2xl px-3 py-1 font-bold animate-pulse">
                🔥 Hot
              </Badge>
            )}
            {product.discount && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg rounded-2xl px-3 py-1 font-bold">
                -{product.discount}%
              </Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <Button
            size="icon"
            variant="ghost"
            onClick={handleToggleWishlist}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-700 shadow-lg backdrop-blur-sm rounded-2xl h-12 w-12 opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <Heart className={`h-5 w-5 transition-colors ${wishlistState ? "fill-red-500 text-red-500" : ""}`} />
          </Button>

          {/* Quick Actions */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Link href={`/cakes/${product.id}`}>
              <Button
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl shadow-lg"
              >
                <Eye className="h-4 w-4 mr-2" />
                Quick View
              </Button>
            </Link>
          </div>

          {/* Stock Status */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge className="bg-red-500 text-white text-lg px-6 py-2 rounded-2xl">Out of Stock</Badge>
            </div>
          )}
        </div>

        <div className={`p-6 ${viewMode === "list" ? "flex-1 flex flex-col justify-between" : ""}`}>
          <div>
            {/* Seller */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 font-semibold">by {product.seller}</p>
              {product.freeShipping && (
                <div className="flex items-center text-green-600 text-xs font-bold">
                  <Truck className="h-3 w-3 mr-1" />
                  Free Shipping
                </div>
              )}
            </div>

            {/* Title */}
            <Link href={`/cakes/${product.id}`}>
              <h3 className="font-black text-xl mb-3 text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 cursor-pointer">
                {product.name}
              </h3>
            </Link>

            {/* Description */}
            <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>

            {/* Rating and Reviews */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center bg-yellow-50 rounded-full px-3 py-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-bold ml-1 text-gray-700">{product.rating}</span>
              </div>
              <span className="text-sm text-gray-500 font-medium">({product.reviews} reviews)</span>
            </div>

            {/* Specs */}
            <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {product.preparationTime}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {product.serves}
              </div>
            </div>
          </div>

          {/* Price and Actions */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-black text-orange-600">{formatPriceKsh(product.price)}</span>
              {product.originalPrice && (
                <span className="text-lg text-gray-500 line-through">{formatPriceKsh(product.originalPrice)}</span>
              )}
            </div>

            <div className={`flex gap-3 ${viewMode === "list" ? "flex-row" : "flex-col"}`}>
              <Link href={`/cakes/${product.id}`} className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-2 border-orange-200 text-orange-600 hover:bg-orange-50 rounded-2xl py-3 font-bold transition-all duration-300"
                >
                  View Details
                </Button>
              </Link>
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock || isLoading}
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {isLoading ? "Adding..." : product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
