"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  Settings,
  Package,
  Store,
  Crown,
  Menu,
  X,
} from "lucide-react"
import { ShoppingCart as ShoppingCartComponent } from "./shopping-cart"
import { useCart } from "./cart-provider"
import Image from "next/image"

export function Header() {
  const { data: session } = useSession()
  const { cartItems, updateQuantity, removeFromCart, moveToWishlist } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const cartItemCount = cartItems.length

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const getDashboardLink = () => {
    if (!session?.user?.role) return "/"
    
    switch (session.user.role) {
      case "ADMIN":
        return "/admin/dashboard"
      case "SELLER":
        return "/seller/dashboard"
      default:
        return "/profile"
    }
  }

  const getRoleBadge = () => {
    if (!session?.user?.role) return null
    
    const badges = {
      ADMIN: { label: "Admin", color: "bg-red-500" },
      SELLER: { label: "Seller", color: "bg-blue-500" },
      BUYER: { label: "Buyer", color: "bg-green-500" },
    }
    
    const badge = badges[session.user.role as keyof typeof badges]
    return (
      <Badge className={`${badge.color} text-white text-xs px-2 py-1 rounded-full`}>
        {badge.label}
      </Badge>
    )
  }

  return (
    <>
      <header className="bg-white/60 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-xl transition-shadow duration-300">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 flex items-center justify-center">
                <Image src="/landy-logo.jpg" alt="Landy Cakes & Pastries Logo" width={48} height={48} className="rounded-full shadow-lg object-cover" />
              </div>
              <span className="text-3xl font-black text-gray-900 tracking-tight group-hover:text-orange-600 transition-colors duration-300">LandyCakes</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
              <Link
                href="/cakes"
                className="relative px-4 py-2 font-semibold text-gray-800 rounded-xl transition-all duration-200 group hover:text-white hover:shadow-lg hover:scale-105 bg-gradient-to-r from-orange-50 to-pink-50 hover:from-orange-500 hover:to-pink-500"
              >
                <span className="relative z-10">Explore Cakes</span>
                <span className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-orange-500 to-pink-500 rounded-b-xl scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-0" />
              </Link>
              <Link
                href="/sellers"
                className="relative px-4 py-2 font-semibold text-gray-800 rounded-xl transition-all duration-200 group hover:text-white hover:shadow-lg hover:scale-105 bg-gradient-to-r from-orange-50 to-pink-50 hover:from-pink-500 hover:to-orange-500"
              >
                <span className="relative z-10">Find Sellers</span>
                <span className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-pink-500 to-orange-500 rounded-b-xl scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-0" />
              </Link>
              {session?.user?.role === "SELLER" && (
                <Link
                  href="/seller/products"
                  className="relative px-4 py-2 font-semibold text-gray-800 rounded-xl transition-all duration-200 group hover:text-white hover:shadow-lg hover:scale-105 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-500 hover:to-purple-500"
                >
                  <span className="relative z-10">My Products</span>
                  <span className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-xl scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-0" />
                </Link>
              )}
              {session?.user?.role === "ADMIN" && (
                <Link
                  href="/admin/dashboard"
                  className="relative px-4 py-2 font-semibold text-gray-800 rounded-xl transition-all duration-200 group hover:text-white hover:shadow-lg hover:scale-105 bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-500 hover:to-orange-500"
                >
                  <span className="relative z-10">Admin Panel</span>
                  <span className="absolute left-0 bottom-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-b-xl scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-0" />
                </Link>
              )}
            </nav>

            {/* Search Bar */}
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search for cakes, flavors, occasions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-2 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white/70 backdrop-blur-md shadow-inner transition-all duration-300 focus:shadow-orange-200/50"
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart - only for non-admins */}
              {(!session || session.user.role !== "ADMIN") && (
                <Link href="/cart" className="relative group">
                  <ShoppingCart className="h-7 w-7 text-gray-700 transition-transform duration-200 group-hover:scale-110" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow-lg animate-pulse">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              )}

              {/* User Menu */}
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-2xl hover:bg-orange-50 px-2">
                      <div className="flex items-center space-x-3">
                        {session.user.image ? (
                          <img src={session.user.image} alt="avatar" className="w-9 h-9 rounded-full object-cover border-2 border-orange-400 shadow-md" />
                        ) : (
                          <div className="w-9 h-9 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {session.user.name ? session.user.name[0] : <User className="h-5 w-5" />}
                          </div>
                        )}
                        <div className="hidden sm:block text-left">
                          <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
                          {getRoleBadge()}
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 rounded-2xl border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
                    <DropdownMenuLabel className="font-bold text-gray-900">
                      Welcome, {session.user.name}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardLink()} className="flex items-center space-x-2">
                        {session.user.role === "ADMIN" ? (
                          <Crown className="h-4 w-4" />
                        ) : session.user.role === "SELLER" ? (
                          <Store className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>Profile Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="flex items-center space-x-2">
                        <Package className="h-4 w-4" />
                        <span>My Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/auth/login">
                    <Button variant="ghost" className="rounded-2xl hover:bg-orange-50">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl shadow-lg">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-2xl"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="lg:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search for cakes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 bg-white/70 backdrop-blur-md shadow-inner transition-all duration-300 focus:shadow-orange-200/50"
              />
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`md:hidden fixed top-0 left-0 w-full h-full bg-black/30 z-40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div
            className={`md:hidden fixed top-0 right-0 w-3/4 max-w-xs h-full bg-white/95 backdrop-blur-xl shadow-2xl z-50 transform transition-transform duration-500 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          >
            <div className="p-6 space-y-6">
              <nav className="space-y-4">
                <Link href="/cakes" className="block text-gray-700 hover:text-orange-600 font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  Explore Cakes
                </Link>
                <Link href="/sellers" className="block text-gray-700 hover:text-orange-600 font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  Find Sellers
                </Link>
                {session?.user?.role === "SELLER" && (
                  <Link href="/seller/products" className="block text-gray-700 hover:text-orange-600 font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    My Products
                  </Link>
                )}
                {session?.user?.role === "ADMIN" && (
                  <Link href="/admin/dashboard" className="block text-gray-700 hover:text-orange-600 font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    Admin Panel
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </div>
      </header>

      <style jsx global>{`
        .nav-link {
          position: relative;
          font-weight: 500;
          color: #374151;
          transition: color 0.2s;
          padding-bottom: 4px;
        }
        .nav-link:hover {
          color: #ea580c;
        }
        .nav-link::after {
          content: '';
          display: block;
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #ea580c 0%, #ec4899 100%);
          border-radius: 2px;
          opacity: 0;
          transform: scaleX(0);
          transition: opacity 0.3s, transform 0.3s;
        }
        .nav-link:hover::after {
          opacity: 1;
          transform: scaleX(1);
        }
      `}</style>
    </>
  )
} 