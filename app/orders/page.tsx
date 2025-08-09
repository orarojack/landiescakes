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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Star,
  Calendar,
  MapPin,
  Phone,
  Mail,
  RefreshCw,
  ShoppingBag,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { RatingStars, ReviewForm } from "@/components/modern/rating-stars"

interface OrderItem {
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
}

interface Order {
  id: string
  status: "PENDING" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED"
  paymentStatus: "PENDING" | "PAID" | "FAILED"
  total: number
  createdAt: string
  updatedAt: string
  orderItems: OrderItem[]
}

export default function OrdersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [lastOrderStatuses, setLastOrderStatuses] = useState<Record<string, string>>({});
  const [reviewModal, setReviewModal] = useState<{ productId: string, orderId: string } | null>(null)
  const [reviewStatus, setReviewStatus] = useState<Record<string, { hasReviewed: boolean, userReview: any }>>({})
  const [reviewLoading, setReviewLoading] = useState<string | null>(null)
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push("/auth/login")
      return
    }
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  }, [session, router])

  // Fetch review status for delivered products
  useEffect(() => {
    if (!session) return
    const fetchReviews = async () => {
      const deliveredProducts = orders
        .filter(order => order.status === "DELIVERED")
        .flatMap(order => order.orderItems.map(item => item.product.id))
      const uniqueProductIds = Array.from(new Set(deliveredProducts))
      const statusObj: Record<string, { hasReviewed: boolean, userReview: any }> = {}
      await Promise.all(uniqueProductIds.map(async (productId) => {
        try {
          const res = await fetch(`/api/products/${productId}/review`)
          if (res.ok) {
            const data = await res.json()
            statusObj[productId] = {
              hasReviewed: data.hasReviewed,
              userReview: data.userReview
            }
          }
        } catch {}
      }))
      setReviewStatus(statusObj)
    }
    fetchReviews()
  }, [orders, session])

  const handleSubmitReview = async (productId: string, rating: number, comment: string) => {
    setSubmittingReview(true)
    try {
      const res = await fetch(`/api/products/${productId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment })
      })
      if (res.ok) {
        toast.success("Review submitted!")
        setReviewModal(null)
        // Refresh review status
        const reviewRes = await fetch(`/api/products/${productId}/review`)
        if (reviewRes.ok) {
          const data = await reviewRes.json()
          setReviewStatus(prev => ({ ...prev, [productId]: { hasReviewed: data.hasReviewed, userReview: data.userReview } }))
        }
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || "Failed to submit review")
      }
    } catch (e) {
      toast.error("Failed to submit review")
    } finally {
      setSubmittingReview(false)
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
        // Check for status changes
        const newStatuses: Record<string, string> = {};
        (Array.isArray(data) ? data : []).forEach((order: Order) => {
          newStatuses[order.id] = order.status;
          if (lastOrderStatuses[order.id] && lastOrderStatuses[order.id] !== order.status) {
            toast.info(`Order #${order.id.slice(-8)} status updated: ${order.status}`);
          }
        });
        setLastOrderStatuses(newStatuses);
      } else {
        console.error("Failed to fetch orders:", response.status);
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { label: "Pending", color: "bg-yellow-500", icon: Clock },
      PREPARING: { label: "Preparing", color: "bg-blue-500", icon: Package },
      READY: { label: "Ready", color: "bg-green-500", icon: CheckCircle },
      DELIVERED: { label: "Delivered", color: "bg-green-600", icon: Truck },
      CANCELLED: { label: "Cancelled", color: "bg-red-500", icon: AlertCircle },
    }
    const badge = badges[status as keyof typeof badges]
    const Icon = badge.icon
    return (
      <Badge className={`${badge.color} text-white text-xs px-3 py-1 rounded-full flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span>{badge.label}</span>
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const badges = {
      PENDING: { label: "Pending", color: "bg-yellow-500" },
      PAID: { label: "Paid", color: "bg-green-500" },
      FAILED: { label: "Failed", color: "bg-red-500" },
    }
    const badge = badges[status as keyof typeof badges]
    return (
      <Badge className={`${badge.color} text-white text-xs px-2 py-1 rounded-full`}>
        {badge.label}
      </Badge>
    )
  }

  const getStatusStep = (status: string) => {
    const steps = [
      { key: "PENDING", label: "Order Placed", icon: ShoppingBag },
      { key: "PREPARING", label: "Preparing", icon: Package },
      { key: "READY", label: "Ready", icon: CheckCircle },
      { key: "DELIVERED", label: "Delivered", icon: Truck },
    ]
    
    const currentIndex = steps.findIndex(step => step.key === status)
    return { steps, currentIndex }
  }

  const filteredOrders = (orders ?? []).filter((order) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getOrdersByStatus = (status: string) => {
    return filteredOrders.filter(order => status === "all" || order.status === status)
  }

  const getStatusCounts = () => {
    const counts = {
      all: orders.length,
      PENDING: orders.filter(o => o.status === "PENDING").length,
      PREPARING: orders.filter(o => o.status === "PREPARING").length,
      READY: orders.filter(o => o.status === "READY").length,
      DELIVERED: orders.filter(o => o.status === "DELIVERED").length,
      CANCELLED: orders.filter(o => o.status === "CANCELLED").length,
    }
    return counts
  }

  const statusCounts = getStatusCounts()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
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
              My{" "}
              <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Orders
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Track your orders and view order history
            </p>
          </div>
          <Button
            onClick={fetchOrders}
            variant="outline"
            className="rounded-2xl border-2 border-orange-200 text-orange-600 hover:bg-orange-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search by order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 bg-white/80 backdrop-blur-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="rounded-2xl border-2 border-gray-200 focus:border-orange-500 bg-white/80 backdrop-blur-sm">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses ({statusCounts.all})</SelectItem>
                <SelectItem value="PENDING">Pending ({statusCounts.PENDING})</SelectItem>
                <SelectItem value="PREPARING">Preparing ({statusCounts.PREPARING})</SelectItem>
                <SelectItem value="READY">Ready ({statusCounts.READY})</SelectItem>
                <SelectItem value="DELIVERED">Delivered ({statusCounts.DELIVERED})</SelectItem>
                <SelectItem value="CANCELLED">Cancelled ({statusCounts.CANCELLED})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Orders Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm rounded-2xl p-2">
            <TabsTrigger value="all" className="rounded-xl">
              All ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="PENDING" className="rounded-xl">
              Pending ({statusCounts.PENDING})
            </TabsTrigger>
            <TabsTrigger value="PREPARING" className="rounded-xl">
              Preparing ({statusCounts.PREPARING})
            </TabsTrigger>
            <TabsTrigger value="READY" className="rounded-xl">
              Ready ({statusCounts.READY})
            </TabsTrigger>
            <TabsTrigger value="DELIVERED" className="rounded-xl">
              Delivered ({statusCounts.DELIVERED})
            </TabsTrigger>
          </TabsList>

          {["all", "PENDING", "PREPARING", "READY", "DELIVERED"].map((status) => (
            <TabsContent key={status} value={status} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {getOrdersByStatus(status).map((order) => (
                  <Card key={order.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-bold text-gray-900">
                            Order #{order.id.slice(-8)}
                          </CardTitle>
                          <CardDescription className="text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {getStatusBadge(order.status)}
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Order Progress */}
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                          <Truck className="h-4 w-4 mr-2" />
                          Order Progress
                        </h4>
                        <div className="flex items-center justify-between">
                          {getStatusStep(order.status).steps.map((step, index) => {
                            const { currentIndex } = getStatusStep(order.status)
                            const isCompleted = index <= currentIndex
                            const isCurrent = index === currentIndex
                            const Icon = step.icon
                            
                            return (
                              <div key={step.key} className="flex flex-col items-center space-y-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  isCompleted ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-400"
                                } ${isCurrent ? "ring-2 ring-orange-300" : ""}`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <p className={`text-xs text-center ${
                                  isCompleted ? "text-gray-900 font-medium" : "text-gray-400"
                                }`}>
                                  {step.label}
                                </p>
                                {index < getStatusStep(order.status).steps.length - 1 && (
                                  <div className={`w-12 h-0.5 ${
                                    isCompleted ? "bg-orange-500" : "bg-gray-200"
                                  }`} />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                          <Package className="h-4 w-4 mr-2" />
                          Order Items
                        </h4>
                        <div className="space-y-3">
                        {order.orderItems.map((item) => (
                            <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden">
                            <Image
                                  src={item.product.images[0] || "/placeholder.svg"}
                              alt={item.product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.product.name}</p>
                                <p className="text-sm text-gray-600">by {item.product.seller.businessName}</p>
                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-orange-600">KSh {Number(item.price || 0).toLocaleString()}</p>
                                <p className="text-sm text-gray-600">each</p>
                              </div>
                              {order.status === "DELIVERED" && (
                                <div className="mt-2">
                                  {reviewStatus[item.product.id]?.hasReviewed ? (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="rounded-2xl border-orange-200 text-orange-600 hover:bg-orange-50"
                                      onClick={() => setReviewModal({ productId: item.product.id, orderId: order.id })}
                                    >
                                      <Star className="h-4 w-4 mr-2" />
                                      Edit Review
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl"
                                      onClick={() => setReviewModal({ productId: item.product.id, orderId: order.id })}
                                    >
                                      <Star className="h-4 w-4 mr-2" />
                                      Review
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Total */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-2xl font-bold text-orange-600">KSh {Number(order.total || 0).toLocaleString()}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-2xl"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          {order.status === "DELIVERED" && (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl"
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* No Orders */}
              {getOrdersByStatus(status).length === 0 && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-600 mb-6">
                    {status === "all" 
                      ? "You haven't placed any orders yet."
                      : `No ${status.toLowerCase()} orders at the moment.`
                    }
                  </p>
                  {status === "all" && (
                    <Button
                      onClick={() => router.push("/cakes")}
                      className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl"
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Start Shopping
                    </Button>
                  )}
              </div>
            )}
          </TabsContent>
          ))}
        </Tabs>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order Details #{selectedOrder.id.slice(-8)}
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedOrder(null)}
                    className="rounded-2xl"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Order Status */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="text-sm text-gray-600">Order Status</p>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                    </div>
                  </div>

                  {/* Order Progress */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900">Order Progress</h3>
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        {getStatusStep(selectedOrder.status).steps.map((step, index) => {
                          const { currentIndex } = getStatusStep(selectedOrder.status)
                          const isCompleted = index <= currentIndex
                          const isCurrent = index === currentIndex
                          const Icon = step.icon
                          
                          return (
                            <div key={step.key} className="flex flex-col items-center space-y-2">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isCompleted ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-400"
                              } ${isCurrent ? "ring-2 ring-orange-300" : ""}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <p className={`text-sm text-center ${
                                isCompleted ? "text-gray-900 font-medium" : "text-gray-400"
                              }`}>
                                {step.label}
                              </p>
                              {index < getStatusStep(selectedOrder.status).steps.length - 1 && (
                                <div className={`w-16 h-0.5 ${
                                  isCompleted ? "bg-orange-500" : "bg-gray-200"
                                }`} />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-900">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.orderItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                            <Image
                              src={item.product.images[0] || "/placeholder.svg"}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.product.name}</p>
                            <p className="text-sm text-gray-600">by {item.product.seller.businessName}</p>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-orange-600">KSh {Number(item.price || 0).toLocaleString()} each</p>
                            <p className="text-sm text-gray-600">
                              Total: KSh {Number((item.price * item.quantity) || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-gray-900">Total Amount</p>
                      <p className="text-2xl font-bold text-orange-600">KSh {Number(selectedOrder.total || 0).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="text-sm font-medium">
                        {new Date(selectedOrder.createdAt).toLocaleDateString()} at {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="text-sm font-medium">
                        {new Date(selectedOrder.updatedAt).toLocaleDateString()} at {new Date(selectedOrder.updatedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {reviewModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setReviewModal(null)}>
            <Card className="w-full max-w-2xl border-0 shadow-2xl rounded-3xl" onClick={e => e.stopPropagation()}>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl font-black">
                  {reviewStatus[reviewModal.productId]?.hasReviewed ? "Edit Your Review" : "Write a Review"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewForm
                  onSubmit={(rating, comment) => handleSubmitReview(reviewModal.productId, rating, comment)}
                  initialRating={reviewStatus[reviewModal.productId]?.userReview?.rating}
                  initialComment={reviewStatus[reviewModal.productId]?.userReview?.comment}
                  isLoading={submittingReview}
                />
                <div className="mt-4 flex gap-3">
                  <Button onClick={() => setReviewModal(null)} variant="outline" className="flex-1 rounded-2xl">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
