"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Star,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Package,
  ShoppingCart,
  Heart,
  Settings,
  LogOut,
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  role: "BUYER" | "SELLER" | "ADMIN"
  sellerProfile?: {
    id: string
    businessName: string
    description: string
    status: "PENDING" | "APPROVED" | "REJECTED"
    rating: number
    totalReviews: number
    logo?: string
  }
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    businessName: "",
    businessDescription: "",
  })

  useEffect(() => {
    if (!session) {
      router.push("/auth/login")
      return
    }
    fetchProfile()
  }, [session, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          businessName: data.sellerProfile?.businessName || "",
          businessDescription: data.sellerProfile?.description || "",
        })
      } else {
        setError("Failed to load profile")
      }
    } catch (error) {
      setError("An error occurred while loading your profile")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setIsEditing(false)
        toast.success("Profile updated successfully!")
        
        // Update session with new data
        await update({
          ...session,
          user: {
            ...session?.user,
            name: formData.name,
          },
        })
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update profile")
      }
    } catch (error) {
      setError("An error occurred while updating your profile")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: profile?.name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      businessName: profile?.sellerProfile?.businessName || "",
      businessDescription: profile?.sellerProfile?.description || "",
    })
    setIsEditing(false)
    setError("")
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { label: "Pending", color: "bg-yellow-500" },
      APPROVED: { label: "Approved", color: "bg-green-500" },
      REJECTED: { label: "Rejected", color: "bg-red-500" },
    }
    const badge = badges[status as keyof typeof badges]
    return (
      <Badge className={`${badge.color} text-white text-xs px-2 py-1 rounded-full`}>
        {badge.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            My{" "}
            <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              Profile
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your account settings, personal information, and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-12 w-12 text-white" />
                  </div>
                  <Button
                      size="icon"
                      variant="ghost"
                      className="absolute bottom-0 right-0 bg-white shadow-lg rounded-full h-8 w-8"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile.name}</h2>
                  <p className="text-gray-600 mb-3">{profile.email}</p>
                  <Badge className="bg-orange-500 text-white px-3 py-1 rounded-full">
                  {profile.role}
                </Badge>
                </div>

                {profile.sellerProfile && (
                  <div className="space-y-4 mb-6">
                    <Separator />
                    <div className="text-center">
                      <h3 className="font-bold text-gray-900 mb-2">{profile.sellerProfile.businessName}</h3>
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-gray-900">{Number(profile.sellerProfile.rating || 0).toFixed(1)}</span>
                        <span className="text-gray-600">({profile.sellerProfile.totalReviews} reviews)</span>
                      </div>
                      {getStatusBadge(profile.sellerProfile.status)}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>Member since {new Date(profile.createdAt).toLocaleDateString()}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile.address && (
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.address}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
                <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm rounded-2xl p-2">
                    <TabsTrigger value="personal" className="rounded-xl">
                      Personal Info
                    </TabsTrigger>
                    {profile.role === "SELLER" && (
                      <TabsTrigger value="business" className="rounded-xl">
                    Business Profile
                      </TabsTrigger>
                    )}
                <TabsTrigger value="preferences" className="rounded-xl">
                  Preferences
                </TabsTrigger>
                  </TabsList>

              {/* Personal Information Tab */}
                  <TabsContent value="personal" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">Personal Information</CardTitle>
                        <CardDescription className="text-gray-600">
                          Update your personal details and contact information
                        </CardDescription>
                      </div>
                      {!isEditing ? (
                        <Button
                          onClick={() => setIsEditing(true)}
                          className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-2xl"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button
                            onClick={handleCancel}
                            variant="outline"
                            className="rounded-2xl"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {error && (
                      <Alert className="border-red-200 bg-red-50 rounded-2xl">
                        <AlertDescription className="text-red-700 font-medium">{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input
                            value={formData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            disabled={!isEditing}
                            className="pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 bg-white/50 backdrop-blur-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            disabled={!isEditing}
                            className="pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 bg-white/50 backdrop-blur-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input
                            value={formData.phone}
                            onChange={(e) => handleInputChange("phone", e.target.value)}
                            disabled={!isEditing}
                            placeholder="Enter your phone number"
                            className="pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 bg-white/50 backdrop-blur-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input
                            value={formData.address}
                            onChange={(e) => handleInputChange("address", e.target.value)}
                            disabled={!isEditing}
                            placeholder="Enter your address"
                            className="pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 bg-white/50 backdrop-blur-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                  </TabsContent>

              {/* Business Profile Tab */}
                  {profile.role === "SELLER" && (
                    <TabsContent value="business" className="space-y-6">
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl font-bold text-gray-900">Business Profile</CardTitle>
                          <CardDescription className="text-gray-600">
                            Manage your business information and settings
                          </CardDescription>
                        </div>
                        {!isEditing ? (
                          <Button
                            onClick={() => setIsEditing(true)}
                            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Business
                          </Button>
                        ) : (
                          <div className="flex space-x-2">
                            <Button
                              onClick={handleSave}
                              disabled={saving}
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-2xl"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              {saving ? "Saving..." : "Save Changes"}
                            </Button>
                            <Button
                              onClick={handleCancel}
                              variant="outline"
                              className="rounded-2xl"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">Business Name</label>
                          <div className="relative">
                            <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                              value={formData.businessName}
                              onChange={(e) => handleInputChange("businessName", e.target.value)}
                              disabled={!isEditing}
                              className="pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 bg-white/50 backdrop-blur-sm"
                            />
                            </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">Business Description</label>
                            <Textarea
                            value={formData.businessDescription}
                            onChange={(e) => handleInputChange("businessDescription", e.target.value)}
                            disabled={!isEditing}
                            placeholder="Describe your business, specialties, and what makes you unique..."
                            className="rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 bg-white/50 backdrop-blur-sm"
                              rows={4}
                            />
                        </div>
                              </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Preferences Tab */}
              <TabsContent value="preferences" className="space-y-6">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-gray-900">Account Preferences</CardTitle>
                    <CardDescription className="text-gray-600">
                      Manage your account settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-bold text-gray-900">Quick Actions</h3>
                        <div className="space-y-3">
                          <Link href="/orders">
                            <Button variant="outline" className="w-full justify-start rounded-2xl">
                              <ShoppingCart className="h-4 w-4 mr-3" />
                              View My Orders
                            </Button>
                          </Link>
                          {profile.role === "SELLER" && (
                            <Link href="/seller/products">
                              <Button variant="outline" className="w-full justify-start rounded-2xl">
                                <Package className="h-4 w-4 mr-3" />
                                Manage Products
                              </Button>
                            </Link>
                          )}
                          <Link href="/cart">
                            <Button variant="outline" className="w-full justify-start rounded-2xl">
                              <Heart className="h-4 w-4 mr-3" />
                              Shopping Cart
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-bold text-gray-900">Account Settings</h3>
                        <div className="space-y-3">
                          <Button variant="outline" className="w-full justify-start rounded-2xl">
                            <Settings className="h-4 w-4 mr-3" />
                            Change Password
                          </Button>
                          <Button variant="outline" className="w-full justify-start rounded-2xl">
                            <Shield className="h-4 w-4 mr-3" />
                            Privacy Settings
                    </Button>
                          <Button variant="outline" className="w-full justify-start rounded-2xl text-red-600 hover:text-red-700">
                            <LogOut className="h-4 w-4 mr-3" />
                            Delete Account
                    </Button>
                  </div>
                      </div>
                    </div>
              </CardContent>
            </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
