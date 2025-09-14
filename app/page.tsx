"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  Menu,
  ChevronRight,
  Star,
  Clock,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Award,
  Users,
  ArrowRight,
  Play,
  Gift,
  Flame,
} from "lucide-react"
import { useToast } from "@/components/providers/toast-provider"
import { Modal } from "@/components/modern/modal"
import { useCart } from "@/hooks/use-cart"

// Format price in KSh
function formatPriceKsh(price: number): string {
  return `KSh ${price.toLocaleString()}`
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
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
    logo?: string
  }
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [flashSales, setFlashSales] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { info, success } = useToast();
  const [showFlashSaleModal, setShowFlashSaleModal] = useState(false)
  const [modalProduct, setModalProduct] = useState<Product | null>(null)
  const { addItem } = useCart()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  // Show flash sale quick order popup on first load
  useEffect(() => {
    if (flashSales.length === 0) return
    // Always show the modal for testing (remove sessionStorage check)
    const randomIndex = Math.floor(Math.random() * flashSales.length)
    setModalProduct(flashSales[randomIndex])
    setShowFlashSaleModal(true)
  }, [flashSales])

  // Auto-close the modal after 15 seconds if open
  useEffect(() => {
    if (showFlashSaleModal) {
      const timer = setTimeout(() => {
        setShowFlashSaleModal(false)
      }, 15000)
      return () => clearTimeout(timer)
    }
  }, [showFlashSaleModal])

  useEffect(() => {
    if (!featuredProducts.length && !flashSales.length) return;
    const buyers = [
      "Sarah J.", "Mike C.", "Emily D.", "John S.", "Alice J.", "David K.", "Maria R.", "James O.", "Grace W.", "Brian M."
    ];
    const offers = [
      "🎉 10% OFF on all Birthday Cakes! Use code CAKE10",
      "🔥 Flash Sale: Up to 30% OFF select cakes!",
      "🍰 Free delivery for orders above KSh 5,000!",
      "🎁 Buy 1 Get 1 Free on Cupcakes this week!",
      "⭐ New: Vegan Cakes now available!"
    ];
    let timeout: NodeJS.Timeout;
    function showRandomPopup() {
      const showPurchase = Math.random() > 0.4;
      if (showPurchase && (featuredProducts.length || flashSales.length)) {
        const cakes = [...featuredProducts, ...flashSales];
        const cake = cakes[Math.floor(Math.random() * cakes.length)];
        const buyer = buyers[Math.floor(Math.random() * buyers.length)];
        info(`${buyer} just purchased`, cake.name);
      } else {
        const offer = offers[Math.floor(Math.random() * offers.length)];
        success("Special Offer", offer);
      }
      timeout = setTimeout(showRandomPopup, 15000 + Math.random() * 15000);
    }
    timeout = setTimeout(showRandomPopup, 8000);
    return () => clearTimeout(timeout);
  }, [featuredProducts, flashSales]);

  const fetchProducts = async () => {
    try {
      console.log("[Homepage] Fetching products...")
      
      // Fetch featured products (admin-selected)
      const featuredResponse = await fetch("/api/products?isFeatured=true&sortBy=createdAt&sortOrder=desc")
      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json()
        console.log("[Homepage] Featured products received:", featuredData.products?.length || 0)
        console.log("[Homepage] Featured products:", featuredData.products)
        setFeaturedProducts(featuredData.products || [])
      } else {
        console.error("[Homepage] Failed to fetch featured products:", featuredResponse.status)
      }

      // Fetch all flash sales (up to 100, all prices)
      const flashResponse = await fetch("/api/products?limit=100&flashSale=true&minPrice=0&maxPrice=10000&sortBy=createdAt&sortOrder=desc")
      if (flashResponse.ok) {
        const flashData = await flashResponse.json()
        console.log("[Homepage] Flash sales API response:", flashData)
        setFlashSales(flashData.products || [])
      }
    } catch (error) {
      console.error("[Homepage] Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        const categoriesWithImages = data.categories.map((category: any) => ({
          id: category.id,
          name: category.name,
          icon: getCategoryIcon(category.name),
          count: `${category.productCount}+ items`,
          image: getCategoryImage(category.name),
          href: `/cakes?category=${category.id}`,
          productCount: category.productCount,
        }))
        setCategories(categoriesWithImages)
      } else {
        // Fallback to default categories if API fails
        setCategories(getDefaultCategories())
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      // Fallback to default categories if API fails
      setCategories(getDefaultCategories())
    }
  }

  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      "Birthday Cakes": "🎂",
      "Wedding Cakes": "💒",
      "Custom Cakes": "🎨",
      "Cupcakes": "🧁",
      "Chocolate Cakes": "🍫",
      "Fruit Cakes": "🍓",
      "Cheesecakes": "🍰",
      "Vegan Cakes": "🌱",
    }
    return iconMap[categoryName] || "🍰"
  }

  const getCategoryImage = (categoryName: string) => {
    const imageMap: { [key: string]: string } = {
      "Birthday Cakes": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      "Wedding Cakes": "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop",
      "Custom Cakes": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
      "Cupcakes": "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400&h=300&fit=crop",
      "Chocolate Cakes": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop",
      "Fruit Cakes": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop",
      "Cheesecakes": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop",
      "Vegan Cakes": "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop",
    }
    return imageMap[categoryName] || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop"
  }

  const getDefaultCategories = () => [
    {
      name: "Birthday Cakes",
      icon: "🎂",
      count: "120+ items",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      href: "/cakes?category=birthday",
    },
    {
      name: "Wedding Cakes",
      icon: "💒",
      count: "85+ items",
      image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop",
      href: "/cakes?category=wedding",
    },
    {
      name: "Custom Cakes",
      icon: "🎨",
      count: "200+ items",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
      href: "/cakes?category=custom",
    },
    {
      name: "Cupcakes",
      icon: "🧁",
      count: "150+ items",
      image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400&h=300&fit=crop",
      href: "/cakes?category=cupcakes",
    },
    {
      name: "Chocolate Cakes",
      icon: "🍫",
      count: "95+ items",
      image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop",
      href: "/cakes?category=chocolate",
    },
    {
      name: "Fruit Cakes",
      icon: "🍓",
      count: "75+ items",
      image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop",
      href: "/cakes?category=fruit",
    },
    {
      name: "Cheesecakes",
      icon: "🍰",
      count: "60+ items",
      image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop",
      href: "/cakes?category=cheesecakes",
    },
    {
      name: "Vegan Cakes",
      icon: "🌱",
      count: "45+ items",
      image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop",
      href: "/cakes?category=vegan",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Happy Customer",
      content: "The wedding cake was absolutely perfect! Every guest complimented how delicious it was.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Mike Chen",
      role: "Birthday Party Host",
      content: "Amazing quality and delivered right on time. My daughter loved her unicorn cake!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Emily Davis",
      role: "Corporate Client",
      content: "Professional service for our office celebration. The team cake was a huge hit!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/20">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-pink-600 to-purple-700 text-white py-3">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center space-x-6 text-sm font-medium">
            <div className="flex items-center space-x-2">
              <Gift className="h-4 w-4" />
              <span>🎉 Free delivery on orders above KSh 5,000</span>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>Call us: +254-700-123-456</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 via-pink-400/10 to-purple-400/10"></div>
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-orange-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full px-6 py-3 border border-orange-200/50">
                  <Award className="h-6 w-6 text-orange-600" />
                  <span className="font-bold text-gray-700">Award-Winning Marketplace 2024</span>
                </div>

                <h1 className="text-7xl md:text-8xl font-black leading-tight">
                  <span className="text-gray-900">Sweet</span>
                  <span className="block bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Perfection
                  </span>
                  <span className="block text-gray-900">Delivered</span>
                </h1>

                <p className="text-2xl text-gray-600 leading-relaxed max-w-lg">
                  Discover handcrafted masterpieces from world-class artisan bakers. Every cake tells a story, every
                  bite creates a memory.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <Link href="/cakes">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 hover:from-orange-600 hover:via-pink-600 hover:to-purple-700 rounded-3xl px-10 py-6 text-xl font-bold shadow-2xl hover:shadow-orange-500/25 transition-all duration-500 group"
                  >
                    <ShoppingCart className="h-6 w-6 mr-3" />
                    Explore Cakes
                    <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#testimonials">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-3xl px-10 py-6 text-xl font-bold backdrop-blur-sm transition-all duration-500 group"
                  >
                    <Star className="h-6 w-6 mr-3" />
                    Customer Stories
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-6 pt-8">
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Users className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="text-3xl font-black text-gray-900">50K+</div>
                  <div className="text-sm text-gray-600 font-medium">Happy Customers</div>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Award className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="text-3xl font-black text-gray-900">1,200+</div>
                  <div className="text-sm text-gray-600 font-medium">Expert Bakers</div>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Star className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="text-3xl font-black text-gray-900">4.9★</div>
                  <div className="text-sm text-gray-600 font-medium">Average Rating</div>
                </div>
                <div className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="text-3xl font-black text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600 font-medium">Customer Support</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 rounded-[3rem] blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white/20 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/30 shadow-2xl">
                <div className="relative overflow-hidden rounded-[2rem]">
                  <Image
                    src="https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=800&h=600&fit=crop"
                    alt="Premium Cake Collection"
                    width={800}
                    height={600}
                    className="w-full h-auto rounded-[2rem] shadow-2xl"
                  />
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-xl animate-bounce">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-700 font-bold">Live Orders: 47</span>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-gray-700 font-bold">4.9 Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sales Section - Moved Up */}
      <section className="py-16 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Flash{" "}
                <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Sales
                </span>
              </h2>
              <p className="text-xl text-gray-600">Limited time offers on amazing cakes</p>
            </div>
            <Link href="/cakes">
              <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-2xl px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                View All
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-3xl h-64 mb-4"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                    <div className="bg-gray-200 h-6 rounded w-1/2"></div>
                    <div className="bg-gray-200 h-4 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : flashSales.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {flashSales.map((cake) => (
                <Link key={cake.id} href={`/cakes/${cake.id}`}>
                  <Card className="group hover:shadow-2xl transition-all duration-700 cursor-pointer border-0 shadow-lg overflow-hidden bg-white hover:-translate-y-4 rounded-3xl relative">
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-lg rounded-2xl px-4 py-2 font-bold animate-pulse">
                        -{Math.round(((cake.originalPrice! - cake.price) / cake.originalPrice!) * 100)}% OFF
                      </Badge>
                    </div>
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden rounded-t-3xl">
                        <Image
                          src={cake.images[0] || "/placeholder.svg"}
                          alt={cake.name}
                          width={500}
                          height={400}
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <Button
                          size="icon"
                          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-700 shadow-lg backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <Heart className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="p-6">
                        <p className="text-sm text-gray-500 font-semibold mb-2">by {cake.seller.businessName}</p>
                        <h3 className="font-black text-xl mb-3 text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                          {cake.name}
                        </h3>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center bg-yellow-50 rounded-full px-3 py-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold ml-1 text-gray-700">{cake.averageRating}</span>
                          </div>
                          <span className="text-sm text-gray-500 font-medium">({cake.reviewCount} reviews)</span>
                        </div>
                        <div className="flex items-center space-x-3 mb-4">
                          <span className="text-2xl font-black text-orange-600">{formatPriceKsh(cake.price)}</span>
                          {cake.originalPrice && (
                            <span className="text-lg text-gray-500 line-through">
                              {formatPriceKsh(cake.originalPrice)}
                            </span>
                          )}
                        </div>
                        <Button className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 py-3 font-bold">
                          Shop Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Gift className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No flash sales available</h3>
              <p className="text-gray-600 mb-6">Check back later for amazing deals!</p>
            </div>
          )}
        </div>
      </section>

      {/* Slideshow of Sold Cakes */}
      <section className="py-16 bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Recently{" "}
              <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Sold
              </span>
            </h2>
            <p className="text-xl text-gray-600">Take a look at some of our successful deliveries</p>
          </div>

          <div className="relative overflow-hidden">
            <div className="flex space-x-6 animate-scroll">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-80">
                  <Card className="border-0 shadow-lg overflow-hidden bg-white rounded-3xl">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden rounded-t-3xl">
                        <Image
                          src={`https://images.unsplash.com/photo-${1558618666 + i * 1000}?w=400&h=300&fit=crop`}
                          alt={`Sold Cake ${i + 1}`}
                          width={400}
                          height={300}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-green-500 text-white border-0 shadow-lg rounded-2xl px-3 py-1 font-bold">
                            Delivered
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Beautiful Cake #{i + 1}</h3>
                        <p className="text-sm text-gray-600 mb-3">Delivered to happy customer</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center bg-yellow-50 rounded-full px-2 py-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-bold ml-1 text-gray-700">5.0</span>
                          </div>
                          <span className="text-sm text-gray-500">2 days ago</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-orange-100 to-pink-100 rounded-full px-8 py-4 mb-8">
              <Sparkles className="h-6 w-6 text-orange-600" />
              <span className="text-lg font-bold text-gray-700">Explore Our Collection</span>
            </div>
            <h2 className="text-6xl md:text-7xl font-black text-gray-900 mb-8">
              Every
              <span className="block bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Occasion
              </span>
              <span className="block text-gray-900">Covered</span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From intimate celebrations to grand festivities, discover the perfect cake for every moment that matters
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {categories.map((category, index) => (
              <Link key={index} href={category.href}>
                <Card className="group hover:shadow-2xl transition-all duration-700 cursor-pointer border-0 shadow-lg overflow-hidden bg-white hover:-translate-y-4 rounded-3xl">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-3xl">
                      <Image
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        width={400}
                        height={300}
                        className="w-full h-40 object-cover group-hover:scale-125 transition-transform duration-700"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg";
                        }}
                        priority={index < 4}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-4 left-4 text-4xl group-hover:scale-125 transition-transform duration-500">
                        {category.icon}
                      </div>
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="font-black text-lg mb-2 text-gray-900 group-hover:text-orange-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-gray-500 font-semibold">{category.count}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link href="/cakes">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-orange-200 text-orange-600 hover:bg-orange-50 rounded-3xl px-12 py-6 text-xl font-bold transition-all duration-500 group"
              >
                View All Categories
                <ChevronRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                Featured{" "}
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Products
                </span>
              </h2>
              <p className="text-xl text-gray-600">Handpicked cakes from our best sellers</p>
            </div>
            <Link href="/cakes">
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-2xl px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                View All
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-3xl h-64 mb-4"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                    <div className="bg-gray-200 h-6 rounded w-1/2"></div>
                    <div className="bg-gray-200 h-4 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((cake) => (
                <Link key={cake.id} href={`/cakes/${cake.id}`}>
                  <Card className="group hover:shadow-2xl transition-all duration-700 cursor-pointer border-0 shadow-lg overflow-hidden bg-white hover:-translate-y-4 rounded-3xl">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden rounded-t-3xl">
                        <Image
                          src={cake.images[0] || "/placeholder.svg"}
                          alt={cake.name}
                          width={600}
                          height={500}
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <Button
                          size="icon"
                          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-700 shadow-lg backdrop-blur-sm rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <Heart className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="p-6">
                        <p className="text-sm text-gray-500 font-semibold mb-2">by {cake.seller.businessName}</p>
                        <h3 className="font-black text-xl mb-3 text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                          {cake.name}
                        </h3>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center bg-yellow-50 rounded-full px-3 py-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold ml-1 text-gray-700">{cake.averageRating}</span>
                          </div>
                          <span className="text-sm text-gray-500 font-medium">({cake.reviewCount} reviews)</span>
                        </div>
                        <div className="flex items-center space-x-3 mb-4">
                          <span className="text-2xl font-black text-purple-600">{formatPriceKsh(cake.price)}</span>
                          {cake.originalPrice && (
                            <span className="text-lg text-gray-500 line-through">
                              {formatPriceKsh(cake.originalPrice)}
                            </span>
                          )}
                        </div>
                        <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 py-3 font-bold">
                          Shop Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No featured products available</h3>
              <p className="text-gray-600 mb-6">Check back soon for amazing products!</p>
            </div>
          )}
        </div>
      </section>

      {/* Customer Stories (Testimonials) */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50/20 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-8 py-4 mb-8">
              <Star className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-700">Customer Stories</span>
            </div>
            <h2 className="text-6xl md:text-7xl font-black text-gray-900 mb-8">
              What Our
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Customers
              </span>
              <span className="block text-gray-900">Say</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-700 border-0 shadow-lg overflow-hidden bg-white hover:-translate-y-2 rounded-3xl"
              >
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-4">
                    <Image
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center text-white">
            <div className="inline-flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-8 py-4 mb-8">
              <Gift className="h-6 w-6" />
              <span className="text-lg font-bold">Join Our Community</span>
            </div>
            <h2 className="text-6xl md:text-7xl font-black mb-8">
              Ready to Create
              <span className="block">Sweet Memories?</span>
            </h2>
            <p className="text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed mb-12">
              Join thousands of satisfied customers who trust us with their special moments
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/cakes">
                <Button
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 rounded-3xl px-12 py-6 text-xl font-bold shadow-2xl transition-all duration-500 group"
                >
                  <ShoppingCart className="h-6 w-6 mr-3" />
                  Start Shopping
                  <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/seller/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-gray-900 rounded-3xl px-12 py-6 text-xl font-bold backdrop-blur-sm transition-all duration-500"
                >
                  Become a Baker
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sale Quick Order Modal */}
      <Modal
        isOpen={showFlashSaleModal && !!modalProduct}
        onClose={() => setShowFlashSaleModal(false)}
        title={modalProduct ? `Quick Order: ${modalProduct.name}` : "Quick Order"}
        size="2xl"
        className="max-w-7xl w-full"
      >
        {modalProduct && (
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 items-center p-4 sm:p-6 lg:p-10 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 rounded-2xl shadow-2xl">
            <div className="flex-shrink-0 w-full sm:w-[280px] lg:w-[400px] xl:w-[480px] 2xl:w-[520px]">
              <Image
                src={modalProduct.images[0] || "/placeholder.svg"}
                alt={modalProduct.name}
                width={520}
                height={390}
                className="w-full h-auto rounded-3xl object-cover shadow-2xl border-4 border-white"
              />
              <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-lg rounded-2xl px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 font-bold animate-pulse text-xs sm:text-sm lg:text-base">
                  -{modalProduct.originalPrice ? Math.round(((modalProduct.originalPrice - modalProduct.price) / modalProduct.originalPrice) * 100) : 0}% OFF
                </Badge>
                {modalProduct.stock === 0 && (
                  <Badge className="bg-gray-400 text-white text-xs sm:text-sm lg:text-base px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2">Out of Stock</Badge>
                )}
              </div>
            </div>
            <div className="flex-1 space-y-3 sm:space-y-4 lg:space-y-5 max-w-xl lg:max-w-2xl xl:max-w-3xl">
              <h3 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-gray-900 mb-2">{modalProduct.name}</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black text-orange-600">{formatPriceKsh(modalProduct.price)}</span>
                {modalProduct.originalPrice && (
                  <span className="text-base sm:text-lg lg:text-xl text-gray-500 line-through">
                    {formatPriceKsh(modalProduct.originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-gray-700 text-sm lg:text-base mb-2 line-clamp-3 sm:line-clamp-4 lg:line-clamp-5">{modalProduct.description}</p>
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <Image
                  src={modalProduct.seller.logo || "/placeholder.svg"}
                  alt={modalProduct.seller.businessName}
                  width={32}
                  height={32}
                  className="rounded-full border border-gray-200 sm:w-9 sm:h-9"
                />
                <span className="font-semibold text-gray-800 text-sm lg:text-base">By {modalProduct.seller.businessName}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center bg-yellow-50 rounded-full px-2 sm:px-3 py-1">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs sm:text-sm font-bold ml-1 text-gray-700">{modalProduct.averageRating}</span>
                </span>
                <span className="text-xs sm:text-sm text-gray-500 font-medium">({modalProduct.reviewCount} reviews)</span>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 py-2.5 sm:py-3 lg:py-4 font-bold mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg"
                onClick={() => {
                  addItem({
                    id: modalProduct.id,
                    name: modalProduct.name,
                    price: modalProduct.price,
                    originalPrice: modalProduct.originalPrice,
                    image: modalProduct.images[0] || "/placeholder.svg",
                    seller: modalProduct.seller.businessName,
                    inStock: modalProduct.stock > 0,
                  })
                  setShowFlashSaleModal(false)
                  info("Added to Cart", `${modalProduct.name} has been added to your cart.`)
                }}
                disabled={modalProduct.stock === 0}
              >
                {modalProduct.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
