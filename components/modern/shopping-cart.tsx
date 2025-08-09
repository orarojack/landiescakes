"use client"

import { useState } from "react"
import Image from "next/image"
import { X, Plus, Minus, ShoppingBag, Trash2, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { formatPriceKsh } from "@/lib/utils"

interface CartItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  seller: string
  quantity: number
  inStock: boolean
  freeShipping?: boolean
}

interface ShoppingCartProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
  onMoveToWishlist: (id: string) => void
  className?: string
}

export function ShoppingCart({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onMoveToWishlist,
  className,
}: ShoppingCartProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const savings = items.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + (item.originalPrice - item.price) * item.quantity
    }
    return sum
  }, 0)
  const shipping = subtotal > 50 ? 0 : 5.99
  const total = subtotal + shipping

  const handleCheckout = () => {
    setIsCheckingOut(true)
    // Simulate checkout process
    setTimeout(() => {
      setIsCheckingOut(false)
      // Redirect to checkout page
    }, 2000)
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      )}

      {/* Cart Sidebar */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 z-50",
          isOpen ? "translate-x-0" : "translate-x-full",
          className,
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-orange-50 to-pink-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">Shopping Cart</CardTitle>
                  <p className="text-sm text-gray-600">{items.length} items</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
                  <ShoppingBag className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-6">Add some delicious cakes to get started!</p>
                <Button
                  onClick={onClose}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl px-8"
                >
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {items.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="rounded-2xl shadow-md"
                        />
                        {!item.inStock && (
                          <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                            <span className="text-white text-xs font-bold">Out of Stock</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-gray-900 line-clamp-2">{item.name}</h4>
                            <p className="text-sm text-gray-600">by {item.seller}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemoveItem(item.id)}
                            className="text-gray-400 hover:text-red-500 rounded-xl h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex items-center space-x-2 mb-3">
                          {item.freeShipping && (
                            <Badge className="bg-green-100 text-green-800 text-xs rounded-full">Free Shipping</Badge>
                          )}
                          {!item.inStock && (
                            <Badge className="bg-red-100 text-red-800 text-xs rounded-full">Out of Stock</Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-orange-600">{formatPriceKsh(item.price)}</span>
                            {item.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">{formatPriceKsh(item.originalPrice)}</span>
                            )}
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="flex items-center border rounded-xl">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                disabled={item.quantity <= 1}
                                className="h-8 w-8 rounded-l-xl"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="px-3 py-2 font-bold min-w-[3rem] text-center">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="h-8 w-8 rounded-r-xl"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="font-bold text-lg text-gray-900">
                            {formatPriceKsh(Number((item.price * item.quantity) || 0))}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMoveToWishlist(item.id)}
                            className="text-gray-500 hover:text-pink-500 rounded-xl"
                          >
                            <Heart className="h-4 w-4 mr-2" />
                            Save for Later
                          </Button>
                        </div>
                      </div>
                    </div>
                    {index < items.length - 1 && <Separator className="mt-6" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Order Summary */}
          {items.length > 0 && (
            <div className="border-t bg-gray-50 p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span>{formatPriceKsh(subtotal)}</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>You Save</span>
                    <span>-{formatPriceKsh(savings)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : formatPriceKsh(shipping)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-orange-600">{formatPriceKsh(total)}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={isCheckingOut || items.some((item) => !item.inStock)}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl py-4 text-lg font-bold shadow-lg disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Proceed to Checkout"
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">Secure checkout with SSL encryption</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
