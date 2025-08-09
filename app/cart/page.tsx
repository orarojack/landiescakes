"use client"
import { useSession } from "next-auth/react"
import { redirect, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Truck, ArrowRight, Loader2, Calendar, Tag, CheckCircle, XCircle, ChevronRight } from "lucide-react"
import { useCart } from "@/components/modern/cart-provider"
import { useToast } from "@/components/providers/toast-provider"
import Image from "next/image"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatPriceKsh } from "@/lib/utils"

function Stepper({ step }: { step: number }) {
  const steps = [
    { label: "Cart", icon: <ShoppingCart className="h-5 w-5" /> },
    { label: "Checkout", icon: <CreditCard className="h-5 w-5" /> },
    { label: "Payment", icon: <CheckCircle className="h-5 w-5" /> },
  ];
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((stepObj, idx) => (
        <div key={stepObj.label} className="flex items-center">
          <div className={`rounded-full w-10 h-10 flex items-center justify-center font-bold text-white text-lg shadow-lg border-2 transition-all duration-300 ${
            idx <= step ? "bg-gradient-to-br from-orange-500 to-pink-500 border-orange-400" : "bg-gray-200 border-gray-300"
          }`}>{stepObj.icon}</div>
          {idx < steps.length - 1 && (
            <ChevronRight className="mx-2 text-orange-400" />
          )}
        </div>
      ))}
    </div>
  );
}

function EmptyCartAnimation() {
  // Simple SVG animation for empty cart
  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="40" width="100" height="60" rx="15" fill="#f3f4f6" stroke="#f59e42" strokeWidth="3" />
        <circle cx="40" cy="100" r="8" fill="#f59e42" />
        <circle cx="80" cy="100" r="8" fill="#f59e42" />
        <rect x="30" y="30" width="60" height="20" rx="8" fill="#f59e42" opacity="0.2" />
      </svg>
      <p className="text-gray-500 mt-4">Your cart is empty!</p>
    </div>
  )
}

export default function CartPage() {
  const { data: session, status } = useSession()
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartCount, getCurrentSeller } = useCart()
  const router = useRouter()
  const toast = useToast()
  const [isNavigating, setIsNavigating] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [promo, setPromo] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle" | "valid" | "invalid" | "checking">("idle");
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toLocaleDateString();
  });
  const [accessories, setAccessories] = useState<any[]>([]);
  const [accessoriesLoading, setAccessoriesLoading] = useState(true);
  const [discountedAccessories, setDiscountedAccessories] = useState<any[]>([]);
  const { addToCart } = useCart();
  const [showAddonsModal, setShowAddonsModal] = useState(false);

  // Debug log
  console.log("[DEBUG] CartPage cartItems:", cartItems)

  useEffect(() => {
    // Animate cart items on mount
    document.querySelectorAll('.cart-animate').forEach((el, i) => {
      (el as HTMLElement).style.opacity = '0';
      setTimeout(() => {
        (el as HTMLElement).style.opacity = '1';
      }, 100 + i * 80);
    });
  }, [cartItems]);

  useEffect(() => {
    // Fetch Accessories category id, then fetch products in that category
    const fetchAccessories = async () => {
      setAccessoriesLoading(true);
      try {
        const catRes = await fetch("/api/categories");
        const catData = await catRes.json();
        const accessoriesCat = catData.categories.find((c: any) => c.name.toLowerCase() === "accessories");
        if (!accessoriesCat) {
          setAccessories([]);
          setDiscountedAccessories([]);
          setAccessoriesLoading(false);
          return;
        }
        const prodRes = await fetch(`/api/products?category=${accessoriesCat.id}&limit=20`);
        const prodData = await prodRes.json();
        const allAccessories = prodData.products || [];
        setAccessories(allAccessories.filter((acc: any) => !acc.originalPrice || acc.price >= acc.originalPrice));
        setDiscountedAccessories(allAccessories.filter((acc: any) => acc.originalPrice && acc.price < acc.originalPrice));
      } catch (err) {
        setAccessories([]);
        setDiscountedAccessories([]);
      }
      setAccessoriesLoading(false);
    };
    fetchAccessories();
  }, []);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  // Remove this block so guests can view the cart
  // if (!session) {
  //   redirect("/auth/login")
  // }

  const handleProceedToCheckout = async () => {
    try {
      setIsNavigating(true)
      
      // Debug logging
      console.log("[Cart] Proceeding to checkout...")
      console.log("[Cart] Session:", session)
      console.log("[Cart] Cart items:", cartItems)
      console.log("[Cart] Cart count:", getCartCount())
      console.log("[Cart] Cart total:", getCartTotal())

      // Validate prerequisites
      if (!session) {
        toast.error("Please log in to proceed to checkout")
        setIsNavigating(false)
        return
      }

      if (cartItems.length === 0) {
        toast.error("Your cart is empty")
        setIsNavigating(false)
        return
      }

      if (getCartTotal() <= 0) {
        toast.error("Invalid cart total")
        setIsNavigating(false)
        return
      }

      // Show info toast
      toast.info("Redirecting to checkout...")

      // Try router.push first
      console.log("[Cart] Attempting router.push to /checkout")
      router.push("/checkout")

      // Add a timeout to detect if navigation failed
      setTimeout(() => {
        if (isNavigating) {
          console.log("[Cart] Router.push might have failed, trying fallback navigation")
          // Fallback to window.location
          if (typeof window !== "undefined") {
            window.location.href = "/checkout"
          }
        }
      }, 2000)

      // Reset loading state after a delay
      setTimeout(() => {
        setIsNavigating(false)
      }, 3000)

    } catch (error) {
      console.error("[Cart] Error during checkout navigation:", error)
      toast.error("Failed to proceed to checkout. Please try again.")
      setIsNavigating(false)
      
      // Fallback navigation
      if (typeof window !== "undefined") {
        console.log("[Cart] Using fallback navigation")
        window.location.href = "/checkout"
      }
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex flex-col items-center justify-center">
        <Card className="bg-white/60 backdrop-blur-lg border-0 shadow-2xl rounded-3xl max-w-2xl mx-auto p-8">
            <CardContent className="p-12 text-center">
            <EmptyCartAnimation />
            <h2 className="text-3xl font-bold text-gray-900 mb-4 mt-6">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">Looks like you haven't added any delicious cakes to your cart yet.</p>
              <Link href="/cakes">
                <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl px-8 py-3 font-bold shadow-lg hover:shadow-xl transition-all duration-300">
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-100 bg-[url('/grid.svg')] bg-fixed bg-cover">
      <div className="container mx-auto p-6 space-y-10 lg:space-y-12">
        {/* 2. Stepper/progress bar at the top */}
        <Stepper step={0} />
        {/* 3. Main layout: two columns on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/60 border-0 shadow-2xl rounded-3xl backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-extrabold text-gray-900 tracking-tight">Cart Items ({getCartCount()})</CardTitle>
                <CardDescription className="text-gray-600">Manage your selected products</CardDescription>
                {getCurrentSeller() && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">🏪</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-900">Shopping from: <span className="text-blue-700">{getCurrentSeller()}</span></p>
                        <p className="text-xs text-blue-600">All items in your cart are from this seller</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-8">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-animate flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 p-6 bg-white/90 shadow-lg rounded-2xl border border-orange-100 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl">
                    <Link href={`/cakes/${item.id}`} className="shrink-0 group">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={80}
                      height={80}
                        className="rounded-2xl object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    </Link>
                    <div className="flex-1 w-full">
                      <Link href={`/cakes/${item.id}`} className="hover:underline">
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      </Link>
                      <p className="text-sm text-gray-600">by {item.seller}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="font-bold text-orange-600">{formatPriceKsh(item.price)} each</p>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-xs text-gray-500 line-through">{formatPriceKsh(item.originalPrice)}</span>
                        )}
                        {item.inStock === false && (
                          <Badge className="bg-red-100 text-red-700 ml-2">Out of stock</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2 md:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.id, item.quantity - 1)
                            toast.success("Quantity updated")
                          }
                        }}
                        className="rounded-xl w-8 h-8 p-0"
                        disabled={item.quantity === 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          updateQuantity(item.id, Number.parseInt(e.target.value) || 1)
                          toast.success("Quantity updated")
                        }}
                        className="w-16 text-center rounded-xl"
                        min="1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateQuantity(item.id, item.quantity + 1)
                          toast.success("Quantity updated")
                        }}
                        className="rounded-xl w-8 h-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-right mt-2 md:mt-0">
                      <p className="font-bold text-lg text-gray-900">{formatPriceKsh(item.price * item.quantity)}</p>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <p className="text-xs text-green-600">You save {formatPriceKsh((item.originalPrice - item.price) * item.quantity)}!</p>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          removeFromCart(item.id)
                          toast.success("Item removed from cart")
                        }}
                        className="text-red-600 hover:text-red-700 rounded-xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="mt-8 flex justify-start">
              <Link href="/cakes">
                <Button variant="outline" className="rounded-2xl border-2 border-orange-200 hover:border-orange-500 text-orange-600 font-bold bg-white/70 shadow-md">
                  &larr; Continue Shopping
                </Button>
              </Link>
            </div>
            {/* Trending/Recommended Cakes Section (optional) */}
            {/* <TrendingCakes /> */}
          </div>
          {/* Order Summary Section */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 border-0 shadow-2xl rounded-3xl sticky top-8 backdrop-blur-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-extrabold text-gray-900">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">{formatPriceKsh(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold">{formatPriceKsh(getCartTotal() * 0.08)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-orange-600">{formatPriceKsh(getCartTotal() * 1.08)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-5 w-5" />
                    <span>Est. Delivery:</span>
                    <span className="font-semibold">{deliveryDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-orange-400" />
                    <input
                      type="text"
                      value={promo}
                      onChange={e => {
                        setPromo(e.target.value)
                        setPromoStatus("idle")
                      }}
                      placeholder="Promo code"
                      className="rounded-xl border border-orange-200 px-2 py-1 w-28 text-sm focus:border-orange-500 focus:ring-0"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl border-orange-300 px-2 py-1 text-xs font-bold"
                      onClick={() => {
                        setPromoStatus("checking")
                        setTimeout(() => {
                          if (promo.toLowerCase() === "cake10") {
                            setPromoStatus("valid")
                          } else {
                            setPromoStatus("invalid")
                          }
                        }, 800)
                      }}
                      disabled={promoStatus === "checking" || !promo}
                    >
                      {promoStatus === "checking" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                    {promoStatus === "valid" && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {promoStatus === "invalid" && <XCircle className="h-5 w-5 text-red-500" />}
                  </div>
                </div>
                <div className="space-y-3">
                  <Badge className="w-full justify-center py-2 bg-green-100 text-green-800 rounded-2xl">
                    <Truck className="h-4 w-4 mr-2" />
                    Free shipping on all orders
                  </Badge>
                </div>
                <Button
                  onClick={handleProceedToCheckout}
                  disabled={cartItems.length === 0 || isNavigating}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed animate-bounce"
                >
                  {isNavigating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Proceed to Checkout
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowClearDialog(true)}
                  className="w-full rounded-2xl border-2 border-gray-200 hover:border-red-500 hover:text-red-600 bg-transparent"
                >
                  Clear Cart
                </Button>
                <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Clear Cart</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to remove all items from your cart?</p>
                    <div className="flex justify-end gap-2 mt-6">
                      <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          clearCart()
                          setShowClearDialog(false)
                          toast.success("Cart cleared")
                        }}
                      >
                        Clear Cart
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Accessory/Add-on Sections: visually distinct, colored backgrounds, dividers */}
        <div className="mt-16 space-y-12">
          {accessories.length > 0 && (
            <section className="rounded-3xl bg-gradient-to-r from-orange-100 via-pink-100 to-purple-100 shadow-xl p-8 border-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-orange-700">Recommended Accessories</h3>
                <Button variant="ghost" className="text-orange-600 font-bold hover:bg-orange-50" onClick={() => setShowAddonsModal(true)}>
                  Shop More Add-ons
                </Button>
              </div>
              <div className="flex space-x-6 overflow-x-auto pb-2 custom-scrollbar">
                {accessories.map((acc, i) => (
                  <Card key={acc.id} className="min-w-[220px] max-w-xs bg-white/90 border-2 border-orange-100 shadow-xl rounded-2xl flex flex-col items-center p-4 transition-transform duration-200 hover:scale-105 hover:shadow-2xl relative fade-in">
                    {acc.stock < 10 && <span className="absolute top-2 left-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full">Limited Stock</span>}
                    {i === 0 && <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">Best Seller</span>}
                    <Image src={acc.images?.[0] || "/placeholder.svg"} alt={acc.name} width={120} height={120} className="rounded-xl object-cover mb-2" />
                    <div className="font-bold text-gray-900 text-lg mb-1 text-center">{acc.name}</div>
                    <div className="text-orange-600 font-semibold mb-2">{formatPriceKsh(acc.price)}</div>
                    <Button size="sm" className="rounded-xl w-full" onClick={() => {
                      const result = addToCart({
                        id: acc.id,
                        name: acc.name,
                        price: acc.price,
                        originalPrice: acc.originalPrice,
                        image: acc.images?.[0] || "",
                        seller: acc.seller?.businessName || "Unknown Seller",
                        inStock: acc.stock > 0,
                        freeShipping: acc.freeShipping || false,
                      });
                      
                      if (result.success) {
                        toast.success(`${acc.name} added to cart!`);
                      } else {
                        toast.error(result.message || "Failed to add item to cart");
                      }
                    }}>
                      Add to Cart
                    </Button>
                  </Card>
                ))}
              </div>
            </section>
          )}
          {discountedAccessories.length > 0 && (
            <section className="rounded-3xl bg-gradient-to-r from-pink-100 via-orange-100 to-purple-100 shadow-xl p-8 border-0 mt-8">
              <h3 className="text-xl font-bold mb-4 text-pink-700">Discounted Add-ons</h3>
              <div className="flex space-x-6 overflow-x-auto pb-2">
                {discountedAccessories.map((acc) => (
                  <Card key={acc.id} className="min-w-[220px] max-w-xs bg-pink-50 border-2 border-pink-100 shadow-lg rounded-2xl flex flex-col items-center p-4 relative">
                    <span className="absolute top-2 right-2 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">{Math.round(100 * (1 - acc.price / acc.originalPrice))}% OFF</span>
                    <Image src={acc.images?.[0] || "/placeholder.svg"} alt={acc.name} width={120} height={120} className="rounded-xl object-cover mb-2" />
                    <div className="font-bold text-gray-900 text-lg mb-1 text-center">{acc.name}</div>
                    <div className="text-orange-600 font-semibold mb-1">{formatPriceKsh(acc.price)} <span className="text-xs text-gray-500 line-through ml-2">{formatPriceKsh(acc.originalPrice)}</span></div>
                    <Button size="sm" className="rounded-xl w-full" onClick={() => {
                      const result = addToCart({
                        id: acc.id,
                        name: acc.name,
                        price: acc.price,
                        originalPrice: acc.originalPrice,
                        image: acc.images?.[0] || "",
                        seller: acc.seller?.businessName || "Unknown Seller",
                        inStock: acc.stock > 0,
                        freeShipping: acc.freeShipping || false,
                      });
                      
                      if (result.success) {
                        toast.success(`${acc.name} added to cart!`);
                      } else {
                        toast.error(result.message || "Failed to add item to cart");
                      }
                    }}>
                      Add to Cart
                    </Button>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      {/* Floating checkout bar on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 block lg:hidden">
        <div className="mx-auto max-w-lg flex items-center justify-between bg-white/90 backdrop-blur-lg border-t border-orange-200 px-4 py-3 shadow-2xl rounded-t-2xl">
          <div>
            <span className="text-xs text-gray-500">Total</span>
            <div className="text-lg font-bold text-orange-600">{formatPriceKsh(getCartTotal() * 1.08)}</div>
          </div>
          <Button
            onClick={handleProceedToCheckout}
            disabled={cartItems.length === 0 || isNavigating}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-xl px-6 py-3 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed animate-bounce"
          >
            Checkout
          </Button>
        </div>
      </div>
      {/* Add-ons Modal */}
      <Dialog open={showAddonsModal} onOpenChange={setShowAddonsModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>All Accessories & Add-ons</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {[...accessories, ...discountedAccessories].map((acc, i) => (
              <Card key={acc.id} className="bg-white/90 border-2 border-orange-100 shadow-xl rounded-2xl flex flex-col items-center p-4 transition-transform duration-200 hover:scale-105 hover:shadow-2xl relative fade-in">
                {acc.stock < 10 && <span className="absolute top-2 left-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full">Limited Stock</span>}
                {i === 0 && <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">Best Seller</span>}
                {acc.originalPrice && acc.price < acc.originalPrice && (
                  <span className="absolute top-2 right-2 bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">{Math.round(100 * (1 - acc.price / acc.originalPrice))}% OFF</span>
                )}
                <Image src={acc.images?.[0] || "/placeholder.svg"} alt={acc.name} width={120} height={120} className="rounded-xl object-cover mb-2" />
                <div className="font-bold text-gray-900 text-lg mb-1 text-center">{acc.name}</div>
                <div className="text-orange-600 font-semibold mb-1">{formatPriceKsh(acc.price)} {acc.originalPrice && acc.price < acc.originalPrice && (<span className="text-xs text-gray-500 line-through ml-2">{formatPriceKsh(acc.originalPrice)}</span>)}</div>
                <Button size="sm" className="rounded-xl w-full" onClick={() => {
                  const result = addToCart({
                    id: acc.id,
                    name: acc.name,
                    price: acc.price,
                    originalPrice: acc.originalPrice,
                    image: acc.images?.[0] || "",
                    seller: acc.seller?.businessName || "Unknown Seller",
                    inStock: acc.stock > 0,
                    freeShipping: acc.freeShipping || false,
                  });
                  
                  if (result.success) {
                    toast.success(`${acc.name} added to cart!`);
                  } else {
                    toast.error(result.message || "Failed to add item to cart");
                  }
                }}>
                  Add to Cart
                </Button>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
