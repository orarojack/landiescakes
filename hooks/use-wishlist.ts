"use client"

import { useCallback } from "react"
import { useLocalStorage } from "./use-local-storage"

interface WishlistItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  seller: string
  rating: number
  reviews: number
}

export function useWishlist() {
  const [items, setItems] = useLocalStorage<WishlistItem[]>("wishlist-items", [])

  const addItem = useCallback(
    (item: WishlistItem) => {
      setItems((currentItems) => {
        const exists = currentItems.some((i) => i.id === item.id)
        if (exists) return currentItems
        return [...currentItems, item]
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

  const isInWishlist = useCallback(
    (id: string) => {
      return items.some((item) => item.id === id)
    },
    [items],
  )

  const toggleItem = useCallback(
    (item: WishlistItem) => {
      if (isInWishlist(item.id)) {
        removeItem(item.id)
      } else {
        addItem(item)
      }
    },
    [isInWishlist, addItem, removeItem],
  )

  const clearWishlist = useCallback(() => {
    setItems([])
  }, [setItems])

  return {
    items,
    addItem,
    removeItem,
    isInWishlist,
    toggleItem,
    clearWishlist,
  }
}
