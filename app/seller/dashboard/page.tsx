"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, ShoppingCart, DollarSign, Star, Plus, Edit, Eye, Trash2, Activity, X } from "lucide-react"
import { LoadingSpinner } from "@/components/modern/loading-spinner"
import { StatsCard } from "@/components/modern/stats-card"
import { SimpleBarChart, MetricCard } from "@/components/modern/data-visualization"
import { NotificationCenter } from "@/components/modern/notification-center"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatPriceKsh } from "@/lib/utils"

interface SellerDashboardStats {
  profile: {
    id: string
    businessName: string
    description: string
    status: string
    rating: number
    totalReviews: number
    user: {
      name: string
      email: string
    }
    frozen: boolean
    freezeReason: string
  }
  overview: {
    totalProducts: number
    totalOrders: number
    totalRevenue: number
    pendingOrders: number
  }
  recentOrders: Array<{
    id: string
    quantity: number
    price: number
    order: {
      id: string
      status: string
      paymentStatus: string
      createdAt: string
      user: {
        name: string
        email: string
      }
    }
    product: {
      name: string
      images: string[]
    }
  }>
  topProducts: Array<{
    id: string
    name: string
    price: number
    images: string[]
    orderCount: number
    rating: number
    stockQuantity: number
    category: {
      name: string
    }
  }>
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

export default function SellerDashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<SellerDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])
  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Convert createdAt to Date and map type to NotificationCenter type
        setNotifications(
          data.map((n: any) => ({
            ...n,
            type: n.type === "ACCOUNT_FREEZE" ? "error" : n.type === "ACCOUNT_UNFREEZE" ? "success" : "info",
            timestamp: new Date(n.createdAt),
          }))
        )
      })
      .catch((error) => {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      })
  }, [])
  const router = useRouter()
  const [viewProduct, setViewProduct] = useState<any>(null);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [isModalPresent, setIsModalPresent] = useState(false);

  useEffect(() => {
    if (status === "loading") return

      if (!session || !session.user || (session.user as any).role !== "SELLER") {
      redirect("/auth/login")
    }

    fetchDashboardStats()
  }, [session, status])

  useEffect(() => {
    // Only run on client
    if (typeof window !== "undefined") {
      setIsModalPresent(!!document.querySelector('.fixed.inset-0.bg-black\\/40'));
    }
  }, [viewProduct, editProduct]); // Add dependencies as needed

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/seller/dashboard")
      if (response.ok) {
        const data = await response.json()
        console.log('[DEBUG] Dashboard Data Received:', {
          totalRevenue: data.overview?.totalRevenue,
          totalRevenueType: typeof data.overview?.totalRevenue,
          totalOrders: data.overview?.totalOrders,
          monthlyStats: data.monthlyStats,
          dailyStats: data.dailyStats
        })
        console.log('[DEBUG] Formatted Revenue:', formatPriceKsh(Number(data.overview?.totalRevenue) || 0))
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationAction = (id: string, action: "read" | "remove") => {
    if (action === "read") {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } else {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }
  }

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    )
  }



  console.log('viewProduct:', viewProduct, 'editProduct:', editProduct);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">{stats.profile.businessName}</h1>
            <p className="text-gray-600">Welcome back, {stats.profile.user.name}</p>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-gray-900">{Number(stats.profile.rating || 0).toFixed(1)}</span>
                <span className="text-gray-600">({stats.profile.totalReviews} reviews)</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={(id) => handleNotificationAction(id, "read")}
              onMarkAllAsRead={markAllNotificationsRead}
              onRemove={(id) => handleNotificationAction(id, "remove")}
            />
            <Badge
              variant={stats.profile.status === "APPROVED" ? "default" : "secondary"}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white"
            >
              {stats.profile.status}
            </Badge>
          </div>
        </div>

        {/* Status Warning for Pending Sellers or Frozen Sellers */}
        {(stats.profile.status !== "APPROVED" || stats.profile.frozen) && (
          <Alert className={`mb-8 rounded-2xl ${stats.profile.frozen ? 'bg-red-50 border-red-200 text-red-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
            <AlertDescription className="flex items-center">
              <span className="mr-2">{stats.profile.frozen ? '⛔' : '⚠️'}</span>
              {stats.profile.frozen
                ? (<span>Your seller account is <b>frozen</b>. Reason: {stats.profile.freezeReason || 'No reason provided.'} You cannot perform seller actions until your account is unfrozen by an admin.</span>)
                : (<span>Your seller account is currently {stats.profile.status.toLowerCase()}. You'll be able to add products once your account is approved by an administrator.</span>)}
            </AlertDescription>
          </Alert>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Products"
            value={stats.overview.totalProducts}
            icon={Package}
            gradient="from-blue-500 to-blue-600"
            bgColor="bg-blue-50"
            textColor="text-blue-600"
            change="+5%"
            changeType="positive"
          />
          <StatsCard
            title="Total Orders"
            value={stats.overview.totalOrders}
            icon={ShoppingCart}
            gradient="from-green-500 to-green-600"
            bgColor="bg-green-50"
            textColor="text-green-600"
            change="+12%"
            changeType="positive"
          />
          <StatsCard
            title="Total Revenue"
            value={formatPriceKsh(Number(stats.overview.totalRevenue) || 0)}
            icon={DollarSign}
            gradient="from-orange-500 to-orange-600"
            bgColor="bg-orange-50"
            textColor="text-orange-600"
            change="+18%"
            changeType="positive"
          />
          <StatsCard
            title="Pending Orders"
            value={stats.overview.pendingOrders}
            icon={Activity}
            gradient="from-purple-500 to-purple-600"
            bgColor="bg-purple-50"
            textColor="text-purple-600"
            change="+3%"
            changeType="positive"
          />
        </div>

        {/* Disable Add Product button if frozen */}
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => router.push("/seller/products")}
            disabled={stats.profile.status !== "APPROVED" || stats.profile.frozen}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-2xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Analytics Charts */}
        <div className="space-y-6">
          {/* Revenue Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <Activity className="h-6 w-6" />
                    Revenue Analytics
                  </CardTitle>
                  <CardDescription className="text-orange-100">
                    Track your business performance over time
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
                          color: "#f97316",
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
                        data={stats.dailyStats.slice(0, 14).map((stat) => ({
                          label: new Date(stat.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                          value: stat.revenue,
                          color: "#8b5cf6",
                        }))} 
                        title="" 
                        className="bg-transparent" 
                      />
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-2xl">
                          <p className="text-sm text-purple-600 font-medium">Total Daily Orders</p>
                          <p className="text-2xl font-bold text-purple-900">
                            {stats.dailyStats.reduce((sum, stat) => sum + stat.orders, 0)}
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-2xl">
                          <p className="text-sm text-orange-600 font-medium">Total Daily Revenue</p>
                          <p className="text-2xl font-bold text-orange-900">
                            {formatPriceKsh(stats.dailyStats.reduce((sum, stat) => sum + stat.revenue, 0))}
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
          </div>
            
          <div className="space-y-6">
            <MetricCard
              title="Average Order Value"
                value={stats.overview.totalOrders > 0 ? Number(stats.overview.totalRevenue) / stats.overview.totalOrders : 0}
              format="currency"
              icon={<DollarSign className="h-6 w-6" />}
              trend="up"
              previousValue={35.5}
            />
            <MetricCard
              title="Customer Rating"
              value={stats.profile.rating}
              format="number"
              icon={<Star className="h-6 w-6" />}
              trend="up"
              previousValue={4.6}
            />
              
              {/* Quick Stats Cards */}
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-xl rounded-3xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Today's Performance</h3>
                    <Activity className="h-5 w-5" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100">Orders</span>
                      <span className="font-bold text-xl">
                        {stats.dailyStats[0]?.orders || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100">Revenue</span>
                      <span className="font-bold text-xl">
                        {formatPriceKsh(stats.dailyStats[0]?.revenue || 0)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm rounded-2xl p-2">
            <TabsTrigger value="orders" className="rounded-xl">
              Recent Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-xl">
              My Products
            </TabsTrigger>
            <TabsTrigger value="profile" className="rounded-xl">
              Business Profile
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">Recent Orders</CardTitle>
                <CardDescription className="text-gray-600">
                  Latest orders for your products ({stats.recentOrders.length} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentOrders.map((orderItem) => (
                      <TableRow key={orderItem.id} className="hover:bg-orange-50/50">
                        <TableCell className="font-mono text-sm">#{orderItem.order.id.slice(-8)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-500" />
                            </div>
                            <span className="font-semibold">{orderItem.product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">{orderItem.order.user.name}</p>
                            <p className="text-sm text-gray-600">{orderItem.order.user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold">{orderItem.quantity}</TableCell>
                        <TableCell className="font-bold">KSh {Number(orderItem.price * orderItem.quantity).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={orderItem.order.status === "DELIVERED" ? "default" : orderItem.order.status === "PREPARING" ? "secondary" : "outline"}
                            className="rounded-xl"
                          >
                            {orderItem.order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={orderItem.order.paymentStatus === "PAID" ? "default" : "destructive"}
                            className="rounded-xl"
                          >
                            {orderItem.order.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(orderItem.order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {orderItem.order.status !== "DELIVERED" && orderItem.order.status !== "CANCELLED" && (
                            <Select
                              value={orderItem.order.status}
                              onValueChange={async (value) => {
                                try {
                                  const res = await fetch(`/api/seller/orders/${orderItem.order.id}`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ status: value }),
                                  });
                                  if (res.ok) {
                                    toast.success("Order status updated!");
                                    fetchDashboardStats();
                                  } else {
                                    const data = await res.json();
                                    toast.error(data.error || "Failed to update order status");
                                  }
                                } catch (err) {
                                  toast.error("An error occurred while updating order status");
                                }
                              }}
                            >
                              <SelectTrigger className="w-32 rounded-2xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="PREPARING">Preparing</SelectItem>
                                <SelectItem value="READY">Ready</SelectItem>
                                <SelectItem value="DELIVERED">Delivered</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">My Products</CardTitle>
                    <CardDescription className="text-gray-600">
                      Manage your product catalog ({stats.topProducts.length} products)
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => router.push("/seller/products")}
                    disabled={stats.profile.status !== "APPROVED" || stats.profile.frozen}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-2xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stats.topProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-gradient-to-br from-orange-50 to-pink-50 p-6 rounded-2xl border border-orange-100 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-2xl flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => { console.log('VIEW CLICKED', product); setViewProduct(product); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => { console.log('EDIT CLICKED', product); setEditProduct(product); setEditForm({ name: product.name, price: product.price, stockQuantity: product.stockQuantity, category: product.category.name }); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="rounded-xl text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-bold text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.category.name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Price</p>
                            <p className="font-bold text-gray-900">{formatPriceKsh(Number(product.price || 0))}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Stock</p>
                            <p className="font-bold text-gray-900">{product.stockQuantity}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Orders</p>
                            <p className="font-bold text-orange-600">{product.orderCount}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Rating</p>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-bold text-gray-900">{Number(product.rating || 0).toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                        {product.stockQuantity < 10 && (
                          <Badge variant="destructive" className="rounded-xl">
                            Low Stock
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">Business Profile</CardTitle>
                <CardDescription className="text-gray-600">Your business information and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Business Name</h3>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-xl">{stats.profile.businessName}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Contact Email</h3>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-xl">{stats.profile.user.email}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Account Status</h3>
                      <Badge
                        variant={stats.profile.status === "APPROVED" ? "default" : "secondary"}
                        className="rounded-xl"
                      >
                        {stats.profile.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Business Description</h3>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-xl">{stats.profile.description}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Customer Rating</h3>
                      <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-xl">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-gray-900">{Number(stats.profile.rating || 0).toFixed(1)}</span>
                        <span className="text-gray-600">({stats.profile.totalReviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-2xl px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
                title="Total Products Sold"
                value={stats.overview.totalOrders}
                format="number"
                icon={<Package className="h-6 w-6" />}
                trend="up"
                previousValue={145}
              />
              <MetricCard
                title="Customer Satisfaction"
                value={stats.profile.rating}
                format="number"
                icon={<Star className="h-6 w-6" />}
                trend="up"
                previousValue={4.6}
              />
              <MetricCard
                title="Pending Orders"
                value={stats.overview.pendingOrders}
                format="number"
                icon={<Activity className="h-6 w-6" />}
                trend="neutral"
                previousValue={0}
              />
            </div>
            
            {/* Performance Insights */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <Activity className="h-6 w-6" />
                  Performance Insights
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Key metrics and trends for your business
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Best Performing Day */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl">
                    <h3 className="font-semibold text-green-800 mb-2">Best Performing Day</h3>
                    {stats.dailyStats.length > 0 ? (
                      <div>
                        <p className="text-2xl font-bold text-green-900">
                          {new Date(stats.dailyStats[0]?.day || '').toLocaleDateString('en-US', { weekday: 'long' })}
                        </p>
                        <p className="text-sm text-green-700">
                          {formatPriceKsh(stats.dailyStats[0]?.revenue || 0)} revenue
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
                      {stats.dailyStats.length > 0 
                        ? formatPriceKsh(stats.dailyStats.reduce((sum, stat) => sum + stat.revenue, 0) / stats.dailyStats.length)
                        : 'KSh 0'
                      }
                    </p>
                    <p className="text-sm text-blue-700">Last 30 days</p>
                  </div>
                  
                  {/* Conversion Rate */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-2xl">
                    <h3 className="font-semibold text-orange-800 mb-2">Product Performance</h3>
                    <p className="text-2xl font-bold text-orange-900">
                      {stats.topProducts.length > 0 ? stats.topProducts[0]?.name : 'No products'}
                    </p>
                    <p className="text-sm text-orange-700">
                      {stats.topProducts.length > 0 ? `${stats.topProducts[0]?.orderCount} orders` : 'No orders yet'}
                    </p>
                  </div>
                </div>
                
                {/* Recent Activity Timeline */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {stats.recentOrders.slice(0, 5).map((order, index) => (
                      <div key={order.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            New order for {order.product.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.order.user.name} • {formatPriceKsh(order.price * order.quantity)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(order.order.createdAt).toLocaleDateString()}
                          </p>
                          <Badge 
                            variant={order.order.status === 'DELIVERED' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {order.order.status}
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
      </div>
      {viewProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewProduct(null)}>
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{viewProduct.name}</h2>
                <Button variant="ghost" size="icon" onClick={() => setViewProduct(null)} className="rounded-2xl"><X className="h-5 w-5" /></Button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {viewProduct.images && viewProduct.images.length > 0 && (
                    <img src={viewProduct.images[0]} alt={viewProduct.name} className="w-32 h-32 object-cover rounded-xl" />
                  )}
                  <div>
                    <p className="text-lg font-bold text-orange-600">KSh {Number(viewProduct.price).toLocaleString()}</p>
                    <p className="text-gray-600">Stock: {viewProduct.stockQuantity}</p>
                    <p className="text-gray-600">Category: {viewProduct.category.name}</p>
                    <p className="text-gray-600">Orders: {viewProduct.orderCount}</p>
                    <p className="text-gray-600">Rating: {viewProduct.rating}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {viewProduct && !isModalPresent && (
        <div style={{color:'red',fontWeight:'bold'}}>Modal state set but modal not rendering!</div>
      )}
      {editProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditProduct(null)}>
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit {editProduct.name}</h2>
                <Button variant="ghost" size="icon" onClick={() => setEditProduct(null)} className="rounded-2xl"><X className="h-5 w-5" /></Button>
              </div>
              <form onSubmit={async e => {
                e.preventDefault();
                setSaving(true);
                try {
                  const res = await fetch(`/api/seller/products/${editProduct.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: editForm.name,
                      price: Number(editForm.price),
                      stock: Number(editForm.stockQuantity),
                      // Add more fields as needed
                    }),
                  });
                  if (res.ok) {
                    toast.success("Product updated successfully!");
                    setEditProduct(null);
                    fetchDashboardStats();
                  } else {
                    const data = await res.json();
                    toast.error(data.error || "Failed to update product");
                  }
                } catch (err) {
                  toast.error("An error occurred while updating product");
                } finally {
                  setSaving(false);
                }
              }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Product Name</label>
                  <input type="text" value={editForm.name} onChange={e => setEditForm((f: any) => ({ ...f, name: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-3 py-2" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Price (KSh)</label>
                  <input type="number" value={editForm.price} onChange={e => setEditForm((f: any) => ({ ...f, price: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-3 py-2" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Stock Quantity</label>
                  <input type="number" value={editForm.stockQuantity} onChange={e => setEditForm((f: any) => ({ ...f, stockQuantity: e.target.value }))} className="w-full rounded-xl border border-gray-200 px-3 py-2" />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setEditProduct(null)}>Cancel</Button>
                  <Button type="submit" variant="default" disabled={saving}>Save Changes</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {editProduct && !isModalPresent && (
        <div style={{color:'red',fontWeight:'bold'}}>Modal state set but modal not rendering!</div>
      )}
    </div>
  )
}
