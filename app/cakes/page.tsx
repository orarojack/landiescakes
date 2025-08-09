"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart, Clock, MapPin, Truck, Eye, Search, Filter, X } from "lucide-react"
import { useCart } from "@/components/modern/cart-provider"
import { toast } from "sonner"
import { formatPriceKsh } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  stock: number
  averageRating: number
  reviewCount: number
  category: {
    id: string
    name: string
  }
  seller: {
    id: string
    businessName: string
    logo: string | null
  }
}

interface ProductsResponse {
  products: Product[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export default function CakesPage() {
  const { addToCart } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [categories, setCategories] = useState<any[]>([])
  const [sellers, setSellers] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [stock, setStock] = useState("all")
  const [minRating, setMinRating] = useState(0)
  const [sellerId, setSellerId] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchSellers()
  }, [])

  useEffect(() => {
    fetchProducts()
    // eslint-disable-next-line
  }, [searchQuery, selectedCategory, priceRange, stock, minRating, sellerId, sortBy, sortOrder, pagination.currentPage])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(Array.isArray(data.categories) ? data.categories : [])
      } else {
        setCategories([])
      }
    } catch {
      setCategories([])
    }
  }

  const fetchSellers = async () => {
    try {
      const response = await fetch("/api/sellers?all=1")
      if (response.ok) {
        const data = await response.json()
        setSellers(Array.isArray(data.sellers) ? data.sellers : [])
      } else {
        setSellers([])
      }
    } catch {
      setSellers([])
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: "12",
        search: searchQuery,
        category: selectedCategory,
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        stock,
        minRating: minRating.toString(),
        sellerId: sellerId === "all" ? "" : sellerId,
        sortBy,
        sortOrder,
      })
      const response = await fetch(`/api/products?${params}`)
      if (response.ok) {
        const data: ProductsResponse = await response.json()
        setProducts(data.products)
        setPagination(data.pagination)
      }
    } catch (error) {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    const result = addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "/placeholder.svg",
      seller: product.seller?.businessName || "Unknown Seller",
      inStock: product.stock > 0,
      freeShipping: true,
    })
    
    if (result.success) {
      toast.success(`${product.name} added to cart!`)
    } else {
      toast.error(result.message || "Failed to add item to cart")
    }
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setPriceRange([0, 10000])
    setStock("all")
    setMinRating(0)
    setSellerId("all")
    setSortBy("createdAt")
    setSortOrder("desc")
  }

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="group hover:shadow-2xl transition-all duration-700 border-0 shadow-lg overflow-hidden bg-white hover:-translate-y-2 rounded-3xl">
      <div className="relative aspect-square overflow-hidden rounded-t-3xl">
        <Image
          src={product.images[0] || "/placeholder.svg?height=400&width=400"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col space-y-1 sm:space-y-2">
          {product.stock === 0 ? (
            <Badge className="bg-red-500 text-white border-0 shadow-lg rounded-2xl px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm font-bold">
              Out of Stock
            </Badge>
          ) : product.stock < 10 ? (
            <Badge className="bg-orange-500 text-white border-0 shadow-lg rounded-2xl px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm font-bold">
              Low Stock
            </Badge>
          ) : null}
        </div>
        {/* Wishlist Button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/90 hover:bg-white text-gray-700 shadow-lg backdrop-blur-sm rounded-2xl h-8 w-8 sm:h-10 sm:w-10 opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        {/* Quick Add to Cart */}
        <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Button
            onClick={() => handleAddToCart(product)}
            disabled={product.stock === 0}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 text-xs sm:text-sm py-2 sm:py-3"
          >
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </div>
      <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-4">
        {/* Seller and Category */}
        <div className="flex items-center justify-between">
          <p className="text-xs sm:text-sm text-gray-500 font-semibold truncate">by {product.seller?.businessName || "Unknown Seller"}</p>
          <Badge variant="outline" className="rounded-full text-xs">
            {product.category?.name || "Uncategorized"}
          </Badge>
        </div>
        {/* Title */}
        <Link href={`/cakes/${product.id}`}>
          <h3 className="font-black text-lg sm:text-xl mb-2 text-gray-900 group-hover:text-orange-600 transition-colors cursor-pointer line-clamp-2">
            {product.name}
          </h3>
        </Link>
        {/* Seller Preview Option */}
        {product.seller?.id && (
          <Link href={`/seller/${product.seller.id}`} className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 hover:underline font-semibold mb-2">
            {product.seller.logo && (
              <Image
                src={product.seller.logo}
                alt={product.seller.businessName}
                width={24}
                height={24}
                className="rounded-full object-cover border border-gray-200 sm:w-7 sm:h-7"
              />
            )}
            <span className="truncate">{product.seller.businessName}</span>
            <span className="ml-1 sm:ml-2 hidden sm:inline">(View Seller)</span>
          </Link>
        )}
        {/* Description */}
        <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{product.description}</p>
        {/* Rating and Reviews */}
        <div className="flex items-center justify-between">
          <div className="flex items-center bg-yellow-50 rounded-full px-2 py-1 sm:px-3 sm:py-1">
            <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-xs sm:text-sm font-bold ml-1 text-gray-700">{Number(product.averageRating || 0).toFixed(1)}</span>
          </div>
          <span className="text-xs sm:text-sm text-gray-500 font-medium">({product.reviewCount} reviews)</span>
        </div>
        {/* Specs */}
        <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500">
          <div className="flex items-center">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">2-3 hours</span>
            <span className="sm:hidden">2-3h</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">Serves 8-10</span>
            <span className="sm:hidden">8-10</span>
          </div>
          <div className="flex items-center">
            <Truck className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden sm:inline">Free shipping</span>
            <span className="sm:hidden">Free</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-6 pt-0">
        {/* Price and Actions */}
        <div className="w-full space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xl sm:text-2xl font-black text-orange-600">{formatPriceKsh(product.price)}</span>
            <div className="text-right">
              <div className="text-xs sm:text-sm text-gray-500">Stock: {product.stock}</div>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Link href={`/cakes/${product.id}`} className="flex-1">
              <Button
                variant="outline"
                className="w-full border-2 border-orange-200 text-orange-600 hover:bg-orange-50 rounded-2xl py-2 sm:py-3 font-bold transition-all duration-300 bg-transparent text-xs sm:text-sm"
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">View Details</span>
                <span className="sm:hidden">View</span>
              </Button>
            </Link>
            <Button
              onClick={() => handleAddToCart(product)}
              disabled={product.stock === 0}
              className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 py-2 sm:py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
            >
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )

  // Add a handler for search input Enter key
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      fetchProducts()
    }
  }

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse rounded-3xl">
                <div className="aspect-square bg-gray-200 rounded-t-3xl" />
                <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4">
            Explore Our{" "}
            <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              Delicious
            </span>{" "}
            Cakes
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Discover handcrafted cakes made with love by local bakers. From birthday celebrations to wedding ceremonies,
            find the perfect cake for every occasion.
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-6">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button className="w-full bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-3xl py-4 text-lg shadow-lg">
                <Filter className="h-5 w-5 mr-2" />
                Filters & Search
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] sm:w-[400px] p-0">
              <SheetHeader className="p-6 border-b">
                <SheetTitle className="text-xl font-bold">Filters & Search</SheetTitle>
              </SheetHeader>
              <div className="p-6 overflow-y-auto h-full">
                {/* Mobile Search Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search for cakes..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setPagination(prev => ({ ...prev, currentPage: 1 }))
                      }}
                      className="pl-12 pr-4 py-4 text-base rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 bg-white/80 backdrop-blur-sm"
                    />
                  </div>
                </div>
                
                {/* Mobile Filters */}
                <div className="space-y-4">
                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="rounded-2xl border-2 focus:border-orange-500">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {(categories ?? []).map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">
                      Price Range: Ksh {priceRange[0]} - Ksh {priceRange[1]}
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={10000}
                      min={0}
                      step={10}
                      className="mt-4"
                    />
                  </div>
                  
                  {/* Stock Status */}
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Stock Status</label>
                    <Select value={stock} onValueChange={setStock}>
                      <SelectTrigger className="rounded-2xl border-2 focus:border-orange-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="in">In Stock</SelectItem>
                        <SelectItem value="out">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Minimum Rating */}
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Minimum Rating</label>
                    <Select value={minRating.toString()} onValueChange={v => setMinRating(Number(v))}>
                      <SelectTrigger className="rounded-2xl border-2 focus:border-orange-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any</SelectItem>
                        <SelectItem value="1">1+</SelectItem>
                        <SelectItem value="2">2+</SelectItem>
                        <SelectItem value="3">3+</SelectItem>
                        <SelectItem value="4">4+</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Seller Filter */}
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Seller</label>
                    <Select value={sellerId} onValueChange={setSellerId}>
                      <SelectTrigger className="rounded-2xl border-2 focus:border-orange-500">
                        <SelectValue placeholder="All Sellers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sellers</SelectItem>
                        {sellers.map((seller) => (
                          <SelectItem key={seller.id} value={seller.id}>{seller.businessName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Sort By */}
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="rounded-2xl border-2 focus:border-orange-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Newest First</SelectItem>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Sort Order */}
                  <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Sort Order</label>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger className="rounded-2xl border-2 focus:border-orange-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Descending</SelectItem>
                        <SelectItem value="asc">Ascending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Clear Filters */}
                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleClearFilters()
                      setIsFilterOpen(false)
                    }}
                    className="w-full rounded-2xl border-2 border-gray-200 hover:border-orange-500 hover:text-orange-600"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop Left Sidebar Filters */}
          <aside className="hidden lg:block lg:w-80 flex-shrink-0 z-10">
            <div className="mb-8">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
                <Input
                  placeholder="Search for cakes, flavors, occasions..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setPagination(prev => ({ ...prev, currentPage: 1 }))
                  }}
                  className="pl-16 pr-6 py-6 text-lg rounded-3xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 bg-white/80 backdrop-blur-sm shadow-lg"
                />
              </div>
            </div>
            {/* Filters Card */}
            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Category Filter */}
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-3 block">Category</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="rounded-2xl border-2 focus:border-orange-500">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {(categories ?? []).map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Price Range */}
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-3 block">
                        Price Range: Ksh {priceRange[0]} - Ksh {priceRange[1]}
                      </label>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={10000}
                        min={0}
                        step={10}
                        className="mt-4"
                      />
                    </div>
                    {/* Stock Status */}
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-3 block">Stock Status</label>
                      <Select value={stock} onValueChange={setStock}>
                        <SelectTrigger className="rounded-2xl border-2 focus:border-orange-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="in">In Stock</SelectItem>
                          <SelectItem value="out">Out of Stock</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Minimum Rating */}
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-3 block">Minimum Rating</label>
                      <Select value={minRating.toString()} onValueChange={v => setMinRating(Number(v))}>
                        <SelectTrigger className="rounded-2xl border-2 focus:border-orange-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Any</SelectItem>
                          <SelectItem value="1">1+</SelectItem>
                          <SelectItem value="2">2+</SelectItem>
                          <SelectItem value="3">3+</SelectItem>
                          <SelectItem value="4">4+</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Seller Filter */}
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-3 block">Seller</label>
                      <Select value={sellerId} onValueChange={setSellerId}>
                        <SelectTrigger className="rounded-2xl border-2 focus:border-orange-500">
                          <SelectValue placeholder="All Sellers" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sellers</SelectItem>
                          {sellers.map((seller) => (
                            <SelectItem key={seller.id} value={seller.id}>{seller.businessName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Sort By */}
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-3 block">Sort By</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="rounded-2xl border-2 focus:border-orange-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="createdAt">Newest First</SelectItem>
                          <SelectItem value="price">Price</SelectItem>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="rating">Rating</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {/* Sort Order */}
                    <div>
                      <label className="text-sm font-bold text-gray-700 mb-3 block">Sort Order</label>
                      <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger className="rounded-2xl border-2 focus:border-orange-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">Descending</SelectItem>
                          <SelectItem value="asc">Ascending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Clear Filters */}
                  <div className="mt-6 flex justify-center">
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      className="rounded-2xl border-2 border-gray-200 hover:border-orange-500 hover:text-orange-600"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </aside>
          
          {/* Products Grid/List */}
          <main className="flex-1">
            <div className="space-y-6 lg:space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </main>
        </div>
        
        {/* No Results */}
        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No cakes found</h3>
            <p className="text-gray-600 mb-6 px-4">Try adjusting your search criteria</p>
          </div>
        )}
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center space-x-2 mt-8 sm:mt-12">
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
              disabled={!pagination.hasPreviousPage}
              className="rounded-2xl px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
            >
              Previous
            </Button>
            <span className="flex items-center px-3 sm:px-4 text-gray-600 text-sm sm:text-base">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
              disabled={!pagination.hasNextPage}
              className="rounded-2xl px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
