export interface Product {
  id: string
  name: string
  description: string
  shortDescription?: string
  price: number
  originalPrice?: number
  discount?: number
  images: string[]
  category: ProductCategory
  subcategory?: string
  tags: string[]
  rating: number
  reviewCount: number
  seller: Seller
  availability: ProductAvailability
  specifications: ProductSpecifications
  customization?: CustomizationOptions
  nutritionalInfo?: NutritionalInfo
  allergens: string[]
  ingredients: string[]
  preparationTime: string
  shelfLife: string
  servingSize: string
  weight: number
  dimensions: ProductDimensions
  isNew?: boolean
  isFeatured?: boolean
  isBestseller?: boolean
  isOnSale?: boolean
  stockQuantity: number
  minOrderQuantity: number
  maxOrderQuantity: number
  createdAt: string
  updatedAt: string
  seo: SEOData
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  isActive: boolean
}

export interface Seller {
  id: string
  name: string
  businessName: string
  avatar?: string
  coverImage?: string
  rating: number
  reviewCount: number
  location: Location
  verified: boolean
  badges: SellerBadge[]
  joinedDate: string
  description?: string
  specialties: string[]
  socialLinks: SocialLinks
  businessHours: BusinessHours[]
  deliveryOptions: DeliveryOption[]
}

export interface ProductAvailability {
  inStock: boolean
  stockLevel: "high" | "medium" | "low" | "out"
  availableFrom?: string
  availableUntil?: string
  preOrderAvailable: boolean
  estimatedRestockDate?: string
}

export interface ProductSpecifications {
  flavor: string
  texture: string
  sweetness: "low" | "medium" | "high"
  difficulty: "easy" | "medium" | "hard"
  occasion: string[]
  ageGroup: string[]
  dietaryRestrictions: string[]
  temperature: "frozen" | "chilled" | "room"
  packaging: string
}

export interface CustomizationOptions {
  available: boolean
  options: CustomizationOption[]
  additionalCost?: number
  leadTime?: string
}

export interface CustomizationOption {
  id: string
  name: string
  type: "text" | "image" | "color" | "size" | "flavor"
  required: boolean
  options?: string[]
  additionalCost?: number
}

export interface NutritionalInfo {
  calories: number
  protein: number
  carbohydrates: number
  fat: number
  sugar: number
  fiber: number
  sodium: number
  servingSize: string
}

export interface ProductDimensions {
  length: number
  width: number
  height: number
  unit: "cm" | "inch"
}

export interface Location {
  address: string
  city: string
  state: string
  country: string
  zipCode: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface SellerBadge {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

export interface SocialLinks {
  website?: string
  instagram?: string
  facebook?: string
  twitter?: string
  youtube?: string
}

export interface BusinessHours {
  day: string
  open: string
  close: string
  isOpen: boolean
}

export interface DeliveryOption {
  id: string
  name: string
  description: string
  cost: number
  estimatedTime: string
  available: boolean
}

export interface SEOData {
  title: string
  description: string
  keywords: string[]
  slug: string
}

export interface ProductReview {
  id: string
  productId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  comment: string
  images?: string[]
  verified: boolean
  helpful: number
  createdAt: string
  updatedAt: string
}

export interface ProductFilter {
  categories: string[]
  priceRange: [number, number]
  rating: number
  availability: string[]
  dietary: string[]
  occasions: string[]
  sortBy: "relevance" | "price-low" | "price-high" | "rating" | "newest" | "popular"
  location?: string
  deliveryOptions: string[]
}
