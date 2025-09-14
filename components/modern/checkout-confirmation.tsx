"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, User, Star } from "lucide-react"

interface CheckoutConfirmationProps {
  orderId: string
  orderDetails: any
  onClose: () => void
}

export function CheckoutConfirmation({ orderId, orderDetails, onClose }: CheckoutConfirmationProps) {
  const [orderStatus, setOrderStatus] = useState("pending")
  const [vendorResponse, setVendorResponse] = useState<any>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    const vendorTimer = setTimeout(() => {
      setVendorResponse({
        accepted: true,
        message: "Order accepted! We'll start preparing your cake right away.",
        estimatedTime: "2-3 hours",
        vendorName: orderDetails?.seller || "Cake Vendor",
        vendorRating: 4.8,
      })
      setOrderStatus("accepted")
    }, 300000) // 5 minutes

    return () => {
      clearInterval(timer)
      clearTimeout(vendorTimer)
    }
  }, [orderDetails])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl border-0 shadow-2xl rounded-3xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-black">Order Confirmation</CardTitle>
          <p className="text-gray-600">Order #{orderId}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {orderStatus === "pending" ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-orange-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Waiting for Vendor Response
                </h3>
                <p className="text-gray-600 mb-4">
                  We've sent your order to the vendor. They'll respond within 5 minutes.
                </p>
                <div className="text-sm text-gray-500">
                  Time elapsed: {formatTime(timeElapsed)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-green-600 mb-2">
                  Order Accepted!
                </h3>
                <p className="text-gray-600">
                  {vendorResponse?.message}
                </p>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button onClick={onClose} variant="outline" className="flex-1 rounded-2xl">
              Close
            </Button>
            <Button 
              onClick={() => window.location.href = '/orders'} 
              className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl"
            >
              View Orders
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
