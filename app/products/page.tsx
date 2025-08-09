"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ShoppingCart, User, Heart, Menu, Filter, Star, Grid3X3, List, X } from "lucide-react"

export default function ProductsPage() {
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 200])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedRatings, setSelectedRatings] = useState<string[]>([])

  const products = [
    {
      id: 1,
      name: "Premium Chocolate Wedding Cake - 3 Tier",
      price: 125.99,
      originalPrice: 149.99,
      image: "/placeholder.svg?height=250&width=250",
      rating: 4.9,
      reviews: 124,
      seller: "Elite Cakes Co.",
      category: "Wedding Cakes",
      badge: "Premium",
      freeShipping: true,
      discount: 16,
    },
    {
      id: 2,
      name: "Chocolate Truffle Birthday Cake",
      price: 45.99,
      originalPrice: 55.99,
      image: "/placeholder.svg?height=250&width=250",
      rating: 4.8,
      reviews: 89,
      seller: "Sweet Dreams Bakery",
      category: "Birthday Cakes",
      badge: "Best Seller",
      freeShipping: true,
      discount: 18,
    },
    {
      id: 3,
      name: "Custom Photo Cake - Edible Print",
      price: 38.99,
      image: "/placeholder.svg?height=250&width=250",
      rating: 4.7,
      reviews: 156,
      seller: "Photo Perfect Cakes",
      category: "Custom Cakes",
      badge: "Custom",
      freeShipping: false,
    },
    {
      id: 4,
      name: "Strawberry Shortcake Deluxe",
      price: 35.99,
      originalPrice: 42.99,
      image: "/placeholder.svg?height=250&width=250",
      rating: 4.6,
      reviews: 98,
      seller: "Fresh Berry Cakes",
      category: "Fruit Cakes",
      freeShipping: true,
      discount: 16,
    },
    {
      id: 5,
      name: "Red Velvet Layer Cake",
      price: 32.99,
      originalPrice: 39.99,
      image: "/placeholder.svg?height=250&width=250",
      rating: 4.5,
      reviews: 203,
      seller: "Classic Bakehouse",
      category: "Birthday Cakes",
      freeShipping: true,
      discount: 18,
    },
    {
      id: 6,
      name: "Vanilla Bean Cupcake Set (12pcs)",
      price: 24.99,
      image: "/placeholder.svg?height=250&width=250",
      rating: 4.4,
      reviews: 67,
      seller: "Mini Delights",
      category: "Cupcakes",
      freeShipping: false,
    },
    {
      id: 7,
      name: "Black Forest Gateau",
      price: 48.99,
      originalPrice: 58.99,
      image: "/placeholder.svg?height=250&width=250",
      rating: 4.7,
      reviews: 112,
      seller: "European Bakehouse",
      category: "Chocolate Cakes",
      badge: "Traditional",
      freeShipping: true,
      discount: 17,
    },
    {
      id: 8,
      name: "Lemon Drizzle Cake",
      price: 28.99,
      image: "/placeholder.svg?height=250&width=250",
      rating: 4.3,
      reviews: 89,
      seller: "Citrus Delights",
      category: "Fruit Cakes",
      freeShipping: false,
    },
  ]

  const categories = [
    "Birthday Cakes",
    "Wedding Cakes",
    "Custom Cakes",
    "Cupcakes",
    "Chocolate Cakes",
    "Fruit Cakes",
    "Cheesecakes",
    "Vegan Cakes",
  ]

  const ratings = ["4 & above", "3 & above", "2 & above", "1 & above"]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Same as homepage */}
      <div className="bg-orange-500 text-white text-center py-2 text-sm">
        <span>🎉 Free delivery on orders above KSh 5,000 | Call us: +254-700-123-456</span>
      </div>

      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3 border-b">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                <span className="text-white font-bold">🎂</span>
              </div>
              <span className="text-2xl font-bold text-orange-500">LandyCakes</span>
            </Link>

            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Input
                  placeholder="Search for cakes, bakeries, occasions..."
                  className="w-full pl-4 pr-12 py-3 border-2 border-orange-200 focus:border-orange-500 rounded-lg"
                />
                <Button size="sm" className="absolute right-1 top-1 bg-orange-500 hover:bg-orange-600 rounded-md">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <Link href="/account" className="flex items-center space-x-1 text-gray-700 hover:text-orange-500">
                <User className="h-5 w-5" />
                <span className="hidden md:block">Account</span>
              </Link>
              <Link href="/wishlist" className="relative">
                <Heart className="h-6 w-6 text-gray-700 hover:text-orange-500" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Link>
              <Link href="/cart" className="relative">
                <ShoppingCart className="h-6 w-6 text-gray-700 hover:text-orange-500" />
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  2
                </span>
              </Link>
            </div>
          </div>

          <nav className="py-3">
            <div className="flex items-center space-x-8">
              <Button variant="ghost" className="flex items-center space-x-2">
                <Menu className="h-4 w-4" />
                <span>All Categories</span>
              </Button>
              <Link href="/birthday-cakes" className="text-gray-700 hover:text-orange-500">
                Birthday Cakes
              </Link>
              <Link href="/wedding-cakes" className="text-gray-700 hover:text-orange-500">
                Wedding Cakes
              </Link>
              <Link href="/custom-cakes" className="text-gray-700 hover:text-orange-500">
                Custom Cakes
              </Link>
              <Link href="/cupcakes" className="text-gray-700 hover:text-orange-500">
                Cupcakes
              </Link>
              <Link href="/deals" className="text-orange-500 font-semibold">
                Flash Sales
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-orange-500">
              Home
            </Link>
            <span>/</span>
            <span className="text-gray-900">All Cakes</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div
            className={`w-80 bg-white rounded-lg shadow-sm border h-fit ${showFilters ? "block" : "hidden lg:block"}`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Filters</h3>
                <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setShowFilters(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Price Range</h4>
                <div className="px-2">
                  <Slider value={priceRange} onValueChange={setPriceRange} max={200} step={5} className="mb-3" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>KSh {priceRange[0]}</span>
                    <span>KSh {priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Categories</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories([...selectedCategories, category])
                          } else {
                            setSelectedCategories(selectedCategories.filter((c) => c !== category))
                          }
                        }}
                      />
                      <label htmlFor={category} className="text-sm text-gray-700 cursor-pointer">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ratings */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Customer Ratings</h4>
                <div className="space-y-2">
                  {ratings.map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <Checkbox
                        id={rating}
                        checked={selectedRatings.includes(rating)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRatings([...selectedRatings, rating])
                          } else {
                            setSelectedRatings(selectedRatings.filter((r) => r !== rating))
                          }
                        }}
                      />
                      <label htmlFor={rating} className="text-sm text-gray-700 cursor-pointer flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        {rating}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Free Shipping */}
              <div className="mb-6">
                <div className="flex items-center space-x-2">
                  <Checkbox id="free-shipping" />
                  <label htmlFor="free-shipping" className="text-sm text-gray-700 cursor-pointer">
                    Free Shipping
                  </label>
                </div>
              </div>

              <Button className="w-full bg-orange-500 hover:bg-orange-600">Apply Filters</Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setShowFilters(true)}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  <span className="text-gray-600">
                    Showing <strong>1-{products.length}</strong> of <strong>247</strong> results
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <Select defaultValue="relevance">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Most Relevant</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="newest">Newest Arrivals</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex border rounded-lg">
                    <Button variant="ghost" size="sm" className="bg-orange-50">
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow bg-white">
                  <CardContent className="p-4">
                    <div className="relative mb-4">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        width={250}
                        height={250}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {product.discount && (
                        <Badge className="absolute top-2 left-2 bg-red-500">-{product.discount}%</Badge>
                      )}
                      {product.badge && <Badge className="absolute top-2 right-2 bg-orange-500">{product.badge}</Badge>}
                      <Button size="icon" variant="ghost" className="absolute bottom-2 right-2 bg-white/80">
                        <Heart className="h-4 w-4" />
                      </Button>
                      {product.freeShipping && (
                        <Badge className="absolute bottom-2 left-2 bg-green-500 text-xs">Free Shipping</Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm line-clamp-2 h-10">{product.name}</h3>
                      <p className="text-xs text-gray-600">by {product.seller}</p>

                      <div className="flex items-center space-x-1">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs ml-1">{product.rating}</span>
                        </div>
                        <span className="text-xs text-gray-500">({product.reviews})</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-orange-600">KSh {product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">KSh {product.originalPrice.toLocaleString()}</span>
                        )}
                      </div>

                      <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 mt-3">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                <Button size="sm" className="bg-orange-500">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  ...
                </Button>
                <Button variant="outline" size="sm">
                  10
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
