import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert BigInt values to numbers for JSON serialization
export function convertBigIntToNumber(value: any): any {
  if (typeof value === 'bigint') {
    return Number(value)
  }
  if (Array.isArray(value)) {
    return value.map(convertBigIntToNumber)
  }
  if (value && typeof value === 'object') {
    const converted: any = {}
    for (const [key, val] of Object.entries(value)) {
      converted[key] = convertBigIntToNumber(val)
    }
    return converted
  }
  return value
}

export function formatPriceKsh(price: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace("KES", "KSh")
}

export function formatPrice(price: number): string {
  return formatPriceKsh(price)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-")
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
