"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Filter,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Star,
  Calendar,
  MapPin,
  Mail,
  Phone,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { SimpleBarChart, DonutChart, MetricCard } from "@/components/modern/data-visualization"
import { Switch } from "@/components/ui/switch"
import { formatPriceKsh } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface User {
  id: string
  name: string
  email: string
  role: "BUYER" | "SELLER" | "ADMIN"
  phone?: string
  address?: string
  createdAt: string
  sellerProfile?: {
    id: string
    businessName: string
    status: "PENDING" | "APPROVED" | "REJECTED"
    frozen?: boolean
    freezeReason?: string
  }
}

interface Order {
  id: string
  status: "PENDING" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED"
  paymentStatus: "PENDING" | "PAID" | "FAILED"
  total: number
    createdAt: string
    user: {
    id: string
      name: string
      email: string
    }
    orderItems: Array<{
    id: string
      quantity: number
      price: number
      product: {
      id: string
        name: string
        images: string[]
      seller: {
        businessName: string
      }
    }
  }>
}

interface Product {
    id: string
    name: string
    price: number
  stock: number
    images: string[]
    category: {
      name: string
    }
  seller: {
    businessName: string
  }
  averageRating: number
  reviewCount: number
  orderCount: number
  createdAt: string
  flashSale?: boolean
  isFeatured?: boolean
}

interface AdminStats {
  overview: {
    totalUsers: number
    totalProducts: number
    totalOrders: number
    totalRevenue: number
    pendingSellers: number
    recentOrders: number
  }
  users: User[]
  orders: Order[]
  products: Product[]
  monthlyStats: Array<{
    month: string
    orders: number
    revenue: number
  }>
  dailyStats: Array<{
    day: string
    orders: number
    revenue: number
  }>
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [freezeModal, setFreezeModal] = useState<{ sellerId: string, action: 'freeze' | 'unfreeze' } | null>(null)
  const [freezeReason, setFreezeReason] = useState("")
  const [freezing, setFreezing] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push("/auth/login")
      return
    }
    if (session.user.role !== "ADMIN") {
      router.push("/")
      return
    }
    fetchAdminStats()
  }, [session, router])

  const fetchAdminStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard")
      if (response.ok) {
        const data = await response.json()
        console.log("[Admin Dashboard] Received data:", data)
        console.log("[Admin Dashboard] Users:", data.users)
        console.log("[Admin Dashboard] Pending sellers count:", data.overview?.pendingSellers)
        console.log("[Admin Dashboard] Users with seller profiles:", data.users?.filter(u => u.sellerProfile))
        setStats(data)
      } else {
        console.error("[Admin Dashboard] API response not ok:", response.status)
        toast.error("Failed to load dashboard data")
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const updateSellerStatus = async (sellerId: string, status: string, reason?: string) => {
    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/admin/sellers/${sellerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, reason }),
      })

      if (response.ok) {
        const action = status === "PENDING" ? "unrejected" : status.toLowerCase()
        toast.success(`Seller ${action} successfully!`)
        fetchAdminStats()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to update seller status")
      }
    } catch (error) {
      console.error("Error updating seller status:", error)
      toast.error("An error occurred while updating seller status")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const updateProductFlashSale = async (productId: string, flashSale: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/flash-sale`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flashSale }),
      })
      if (response.ok) {
        toast.success("Flash sale status updated!")
        fetchAdminStats()
      } else {
        toast.error("Failed to update flash sale status")
      }
    } catch (error) {
      toast.error("Error updating flash sale status")
    }
  }

  const updateProductFeatured = async (productId: string, isFeatured: boolean) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/featured`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured }),
      })
      if (response.ok) {
        toast.success("Featured status updated!")
        fetchAdminStats()
      } else {
        toast.error("Failed to update featured status")
      }
    } catch (error) {
      toast.error("Error updating featured status")
    }
  }

  const handleFreezeSeller = async (sellerId: string, action: 'freeze' | 'unfreeze') => {
    setFreezing(true)
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frozen: action === 'freeze',
          reason: action === 'freeze' ? freezeReason : undefined,
        }),
      })
      if (res.ok) {
        toast.success(action === 'freeze' ? "Seller account frozen" : "Seller account unfrozen")
        fetchAdminStats()
        setFreezeModal(null)
        setFreezeReason("")
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to update seller account")
      }
    } catch (err) {
      toast.error("An error occurred while updating seller account")
    } finally {
      setFreezing(false)
    }
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

  const getRoleBadge = (role: string) => {
    const badges = {
      ADMIN: { label: "Admin", color: "bg-red-500" },
      SELLER: { label: "Seller", color: "bg-blue-500" },
      BUYER: { label: "Buyer", color: "bg-green-500" },
    }
    const badge = badges[role as keyof typeof badges]
    return (
      <Badge className={`${badge.color} text-white text-xs px-2 py-1 rounded-full`}>
        {badge.label}
      </Badge>
    )
  }

  const getOrderStatusBadge = (status: string) => {
    const badges = {
      PENDING: { label: "Pending", color: "bg-yellow-500" },
      PREPARING: { label: "Preparing", color: "bg-blue-500" },
      READY: { label: "Ready", color: "bg-green-500" },
      DELIVERED: { label: "Delivered", color: "bg-green-600" },
      CANCELLED: { label: "Cancelled", color: "bg-red-500" },
    }
    const badge = badges[status as keyof typeof badges]
    return (
      <Badge className={`${badge.color} text-white text-xs px-2 py-1 rounded-full`}>
        {badge.label}
      </Badge>
    )
  }

  const filteredUsers = Array.isArray(stats?.users)
    ? stats.users.filter((user) => {
        const matchesSearch = 
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = roleFilter === "all" || user.role === roleFilter
        const matchesStatus = statusFilter === "all" || 
          (statusFilter === "FROZEN" ? user.sellerProfile?.frozen : user.sellerProfile?.status === statusFilter)
        return matchesSearch && matchesRole && matchesStatus
      })
    : []



  const userRoleData = [
    { label: "Buyers", value: Array.isArray(stats?.users) ? stats.users.filter(u => u.role === "BUYER").length : 0, color: "#22c55e" },
    { label: "Sellers", value: Array.isArray(stats?.users) ? stats.users.filter(u => u.role === "SELLER").length : 0, color: "#3b82f6" },
    { label: "Admins", value: Array.isArray(stats?.users) ? stats.users.filter(u => u.role === "ADMIN").length : 0, color: "#ef4444" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load dashboard data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
              Admin{" "}
              <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Manage users, orders, and products across the platform
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-red-500 text-white px-3 py-1 rounded-full">
              Admin Panel
            </Badge>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={stats.overview.totalUsers}
            format="number"
            icon={<Users className="h-6 w-6" />}
            trend="up"
            previousValue={stats.overview.totalUsers - 5}
          />
          <MetricCard
            title="Total Products"
            value={stats.overview.totalProducts}
            format="number"
            icon={<Package className="h-6 w-6" />}
            trend="up"
            previousValue={stats.overview.totalProducts - 10}
          />
          <MetricCard
            title="Total Orders"
            value={stats.overview.totalOrders}
            format="number"
            icon={<ShoppingCart className="h-6 w-6" />}
            trend="up"
            previousValue={stats.overview.totalOrders - 15}
          />
          <MetricCard
            title="Total Revenue"
            value={Number(stats.overview.totalRevenue || 0)}
            format="currency"
            icon={<DollarSign className="h-6 w-6" />}
            trend="up"
            previousValue={Number(stats.overview.totalRevenue || 0) - 500}
          />
        </div>

        {/* Analytics Charts */}
        <div className="space-y-6 mb-8">
          {/* Revenue Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <TrendingUp className="h-6 w-6" />
                    Platform Analytics
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Track platform performance and revenue trends
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <Tabs defaultValue="monthly" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-xl p-1 mb-6">
                      <TabsTrigger value="monthly" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Monthly View
                      </TabsTrigger>
                      <TabsTrigger value="daily" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Daily View
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="monthly" className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue Trend</h3>
                        <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full">
                          Last 6 Months
                        </Badge>
          </div>
                      <SimpleBarChart 
                        data={stats.monthlyStats.map((stat) => ({
                          label: stat.month,
                          value: stat.revenue,
                          color: "#3b82f6",
                        }))} 
                        title="" 
                        className="bg-transparent" 
                      />
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-2xl">
                          <p className="text-sm text-blue-600 font-medium">Total Monthly Orders</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {stats.monthlyStats.reduce((sum, stat) => sum + stat.orders, 0)}
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-2xl">
                          <p className="text-sm text-green-600 font-medium">Total Monthly Revenue</p>
                          <p className="text-2xl font-bold text-green-900">
                            {formatPriceKsh(stats.monthlyStats.reduce((sum, stat) => sum + stat.revenue, 0))}
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="daily" className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Daily Revenue Trend</h3>
                        <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-full">
                          Last 30 Days
                        </Badge>
                      </div>
                      <SimpleBarChart 
                        data={stats.dailyStats?.slice(0, 14).map((stat) => ({
                          label: new Date(stat.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                          value: stat.revenue,
                          color: "#8b5cf6",
                        })) || []} 
                        title="" 
                        className="bg-transparent" 
                      />
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-2xl">
                          <p className="text-sm text-purple-600 font-medium">Total Daily Orders</p>
                          <p className="text-2xl font-bold text-purple-900">
                            {stats.dailyStats?.reduce((sum, stat) => sum + stat.orders, 0) || 0}
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-2xl">
                          <p className="text-sm text-orange-600 font-medium">Total Daily Revenue</p>
                          <p className="text-2xl font-bold text-orange-900">
                            {formatPriceKsh(stats.dailyStats?.reduce((sum, stat) => sum + stat.revenue, 0) || 0)}
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              {/* Enhanced User Distribution Card - Responsive & Beautiful */}
              <Card className="bg-white/80 backdrop-blur-md border-0 shadow-xl rounded-3xl flex flex-col items-center p-6">
                <div className="w-full flex flex-col items-center mb-4">
                  <h3 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">User Distribution</h3>
                  <p className="text-gray-600 text-base mb-4">Breakdown of platform users by role</p>
                </div>
                <div className="flex flex-col md:flex-row items-center w-full gap-8 transition-all duration-300">
                  <div className="flex-1 flex flex-col items-center justify-center mb-6 md:mb-0">
          <DonutChart
              data={userRoleData}
                      title=""
                      centerValue={<span className="text-4xl font-black text-gray-900 drop-shadow-lg">{stats.overview.totalUsers}</span>}
                      centerLabel={<span className="text-base font-semibold text-gray-600">Total Users</span>}
                      className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 transition-all duration-300"
          />
          </div>
                  Only one legend below, not repeated
                  <div className="flex-1 flex flex-col gap-3 items-center md:items-start w-full max-w-xs">
                    {userRoleData.filter((role, idx, arr) => arr.findIndex(r => r.label === role.label) === idx).map(role => (
                      <div
                        key={role.label}
                        className="flex items-center gap-3 w-full group hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 rounded-xl px-3 py-2 transition-all duration-200 cursor-pointer"
                      >
                        <span className="inline-block w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all duration-200" style={{ background: role.color }}></span>
                        <span className="font-semibold text-gray-800 group-hover:text-orange-600 transition-all duration-200">{role.label}</span>
                        <span className="ml-auto text-gray-500 font-bold group-hover:text-pink-600 transition-all duration-200">{role.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              
              {/* Quick Stats Cards */}
              <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0 shadow-xl rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Today's Performance</h3>
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-100">Orders</span>
                      <span className="font-bold text-xl">
                        {stats.dailyStats?.[0]?.orders || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-100">Revenue</span>
                      <span className="font-bold text-xl">
                        {formatPriceKsh(stats.dailyStats?.[0]?.revenue || 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm rounded-2xl p-2">
            <TabsTrigger value="users" className="rounded-xl">
              Users ({stats.overview.totalUsers})
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-xl">
              Orders ({stats.overview.totalOrders})
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-xl">
              Products ({stats.overview.totalProducts})
            </TabsTrigger>
            <TabsTrigger value="sellers" className="rounded-xl">
              Pending Sellers ({stats.overview.pendingSellers})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl">
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">User Management</CardTitle>
                <CardDescription className="text-gray-600">
                      Manage all users across the platform
                </CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 pr-4 py-2 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 bg-white/50 backdrop-blur-sm"
                      />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="rounded-2xl border-2 border-gray-200 focus:border-orange-500 bg-white/50 backdrop-blur-sm">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="BUYER">Buyers</SelectItem>
                        <SelectItem value="SELLER">Sellers</SelectItem>
                        <SelectItem value="ADMIN">Admins</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="rounded-2xl border-2 border-gray-200 focus:border-orange-500 bg-white/50 backdrop-blur-sm">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                        <SelectItem value="FROZEN">Frozen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-orange-50/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-white" />
                            </div>
                              <div>
                              <p className="font-semibold">{user.name}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(user.role)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {user.phone && (
                              <p className="text-sm flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {user.phone}
                              </p>
                            )}
                            {user.address && (
                              <p className="text-sm flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {user.address}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.sellerProfile ? (
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(user.sellerProfile.status)}
                              {user.sellerProfile.frozen && (
                                <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full mt-1">
                                  ❄️ Frozen
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <Badge className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                              Active
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                              className="rounded-xl"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-xl"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.role === "SELLER" && user.sellerProfile && (
                              user.sellerProfile.status === "REJECTED" && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="rounded-xl"
                                  onClick={() => updateSellerStatus(user.sellerProfile.id, "PENDING")}
                                >
                                  Unreject
                                </Button>
                              )
                            )}
                            {user.role === "SELLER" && user.sellerProfile && (
                              user.sellerProfile.frozen ? (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="rounded-xl"
                                  onClick={() => setFreezeModal({ sellerId: user.sellerProfile.id, action: 'unfreeze' })}
                                >
                                  Unfreeze
                                </Button>
                              ) : (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="rounded-xl"
                                  onClick={() => setFreezeModal({ sellerId: user.sellerProfile.id, action: 'freeze' })}
                                >
                                  Freeze
                                </Button>
                              )
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">Recent Orders</CardTitle>
                <CardDescription className="text-gray-600">
                  Monitor all orders across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(Array.isArray(stats?.orders) ? stats.orders.slice(0, 10) : []).map((order) => (
                      <TableRow key={order.id} className="hover:bg-orange-50/50">
                        <TableCell className="font-mono text-sm">#{order.id.slice(-8)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{order.user.name}</p>
                            <p className="text-sm text-gray-600">{order.user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {order.orderItems.slice(0, 2).map((item) => (
                              <div key={item.id} className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded overflow-hidden">
                                  <Image
                                    src={item.product.images[0] || "/placeholder.svg"}
                                    alt={item.product.name}
                                    width={24}
                                    height={24}
                                    className="object-cover"
                                  />
                                </div>
                                <span className="text-sm">{item.product.name}</span>
                              </div>
                            ))}
                            {order.orderItems.length > 2 && (
                              <p className="text-xs text-gray-500">
                                +{order.orderItems.length - 2} more items
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold">
                          {formatPriceKsh(Number(order.total || 0))}
                        </TableCell>
                        <TableCell>
                          {getOrderStatusBadge(order.status)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={order.paymentStatus === "PAID" ? "default" : "destructive"}
                            className="rounded-xl"
                          >
                            {order.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">All Products</CardTitle>
                <CardDescription className="text-gray-600">
                  Overview of all products on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(Array.isArray(stats?.products) ? stats.products : []).map((product) => (
                    <Card key={product.id} className="border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
                      <div className="relative aspect-square overflow-hidden rounded-t-2xl">
                        <Image
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">by {product.seller.businessName}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-lg text-orange-600">{formatPriceKsh(Number(product.price || 0))}</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold">{Number(product.averageRating || 0).toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-semibold text-gray-700">Flash Sale</span>
                          <Switch
                            checked={!!product.flashSale}
                            onCheckedChange={(checked) => updateProductFlashSale(product.id, checked)}
                            className="ml-2"
                          />
                          </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-semibold text-gray-700">Featured</span>
                          <Switch
                            checked={!!product.isFeatured}
                            onCheckedChange={(checked) => updateProductFeatured(product.id, checked)}
                            className="ml-2"
                          />
                    </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Sellers Tab */}
          <TabsContent value="sellers" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">Pending Seller Approvals</CardTitle>
                <CardDescription className="text-gray-600">
                  Review and approve seller applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const allUsers = Array.isArray(stats?.users) ? stats.users : []
                    const pendingSellers = allUsers.filter(user => user.role === "SELLER" && user.sellerProfile?.status === "PENDING")
                    return pendingSellers.map((user) => (
                      <Card key={user.id} className="border-0 shadow-lg rounded-2xl">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900">{user.name}</h3>
                                <p className="text-sm text-gray-600">{user.email}</p>
                                <p className="text-sm font-medium text-blue-600">
                                  {user.sellerProfile?.businessName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              {getStatusBadge(user.sellerProfile?.status || "PENDING")}
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => updateSellerStatus(user.sellerProfile!.id, "APPROVED")}
                                  disabled={updatingStatus}
                                  className="bg-green-500 hover:bg-green-600 rounded-2xl"
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => updateSellerStatus(user.sellerProfile!.id, "REJECTED")}
                                  disabled={updatingStatus}
                                  variant="destructive"
                                  className="rounded-2xl"
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  })()}
                  
                  {(() => {
                    const allUsers = Array.isArray(stats?.users) ? stats.users : []
                    const pendingSellers = allUsers.filter(user => user.role === "SELLER" && user.sellerProfile?.status === "PENDING")
                    return pendingSellers.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No pending approvals</h3>
                      <p className="text-gray-600">All seller applications have been reviewed</p>
                    </div>
                    )
                  })()}
            </div>
              </CardContent>
            </Card>

            {/* Rejected Sellers Section */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <UserX className="h-6 w-6" />
                  Rejected Sellers
                </CardTitle>
                <CardDescription className="text-red-100">
                  Review and potentially unreject rejected seller applications
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {(() => {
                    const allUsers = Array.isArray(stats?.users) ? stats.users : []
                    const rejectedSellers = allUsers.filter(user => user.role === "SELLER" && user.sellerProfile?.status === "REJECTED")
                    return rejectedSellers.map((user) => (
                      <Card key={user.id} className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                                <UserX className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900">{user.name}</h3>
                                <p className="text-sm text-gray-600">{user.email}</p>
                                <p className="text-sm font-medium text-red-600">
                                  {user.sellerProfile?.businessName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              {getStatusBadge(user.sellerProfile?.status || "REJECTED")}
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => updateSellerStatus(user.sellerProfile!.id, "PENDING")}
                                  disabled={updatingStatus}
                                  className="bg-blue-500 hover:bg-blue-600 rounded-2xl"
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Unreject
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  })()}
                  
                  {(() => {
                    const allUsers = Array.isArray(stats?.users) ? stats.users : []
                    const rejectedSellers = allUsers.filter(user => user.role === "SELLER" && user.sellerProfile?.status === "REJECTED")
                    return rejectedSellers.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <UserCheck className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">No rejected sellers</h3>
                      <p className="text-gray-600">All seller applications are either approved or pending</p>
                    </div>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Detailed Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Average Order Value"
                value={stats.overview.totalOrders > 0 ? Number(stats.overview.totalRevenue) / stats.overview.totalOrders : 0}
                format="currency"
                icon={<DollarSign className="h-6 w-6" />}
                trend="up"
                previousValue={32.5}
              />
              <MetricCard
                title="Platform Growth"
                value={stats.overview.totalUsers}
                format="number"
                icon={<TrendingUp className="h-6 w-6" />}
                trend="up"
                previousValue={stats.overview.totalUsers - 10}
              />
              <MetricCard
                title="Product Diversity"
                value={stats.overview.totalProducts}
                format="number"
                icon={<Package className="h-6 w-6" />}
                trend="up"
                previousValue={stats.overview.totalProducts - 5}
              />
              <MetricCard
                title="Conversion Rate"
                value={stats.overview.totalOrders > 0 ? (stats.overview.totalOrders / stats.overview.totalUsers * 100).toFixed(1) : 0}
                format="percentage"
                icon={<ShoppingCart className="h-6 w-6" />}
                trend="up"
                previousValue={15.2}
              />
            </div>
            
            {/* Performance Insights */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <TrendingUp className="h-6 w-6" />
                  Platform Performance Insights
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Key metrics and trends for the entire platform
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Best Performing Month */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl">
                    <h3 className="font-semibold text-green-800 mb-2">Best Performing Month</h3>
                    {stats.monthlyStats.length > 0 ? (
                      <div>
                        <p className="text-2xl font-bold text-green-900">
                          {stats.monthlyStats[0]?.month || 'No data'}
                        </p>
                        <p className="text-sm text-green-700">
                          {formatPriceKsh(stats.monthlyStats[0]?.revenue || 0)} revenue
                        </p>
                      </div>
                    ) : (
                      <p className="text-green-700">No data available</p>
                    )}
                  </div>
                  
                  {/* Average Daily Revenue */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl">
                    <h3 className="font-semibold text-blue-800 mb-2">Average Daily Revenue</h3>
                    <p className="text-2xl font-bold text-blue-900">
                      {stats.dailyStats?.length > 0 
                        ? formatPriceKsh(stats.dailyStats.reduce((sum, stat) => sum + stat.revenue, 0) / stats.dailyStats.length)
                        : 'KSh 0'
                      }
                    </p>
                    <p className="text-sm text-blue-700">Last 30 days</p>
                  </div>
                  
                  {/* User Growth Rate */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-2xl">
                    <h3 className="font-semibold text-orange-800 mb-2">User Growth Rate</h3>
                    <p className="text-2xl font-bold text-orange-900">
                      +{Math.round((stats.overview.totalUsers / 100) * 10)}%
                    </p>
                    <p className="text-sm text-orange-700">This month</p>
                  </div>
                </div>
                
                {/* Recent Activity Timeline */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Platform Activity</h3>
                  <div className="space-y-3">
                    {stats.orders.slice(0, 5).map((order, index) => (
                      <div key={order.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            New order #{order.id.slice(-8)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.user.name} • {formatPriceKsh(order.total)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <Badge 
                            variant={order.status === 'DELIVERED' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
            </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedUser(null)}
                    className="rounded-2xl"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                      <p className="text-gray-600">{selectedUser.email}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {getRoleBadge(selectedUser.role)}
                        {selectedUser.sellerProfile && getStatusBadge(selectedUser.sellerProfile.status)}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Contact Information</h4>
                      <div className="space-y-2">
                        {selectedUser.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{selectedUser.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{selectedUser.email}</span>
                        </div>
                        {selectedUser.address && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{selectedUser.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Account Information</h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-600">Member since:</span>
                          <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                        </div>
                        {selectedUser.sellerProfile && (
                          <div>
                            <span className="text-gray-600">Business name:</span>
                            <p className="font-medium">{selectedUser.sellerProfile.businessName}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {freezeModal && (
          <Dialog open onOpenChange={() => setFreezeModal(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{freezeModal.action === 'freeze' ? 'Freeze Seller Account' : 'Unfreeze Seller Account'}</DialogTitle>
              </DialogHeader>
              {freezeModal.action === 'freeze' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for freezing (required)</label>
                  <Input
                    value={freezeReason}
                    onChange={e => setFreezeReason(e.target.value)}
                    placeholder="Enter reason for freezing account"
                    className="w-full"
                  />
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setFreezeModal(null)} disabled={freezing}>Cancel</Button>
                <Button
                  variant={freezeModal.action === 'freeze' ? 'destructive' : 'default'}
                  onClick={() => handleFreezeSeller(freezeModal.sellerId, freezeModal.action)}
                  disabled={freezing || (freezeModal.action === 'freeze' && !freezeReason)}
                >
                  {freezeModal.action === 'freeze' ? 'Freeze Account' : 'Unfreeze Account'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
