import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { formatPriceKsh } from "@/lib/utils"
import { Star } from "lucide-react"

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

interface SimpleProductCardProps {
  product: Product
}

export function SimpleProductCard({ product }: SimpleProductCardProps) {
  return (
    <div className="group hover:shadow-2xl transition-all duration-700 border-0 shadow-lg overflow-hidden bg-white hover:-translate-y-2 rounded-3xl">
      <div className="relative overflow-hidden rounded-t-3xl">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={600}
          height={400}
          className="object-cover group-hover:scale-110 transition-transform duration-700 w-full h-64"
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

        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge className="bg-red-500 text-white text-lg px-6 py-2 rounded-2xl">Out of Stock</Badge>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Seller */}
        <p className="text-sm text-gray-500 font-semibold mb-3">by {product.seller}</p>

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

        {/* Price */}
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl font-black text-orange-600">{formatPriceKsh(product.price)}</span>
          {product.originalPrice && (
            <span className="text-lg text-gray-500 line-through">{formatPriceKsh(product.originalPrice)}</span>
          )}
        </div>

        {/* View Details Link */}
        <Link
          href={`/cakes/${product.id}`}
          className="block w-full text-center bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 py-3 font-bold"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}
