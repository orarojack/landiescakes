"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Star,
  Heart,
  ShoppingCart,
  Share2,
  Truck,
  Shield,
  Users,
  ChefHat,
  Award,
  MessageCircle,
  ThumbsUp,
  ArrowLeft,
  Plus,
  Minus,
  Camera,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Zap,
} from "lucide-react"
import { formatPriceKsh } from "@/lib/utils"
import { useCart } from "@/components/modern/cart-provider"
import { useToast } from "@/components/providers/toast-provider"
import { RatingStars, ReviewForm } from "@/components/modern/rating-stars"
import { useSession } from "next-auth/react"
import { CakeCustomization } from "@/components/modern/cake-customization"

interface CakeDetailPageProps {
  params: {
    id: string
  }
}

export default function CakeDetailPage({ params }: CakeDetailPageProps) {
  const { data: session } = useSession()
  const [cake, setCake] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState("medium")
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [canReview, setCanReview] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [userReview, setUserReview] = useState<any>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showCustomization, setShowCustomization] = useState(false)
  const [customization, setCustomization] = useState<any>(null)
  const { addToCart } = useCart();
  const toast = useToast();

  useEffect(() => {
    const fetchCake = async () => {
      setLoading(true)
      const res = await fetch(`/api/products/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setCake(data)
      }
      setLoading(false)
    }
    fetchCake()
  }, [params.id])

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}/review`)
        if (res.ok) {
          const data = await res.json()
          setReviews(data.reviews || [])
          setCanReview(data.canReview || false)
          setHasReviewed(data.hasReviewed || false)
          setUserReview(data.userReview || null)
        }
      } catch (error) {
        console.error("Error fetching reviews:", error)
      }
    }
    fetchReviews()
  }, [params.id])

  const handleSubmitReview = async (rating: number, comment: string) => {
    setSubmittingReview(true)
    try {
      const res = await fetch(`/api/products/${params.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, comment }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success("Review submitted successfully!")
        setShowReviewForm(false)
        
        // Refresh reviews
        const reviewsRes = await fetch(`/api/products/${params.id}/review`)
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json()
          setReviews(reviewsData.reviews || [])
          setCanReview(reviewsData.canReview || false)
          setHasReviewed(reviewsData.hasReviewed || false)
          setUserReview(reviewsData.userReview || null)
        }
        
        // Update cake data with new rating
        if (cake) {
          setCake({
            ...cake,
            averageRating: data.averageRating,
            reviewCount: data.reviewCount
          })
        }
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || "Failed to submit review")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      toast.error("Failed to submit review")
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }
  if (!cake) {
    return <div className="min-h-screen flex items-center justify-center">Cake not found.</div>
  }



  const relatedCakes = [
    {
      id: "2",
      name: "Red Velvet Delight",
      price: 38.99,
      image: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=300&h=200&fit=crop",
      rating: 4.7,
    },
    {
      id: "3",
      name: "Vanilla Bean Classic",
      price: 32.99,
      image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=300&h=200&fit=crop",
      rating: 4.6,
    },
    {
      id: "4",
      name: "Strawberry Shortcake",
      price: 35.99,
      image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&h=200&fit=crop",
      rating: 4.5,
    },
  ]

  const handleAddToCart = () => {
    if (!cake) return;
    const result = addToCart({
      id: cake.id,
      name: cake.name,
      price: cake.price,
      originalPrice: cake.originalPrice,
      image: cake.images?.[0] || "",
      seller: cake.seller?.businessName || "Unknown Seller",
      inStock: cake.inStock !== false,
      freeShipping: cake.freeShipping || false,
    });
    
    if (result.success) {
      toast.success(`${cake.name} added to cart!`)
    } else {
      toast.error(result.message || "Failed to add item to cart")
    }
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/cakes"
              className="flex items-center space-x-2 sm:space-x-3 text-gray-700 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-semibold text-sm sm:text-base">Back to Cakes</span>
            </Link>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button variant="ghost" size="icon" className="rounded-2xl h-8 w-8 sm:h-10 sm:w-10">
                <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon" className="rounded-2xl h-8 w-8 sm:h-10 sm:w-10">
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-bold">
                    2
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4 sm:space-y-6">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl">
              <Image
                src={cake.images[selectedImage] || "/placeholder.svg"}
                alt={cake.name}
                width={800}
                height={600}
                className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover"
              />

              {cake.discount && (
                <Badge className="absolute top-3 left-3 sm:top-6 sm:left-6 bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg rounded-2xl px-3 py-1 sm:px-4 sm:py-2 font-bold text-sm sm:text-lg animate-pulse">
                  -{cake.discount}% OFF
                </Badge>
              )}

              <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 flex space-x-2 sm:space-x-3">
                <Button
                  size="icon"
                  onClick={handleWishlist}
                  className={`rounded-2xl shadow-lg h-8 w-8 sm:h-10 sm:w-10 ${
                    isWishlisted ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white/90 hover:bg-white text-gray-700"
                  }`}
                >
                  <Heart className={`h-4 w-4 sm:h-5 sm:w-5 ${isWishlisted ? "fill-current" : ""}`} />
                </Button>
                <Button size="icon" className="bg-white/90 hover:bg-white text-gray-700 rounded-2xl shadow-lg h-8 w-8 sm:h-10 sm:w-10">
                  <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4">
              {cake.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative overflow-hidden rounded-xl sm:rounded-2xl transition-all duration-300 ${
                    selectedImage === index ? "ring-2 sm:ring-4 ring-orange-500 shadow-lg scale-105" : "hover:scale-105 shadow-md"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${cake.name} view ${index + 1}`}
                    width={200}
                    height={150}
                    className="w-full h-16 sm:h-24 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm">
                  Premium
                </Badge>
                <Badge className="bg-green-100 text-green-800 rounded-full px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm">Fresh Today</Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">{cake.name}</h1>

              <div className="flex items-center space-x-4 sm:space-x-6 flex-wrap">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center bg-yellow-50 rounded-full px-3 py-1 sm:px-4 sm:py-2">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-base sm:text-lg font-bold ml-1 sm:ml-2 text-gray-700">{cake.rating}</span>
                  </div>
                  <span className="text-sm sm:text-base text-gray-600">({cake.reviewCount} reviews)</span>
                </div>
                {cake.specifications && cake.specifications.serves && (
                  <div className="flex items-center space-x-2 text-sm sm:text-base text-gray-600">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>{cake.specifications.serves}</span>
                  </div>
                )}
              </div>

              <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">{cake.description}</p>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-orange-100">
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4 flex-wrap">
                <span className="text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  {formatPriceKsh(cake.price)}
                </span>
                {cake.originalPrice && (
                  <span className="text-base sm:text-lg text-gray-500 line-through">{formatPriceKsh(cake.originalPrice)}</span>
                )}
                {cake.discount && (
                  <Badge className="bg-red-500 text-white rounded-full px-2 py-1 sm:px-3 sm:py-1 font-bold text-xs sm:text-sm">
                    Save {formatPriceKsh(Number((cake.originalPrice! - cake.price) || 0))}
                  </Badge>
                )}
              </div>

              {/* Size Selection */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">Choose Size:</h3>
                {Array.isArray(cake.sizes) && cake.sizes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {cake.sizes.map((size: any) => (
                      <button
                        key={size.name}
                        onClick={() => setSelectedSize(size.name.toLowerCase())}
                        className={`p-3 sm:p-4 rounded-2xl border-2 transition-all duration-300 ${
                          selectedSize === size.name.toLowerCase()
                            ? "border-orange-500 bg-orange-50 shadow-lg"
                            : "border-gray-200 hover:border-orange-300 hover:bg-orange-25"
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-bold text-gray-900 text-sm sm:text-base">{size.name}</div>
                          <div className="text-xs sm:text-sm text-gray-600">{size.serves}</div>
                          <p className="font-bold text-orange-600 text-sm sm:text-base">{formatPriceKsh(size.price)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm sm:text-base">No size options available for this cake.</div>
                )}
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between mt-4 sm:mt-6 flex-wrap gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <span className="font-bold text-gray-900 text-sm sm:text-base">Quantity:</span>
                  <div className="flex items-center border-2 border-gray-200 rounded-2xl">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-l-2xl"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 sm:px-6 py-2 sm:py-3 font-bold text-base sm:text-lg min-w-[3rem] sm:min-w-[4rem] text-center">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-r-2xl"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs sm:text-sm text-gray-600">Total:</div>
                  <p className="font-bold text-base sm:text-lg text-gray-900">{formatPriceKsh(cake.price * quantity)}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-6 sm:mt-8">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl py-3 sm:py-4 text-base sm:text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                  Add to Cart
                </Button>
                <Button
                  onClick={() => setShowCustomization(true)}
                  variant="outline"
                  className="px-6 sm:px-8 py-3 sm:py-4 rounded-2xl border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-bold text-base sm:text-lg"
                >
                  Customize Your Cake
                </Button>
                <Button
                  onClick={() => {
                    // Direct checkout logic
                    handleAddToCart()
                    // Navigate to checkout
                    window.location.href = '/checkout'
                  }}
                  className="px-6 sm:px-8 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-white rounded-2xl shadow-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div className="font-bold text-gray-900 text-sm sm:text-base">Free Delivery</div>
                <div className="text-xs sm:text-sm text-gray-600">Orders above KSh 5,000</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-white rounded-2xl shadow-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="font-bold text-gray-900 text-sm sm:text-base">Same Day</div>
                <div className="text-xs sm:text-sm text-gray-600">2-4 hours</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-white rounded-2xl shadow-lg">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <div className="font-bold text-gray-900 text-sm sm:text-base">Quality</div>
                <div className="text-xs sm:text-sm text-gray-600">Guaranteed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <div className="mt-12 sm:mt-16 lg:mt-20">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-gray-100 rounded-2xl sm:rounded-3xl p-1 sm:p-2 h-12 sm:h-16">
              <TabsTrigger value="details" className="rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg">
                Details
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg">
                Reviews ({cake.reviewCount})
              </TabsTrigger>
              <TabsTrigger value="seller" className="rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg hidden sm:block">
                Seller Info
              </TabsTrigger>
              <TabsTrigger value="customization" className="rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg hidden sm:block">
                Customize
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6 sm:mt-8">
              <Card className="border-0 shadow-xl rounded-2xl sm:rounded-3xl">
                <CardContent className="p-6 sm:p-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 sm:mb-6">Specifications</h3>
                      {cake.specifications && (
                        <div className="space-y-3 sm:space-y-4">
                          {cake.specifications.flavor && (
                            <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100">
                              <span className="font-semibold text-gray-700 text-sm sm:text-base">Flavor</span>
                              <span className="text-gray-900 text-sm sm:text-base">{cake.specifications.flavor}</span>
                            </div>
                          )}
                          {cake.specifications.serves && (
                            <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100">
                              <span className="font-semibold text-gray-700 text-sm sm:text-base">Serves</span>
                              <span className="text-gray-900 text-sm sm:text-base">{cake.specifications.serves}</span>
                            </div>
                          )}
                          {cake.specifications.preparationTime && (
                            <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100">
                              <span className="font-semibold text-gray-700 text-sm sm:text-base">Preparation Time</span>
                              <span className="text-gray-900 text-sm sm:text-base">{cake.specifications.preparationTime}</span>
                            </div>
                          )}
                          {cake.specifications.weight && (
                            <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100">
                              <span className="font-semibold text-gray-700 text-sm sm:text-base">Weight</span>
                              <span className="text-gray-900 text-sm sm:text-base">{cake.specifications.weight}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 sm:mb-6">Ingredients & Allergens</h3>
                      <div className="space-y-4 sm:space-y-6">
                        <div>
                          <h4 className="font-bold text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Main Ingredients</h4>
                          <div className="flex flex-wrap gap-2">
                            {cake.specifications && cake.specifications.ingredients && cake.specifications.ingredients.map((ingredient: string, index: number) => (
                              <Badge key={index} variant="outline" className="rounded-full px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm">
                                {ingredient}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-700 mb-2 sm:mb-3 text-sm sm:text-base">Allergens</h4>
                          <div className="flex flex-wrap gap-2">
                            {cake.specifications && cake.specifications.allergens && cake.specifications.allergens.map((allergen: string, index: number) => (
                              <Badge key={index} className="bg-red-100 text-red-800 rounded-full px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm">
                                {allergen}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6 sm:mt-8">
              <div className="space-y-6 sm:space-y-8">
                {/* Review Summary */}
                <Card className="border-0 shadow-xl rounded-2xl sm:rounded-3xl">
                  <CardContent className="p-6 sm:p-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                      <div className="text-center">
                        <div className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-2">
                          {cake.averageRating ? cake.averageRating.toFixed(1) : "0.0"}
                        </div>
                        <div className="flex items-center justify-center mb-2">
                          <RatingStars 
                            rating={cake.averageRating || 0} 
                            readonly 
                            size="lg"
                          />
                        </div>
                        <div className="text-gray-600 text-sm sm:text-base">
                          Based on {cake.reviewCount || 0} reviews
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <div className="space-y-2 sm:space-y-3">
                          {[5, 4, 3, 2, 1].map((stars) => {
                            const count = reviews.filter(r => r.rating === stars).length
                            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                            return (
                              <div key={stars} className="flex items-center space-x-3 sm:space-x-4">
                                <span className="text-xs sm:text-sm font-medium w-6 sm:w-8">{stars}★</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2 sm:h-3">
                                  <div
                                    className="bg-yellow-400 h-2 sm:h-3 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs sm:text-sm text-gray-600 w-10 sm:w-12">
                                  {count}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Individual Reviews */}
                <div className="space-y-4 sm:space-y-6">
                  {reviews.length === 0 ? (
                    <Card className="border-0 shadow-lg rounded-2xl sm:rounded-3xl">
                      <CardContent className="p-8 text-center">
                        <div className="text-gray-500 mb-4">
                          <Star className="h-12 w-12 mx-auto text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No reviews yet</h3>
                        <p className="text-gray-500">Be the first to review this product!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    reviews.map((review) => (
                      <Card key={review.id} className="border-0 shadow-lg rounded-2xl sm:rounded-3xl">
                        <CardContent className="p-4 sm:p-8">
                          <div className="flex items-start space-x-3 sm:space-x-4">
                            <Image
                              src={review.user?.image || "/placeholder-user.jpg"}
                              alt={review.user?.name || "User"}
                              width={60}
                              height={60}
                              className="rounded-2xl w-12 h-12 sm:w-15 sm:h-15 object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                                    {review.user?.name || "Anonymous"}
                                  </h4>
                                  <div className="flex items-center space-x-2">
                                    <RatingStars 
                                      rating={review.rating} 
                                      readonly 
                                      size="sm"
                                    />
                                    <span className="text-xs sm:text-sm text-gray-500">
                                      {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-700 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                                {review.comment}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {/* Write Review */}
                {!session ? (
                  <Card className="border-0 shadow-xl rounded-2xl sm:rounded-3xl">
                    <CardContent className="p-8 text-center">
                      <div className="text-gray-500 mb-4">
                        <Star className="h-12 w-12 mx-auto text-gray-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Sign in to write a review</h3>
                      <p className="text-gray-500 mb-4">You need to be logged in to review this product.</p>
                      <Link href="/auth/login">
                        <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl px-6 py-3 font-bold">
                          Sign In
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : !canReview ? (
                  <Card className="border-0 shadow-xl rounded-2xl sm:rounded-3xl">
                    <CardContent className="p-8 text-center">
                      <div className="text-gray-500 mb-4">
                        <ShoppingCart className="h-12 w-12 mx-auto text-gray-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Purchase required</h3>
                      <p className="text-gray-500 mb-4">You can only review products you have purchased and received.</p>
                    </CardContent>
                  </Card>
                ) : hasReviewed ? (
                  <Card className="border-0 shadow-xl rounded-2xl sm:rounded-3xl">
                    <CardHeader>
                      <CardTitle className="text-xl sm:text-2xl font-black">Your Review</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                      <div className="flex items-center space-x-2">
                        <RatingStars rating={userReview?.rating || 0} readonly size="md" />
                        <span className="text-sm text-gray-500">
                          {new Date(userReview?.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{userReview?.comment}</p>
                      <Button 
                        onClick={() => setShowReviewForm(true)}
                        variant="outline"
                        className="border-2 border-orange-200 text-orange-600 hover:bg-orange-50 rounded-2xl"
                      >
                        Edit Review
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-0 shadow-xl rounded-2xl sm:rounded-3xl">
                    <CardHeader>
                      <CardTitle className="text-xl sm:text-2xl font-black">Write a Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ReviewForm
                        onSubmit={handleSubmitReview}
                        isLoading={submittingReview}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Edit Review Modal */}
                {showReviewForm && userReview && (
                  <div 
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowReviewForm(false)}
                  >
                    <Card 
                      className="w-full max-w-2xl border-0 shadow-2xl rounded-3xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CardHeader>
                        <CardTitle className="text-xl sm:text-2xl font-black">Edit Your Review</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ReviewForm
                          onSubmit={handleSubmitReview}
                          initialRating={userReview.rating}
                          initialComment={userReview.comment}
                          isLoading={submittingReview}
                        />
                        <div className="mt-4 flex gap-3">
                          <Button 
                            onClick={() => setShowReviewForm(false)}
                            variant="outline"
                            className="flex-1 rounded-2xl"
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="seller" className="mt-6 sm:mt-8">
              <Card className="border-0 shadow-xl rounded-2xl sm:rounded-3xl">
                <CardContent className="p-6 sm:p-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                    <div>
                      <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                        <Image
                          src={cake.seller.avatar || "/placeholder.svg"}
                          alt={cake.seller.name}
                          width={80}
                          height={80}
                          className="rounded-3xl shadow-lg w-16 h-16 sm:w-20 sm:h-20"
                        />
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl sm:text-2xl font-black text-gray-900">{cake.seller.name}</h3>
                            {cake.seller.verified && (
                              <Badge className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm">
                                <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center bg-yellow-50 rounded-full px-2 py-1 sm:px-3 sm:py-1">
                              <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-bold ml-1 text-xs sm:text-sm">{cake.seller.rating}</span>
                            </div>
                            <span className="text-gray-600 text-xs sm:text-sm">({cake.seller.reviews} reviews)</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                          <span className="text-gray-700 text-sm sm:text-base">{cake.seller.location}</span>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <ChefHat className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                          <span className="text-gray-700 text-sm sm:text-base">Professional Baker since 2018</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Contact Seller</h4>
                        <div className="space-y-2 sm:space-y-3">
                          <Button variant="outline" className="w-full justify-start rounded-2xl py-2 sm:py-3 text-sm sm:text-base">
                            <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                            Call Seller
                          </Button>
                          <Button variant="outline" className="w-full justify-start rounded-2xl py-2 sm:py-3 text-sm sm:text-base">
                            <Mail className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                            Send Message
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Store Policies</h4>
                        <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                          <div>• 24-hour advance notice for custom orders</div>
                          <div>• Free delivery within 10km radius</div>
                          <div>• 100% satisfaction guarantee</div>
                          <div>• Accepts custom design requests</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="customization" className="mt-6 sm:mt-8">
              <CakeCustomization
                basePrice={cake.price}
                onCustomizationChange={setCustomization}
                onAddToCart={(customizedCake) => {
                  addToCart({
                    id: cake.id,
                    name: cake.name,
                    price: customizedCake.totalPrice,
                    originalPrice: cake.originalPrice,
                    image: cake.images?.[0] || "",
                    seller: cake.seller?.businessName || "Unknown Seller",
                    inStock: cake.inStock !== false,
                    freeShipping: cake.freeShipping || false,
                    customization: customizedCake,
                  })
                  toast.success("Customized cake added to cart!")
                  setShowCustomization(false)
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-12 sm:mt-16 lg:mt-20">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-3 sm:mb-4">You Might Also Like</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">More delicious options from our collection</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {relatedCakes.map((relatedCake) => (
              <Link key={relatedCake.id} href={`/cakes/${relatedCake.id}`}>
                <Card className="group hover:shadow-2xl transition-all duration-700 border-0 shadow-lg overflow-hidden bg-white hover:-translate-y-2 sm:hover:-translate-y-4 rounded-2xl sm:rounded-3xl cursor-pointer">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-2xl sm:rounded-t-3xl">
                      <Image
                        src={relatedCake.image || "/placeholder.svg"}
                        alt={relatedCake.name}
                        width={300}
                        height={200}
                        className="w-full h-40 sm:h-48 object-cover group-hover:scale-125 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-4 sm:p-6">
                      <h3 className="font-black text-lg sm:text-xl mb-2 sm:mb-3 text-gray-900 group-hover:text-orange-600 transition-colors">
                        {relatedCake.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xl sm:text-2xl font-black text-orange-600">{formatPriceKsh(relatedCake.price)}</span>
                        <div className="flex items-center bg-yellow-50 rounded-full px-2 py-1 sm:px-3 sm:py-1">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold ml-1 text-xs sm:text-sm">{relatedCake.rating}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
