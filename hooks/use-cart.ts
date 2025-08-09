"use client"

import { useState, useCallback } from "react"
import { useLocalStorage } from "./use-local-storage"

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

export function useCart() {
  const [items, setItems] = useLocalStorage<CartItem[]>("cart-items", [])
  const [isOpen, setIsOpen] = useState(false)

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">) => {
      setItems((currentItems) => {
        const existingItem = currentItems.find((i) => i.id === item.id)
        if (existingItem) {
          return currentItems.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
        }
        return [...currentItems, { ...item, quantity: 1 }]
      })
    },
    [setItems],
  )

  const removeItem = useCallback(
    (id: string) => {
      setItems((currentItems) => currentItems.filter((item) => item.id !== id))
    },
    [setItems],
  )

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(id)
        return
      }
      setItems((currentItems) => currentItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
    },
    [setItems, removeItem],
  )

  const clearCart = useCallback(() => {
    setItems([])
  }, [setItems])

  const getItemCount = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }, [items])

  const getSubtotal = useCallback(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [items])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  return {
    items,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getSubtotal,
    openCart,
    closeCart,
  }
}
