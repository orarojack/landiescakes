"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  MapPin,
  Search,
  Navigation,
  Star,
  Phone,
  Mail,
  Clock,
  Users,
  ArrowRight,
  Filter,
  Map,
  Location,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Seller {
  id: string
  businessName: string
  location: string
  distance: number
  rating: number
  reviewCount: number
  image: string
  specialties: string[]
  deliveryTime: string
  minOrder: number
  isOpen: boolean
}

export default function LocationPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [sellers, setSellers] = useState<Seller[]>([])
  const [selectedFilter, setSelectedFilter] = useState("all")

  useEffect(() => {
    detectUserLocation()
  }, [])

  const detectUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
          fetchNearbySellers(latitude, longitude)
        },
        (error) => {
          console.error("Error getting location:", error)
          // Fallback to default location (Nairobi)
          setUserLocation({ lat: -1.2921, lng: 36.8219 })
          fetchNearbySellers(-1.2921, 36.8219)
        }
      )
    } else {
      // Fallback to default location
      setUserLocation({ lat: -1.2921, lng: 36.8219 })
      fetchNearbySellers(-1.2921, 36.8219)
    }
  }

  const fetchNearbySellers = async (lat: number, lng: number) => {
    setLoading(true)
    try {
      // Mock data for demonstration
      const mockSellers: Seller[] = [
        {
          id: "1",
          businessName: "Sweet Dreams Bakery",
          location: "Westlands, Nairobi",
          distance: 2.3,
          rating: 4.8,
          reviewCount: 127,
          image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
          specialties: ["Wedding Cakes", "Birthday Cakes", "Custom Designs"],
          deliveryTime: "2-4 hours",
          minOrder: 2000,
          isOpen: true,
        },
        {
          id: "2",
          businessName: "Cake Paradise",
          location: "Kilimani, Nairobi",
          distance: 3.1,
          rating: 4.6,
          reviewCount: 89,
          image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400&h=300&fit=crop",
          specialties: ["Chocolate Cakes", "Vegan Cakes", "Cupcakes"],
          deliveryTime: "1-3 hours",
          minOrder: 1500,
          isOpen: true,
        },
        {
          id: "3",
          businessName: "Artisan Cakes Kenya",
          location: "Lavington, Nairobi",
          distance: 4.2,
          rating: 4.9,
          reviewCount: 203,
          image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
          specialties: ["Luxury Cakes", "Wedding Cakes", "Corporate Events"],
          deliveryTime: "3-6 hours",
          minOrder: 5000,
          isOpen: true,
        },
        {
          id: "4",
          businessName: "Home Sweet Home Bakery",
          location: "Karen, Nairobi",
          distance: 5.8,
          rating: 4.7,
          reviewCount: 156,
          image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400&h=300&fit=crop",
          specialties: ["Home-style Cakes", "Traditional Cakes", "Kids Cakes"],
          deliveryTime: "2-5 hours",
          minOrder: 1000,
          isOpen: false,
        },
        {
          id: "5",
          businessName: "Cake Studio Nairobi",
          location: "Upperhill, Nairobi",
          distance: 1.9,
          rating: 4.5,
          reviewCount: 78,
          image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop",
          specialties: ["Modern Cakes", "Designer Cakes", "Event Cakes"],
          deliveryTime: "1-2 hours",
          minOrder: 3000,
          isOpen: true,
        },
      ]

      setSellers(mockSellers)
    } catch (error) {
      console.error("Error fetching sellers:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSellers = sellers.filter((seller) => {
    const matchesSearch = seller.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         seller.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === "all" || 
                         (selectedFilter === "open" && seller.isOpen) ||
                         (selectedFilter === "nearby" && seller.distance <= 3)
    return matchesSearch && matchesFilter
  })

  const formatPriceKsh = (price: number): string => {
    return `KSh ${price.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/20">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-xl">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Find Cakes Near You</h1>
              <p className="text-gray-600">Discover local bakeries and cake artisans in your area</p>
            </div>
            <Button
              onClick={detectUserLocation}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl px-6 py-3 shadow-lg"
            >
              <Navigation className="h-5 w-5 mr-2" />
              Update Location
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Location Info */}
        {userLocation && (
          <Card className="mb-8 border-0 shadow-lg rounded-3xl bg-gradient-to-r from-orange-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                    <Location className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Your Location</h3>
                    <p className="text-gray-600">
                      {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-500 text-white px-4 py-2 rounded-2xl">
                  Location Detected
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search bakeries, locations, or specialties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedFilter === "all" ? "default" : "outline"}
              onClick={() => setSelectedFilter("all")}
              className="rounded-2xl"
            >
              All Sellers ({sellers.length})
            </Button>
            <Button
              variant={selectedFilter === "nearby" ? "default" : "outline"}
              onClick={() => setSelectedFilter("nearby")}
              className="rounded-2xl"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Nearby (≤3km)
            </Button>
            <Button
              variant={selectedFilter === "open" ? "default" : "outline"}
              onClick={() => setSelectedFilter("open")}
              className="rounded-2xl"
            >
              <Clock className="h-4 w-4 mr-2" />
              Open Now
            </Button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-3xl h-48 mb-4"></div>
                <div className="space-y-2">
                  <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                  <div className="bg-gray-200 h-6 rounded w-1/2"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredSellers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSellers.map((seller) => (
              <Card key={seller.id} className="group hover:shadow-2xl transition-all duration-700 border-0 shadow-lg overflow-hidden bg-white hover:-translate-y-2 rounded-3xl">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-3xl">
                    <Image
                      src={seller.image}
                      alt={seller.businessName}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={`${seller.isOpen ? 'bg-green-500' : 'bg-red-500'} text-white border-0 shadow-lg rounded-2xl px-3 py-1 font-bold`}>
                        {seller.isOpen ? 'Open' : 'Closed'}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-orange-500 text-white border-0 shadow-lg rounded-2xl px-3 py-1 font-bold">
                        {seller.distance}km
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-black text-xl text-gray-900 group-hover:text-orange-600 transition-colors">
                        {seller.businessName}
                      </h3>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 text-sm">{seller.location}</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center bg-yellow-50 rounded-full px-3 py-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold ml-1 text-gray-700">{seller.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({seller.reviewCount} reviews)</span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Delivery: {seller.deliveryTime}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Min Order: {formatPriceKsh(seller.minOrder)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {seller.specialties.slice(0, 2).map((specialty, index) => (
                        <Badge key={index} variant="outline" className="rounded-full px-3 py-1 text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {seller.specialties.length > 2 && (
                        <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                          +{seller.specialties.length - 2} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex space-x-3">
                      <Button className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                      <Button variant="outline" className="rounded-2xl border-2 border-orange-500 text-orange-500 hover:bg-orange-50">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No sellers found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or location</p>
            <Button
              onClick={detectUserLocation}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl px-6 py-3"
            >
              <Navigation className="h-5 w-5 mr-2" />
              Update Location
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}



