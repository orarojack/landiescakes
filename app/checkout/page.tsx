"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/components/modern/cart-provider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Image from "next/image";
import { formatPriceKsh } from "@/lib/utils";
import { 
  CreditCard, 
  Shield, 
  Truck, 
  CheckCircle, 
  Lock, 
  Phone, 
  Mail, 
  User, 
  ArrowLeft,
  Sparkles,
  Zap,
  Star,
  Clock,
  MapPin,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { cartItems, clearCart, getCartTotal } = useCart();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'failed'>('pending');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);

  // Debug log
  console.log("[DEBUG] CheckoutPage cartItems:", cartItems);

  // Animate elements on mount
  useEffect(() => {
    const animateElements = () => {
      const elements = document.querySelectorAll('.animate-on-mount');
      elements.forEach((el, index) => {
        setTimeout(() => {
          (el as HTMLElement).style.opacity = '1';
          (el as HTMLElement).style.transform = 'translateY(0)';
        }, index * 100);
      });
    };
    animateElements();
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setPaymentStatus('pending');

    if (!guestName.trim()) {
      setError("Please enter your name.");
      setLoading(false);
      return;
    }
    if (!guestEmail.match(/^\S+@\S+\.\S+$/)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (!phone.match(/^07\d{8}$/)) {
      setError("Please enter a valid M-Pesa phone number (e.g. 07XXXXXXXX)");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems,
          phone,
          guestName,
          guestEmail,
        }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setOrderId(data.orderId);
        setCheckoutRequestId(data.checkoutRequestId);
        setPaymentStatus('processing');
        toast.success(data.message || "M-Pesa prompt sent to your phone!");
        
        // Start polling for payment status
        startPaymentStatusPolling(data.orderId);
      } else {
        setError(data.error || "Failed to initiate payment");
        setPaymentStatus('failed');
      }
    } catch (err) {
      setError("An error occurred during checkout");
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  // Poll payment status
  const startPaymentStatusPolling = (orderId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/mpesa/status/${orderId}`);
        const data = await response.json();
        
        if (response.ok) {
          if (data.paymentStatus === 'PAID') {
            setPaymentStatus('success');
            setSuccess(true);
            clearCart();
            toast.success("Payment successful! Your order has been confirmed.");
            clearInterval(pollInterval);
            setTimeout(() => {
              router.push("/orders");
            }, 3000);
          } else if (data.paymentStatus === 'FAILED') {
            setPaymentStatus('failed');
            setError("Payment failed. Please try again.");
            clearInterval(pollInterval);
          }
          // If still pending, continue polling
        } else {
          console.error("Failed to check payment status:", data.error);
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (paymentStatus === 'processing') {
        setPaymentStatus('failed');
        setError("Payment timeout. Please check your phone and try again.");
      }
    }, 300000); // 5 minutes
  };

  // Payment processing state
  if (paymentStatus === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <Card className="max-w-md w-full bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl animate-on-mount" style={{ opacity: 0, transform: 'translateY(20px)' }}>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="text-2xl font-bold text-blue-600 mb-2">Processing Payment</h2>
            <p className="text-gray-700 mb-4">Please check your phone for the M-Pesa prompt and complete the payment.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-700">
                <strong>Order ID:</strong> {orderId?.slice(-8)}<br/>
                <strong>Amount:</strong> {formatPriceKsh(total)}
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="w-full rounded-2xl py-3"
              >
                Refresh Status
              </Button>
              <Button 
                onClick={() => router.push("/orders")} 
                variant="ghost" 
                className="w-full rounded-2xl py-3"
              >
                View Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <Card className="max-w-md w-full bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl animate-on-mount" style={{ opacity: 0, transform: 'translateY(20px)' }}>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-700 mb-6">Thank you for your purchase. Your order has been confirmed.</p>
            <div className="space-y-3">
              <Button onClick={() => router.push("/orders")} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-2xl py-3 font-semibold shadow-lg">
                View My Orders
              </Button>
              <Button variant="outline" onClick={() => router.push("/")} className="w-full rounded-2xl py-3">
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 5000 ? 0 : 500;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-on-mount" style={{ opacity: 0, transform: 'translateY(20px)' }}>
          <Link href="/cart" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Checkout</h1>
              <p className="text-gray-600">Complete your order with M-Pesa</p>
            </div>
            <div className="hidden md:flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">SSL Secured</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl animate-on-mount" style={{ opacity: 0, transform: 'translateY(20px)' }}>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2 text-orange-600" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Your cart is empty.</p>
                  </div>
                ) : (
                  cartItems.map((item, index) => (
                    <div key={item.id} className="animate-on-mount flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-300" style={{ opacity: 0, transform: 'translateY(20px)', animationDelay: `${index * 100}ms` }}>
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-md">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                        <div className="absolute top-1 right-1 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                        <p className="text-sm text-gray-600">by {item.seller}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                            {formatPriceKsh(item.price)} each
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-orange-600">{formatPriceKsh(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl animate-on-mount" style={{ opacity: 0, transform: 'translateY(20px)', animationDelay: '200ms' }}>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckout} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        Full Name
                      </label>
                      <Input
                        type="text"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Your full name"
                        className="rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 transition-all duration-300"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      M-Pesa Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="07XXXXXXXX"
                      className="rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 transition-all duration-300"
                      required
                    />
                    <p className="text-xs text-gray-500">You'll receive an M-Pesa prompt on this number</p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-red-600 font-medium text-sm">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading || cartItems.length === 0}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing Payment...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <CreditCard className="h-5 w-5" />
                        <span>Pay {formatPriceKsh(total)} with M-Pesa</span>
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl animate-on-mount sticky top-8" style={{ opacity: 0, transform: 'translateY(20px)', animationDelay: '400ms' }}>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900">Order Total</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>{formatPriceKsh(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center">
                      <Truck className="h-4 w-4 mr-1" />
                      Delivery
                    </span>
                    <span className={deliveryFee === 0 ? "text-green-600 font-semibold" : ""}>
                      {deliveryFee === 0 ? "FREE" : formatPriceKsh(deliveryFee)}
                    </span>
                  </div>
                  {deliveryFee === 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                      <p className="text-green-700 text-sm font-medium flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Free delivery on orders above KSh 5,000
                      </p>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-orange-600">{formatPriceKsh(total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl animate-on-mount" style={{ opacity: 0, transform: 'translateY(20px)', animationDelay: '600ms' }}>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600" />
                  Secure Payment
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Lock className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">SSL Encrypted</p>
                      <p className="text-xs text-gray-600">Your data is protected</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Zap className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Instant Payment</p>
                      <p className="text-xs text-gray-600">M-Pesa integration</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Trusted Platform</p>
                      <p className="text-xs text-gray-600">10,000+ happy customers</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl animate-on-mount" style={{ opacity: 0, transform: 'translateY(20px)', animationDelay: '800ms' }}>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-blue-600" />
                  Delivery Info
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Same Day Delivery</p>
                      <p className="text-xs text-gray-600">2-4 hours in Nairobi</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Wide Coverage</p>
                      <p className="text-xs text-gray-600">50km radius from Nairobi</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-on-mount {
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
} 