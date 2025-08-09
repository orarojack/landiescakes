"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useSession } from "next-auth/react"

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

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: Omit<CartItem, "quantity">) => { success: boolean; message?: string }
  updateQuantity: (id: string, quantity: number) => void
  removeFromCart: (id: string) => void
  moveToWishlist: (id: string) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
  getCurrentSeller: () => string | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartLoaded, setCartLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart")
      console.log("[CartProvider] Loaded cart from localStorage:", savedCart)
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart))
        } catch (error) {
          console.error("[CartProvider] Error loading cart from localStorage:", error)
        }
      }
      setCartLoaded(true)
    }
  }, [])

  // Save cart to localStorage whenever it changes, but only after cartLoaded is true
  useEffect(() => {
    if (typeof window !== "undefined" && cartLoaded) {
      localStorage.setItem("cart", JSON.stringify(cartItems))
    }
  }, [cartItems, cartLoaded])

  // Debug: log cartItems on each render
  useEffect(() => {
    console.log("[CartProvider] Current cartItems:", cartItems)
  }, [cartItems])

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    // Check if cart is empty - if so, add the item
    if (cartItems.length === 0) {
      setCartItems([{ ...item, quantity: 1 }])
      return { success: true }
    }

    // Check if the item is from the same seller as existing items
    const currentSeller = cartItems[0].seller
    if (item.seller !== currentSeller) {
      return { 
        success: false, 
        message: `You can only add products from one seller at a time. Your cart currently contains items from "${currentSeller}". Please clear your cart or complete your current order before adding items from "${item.seller}".` 
      }
    }

    // If same seller, proceed with adding to cart
    setCartItems((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    
    return { success: true }
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const moveToWishlist = (id: string) => {
    // TODO: Implement wishlist functionality
    removeFromCart(id)
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getCartTotal = () => {
    const total = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
    console.log("[CartProvider] getCartTotal called, result:", total)
    return total
  }

  const getCartCount = () => {
    const count = cartItems.reduce((count, item) => count + item.quantity, 0)
    console.log("[CartProvider] getCartCount called, result:", count)
    return count
  }

  const getCurrentSeller = () => {
    return cartItems.length > 0 ? cartItems[0].seller : null
  }

  const value: CartContextType = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    moveToWishlist,
    clearCart,
    getCartTotal,
    getCartCount,
    getCurrentSeller,
  }

  // Only render children when cart is loaded
  if (!cartLoaded) return null;

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
