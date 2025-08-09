"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Package,
  Star,
  Upload,
  X,
  Save,
  Camera,
  DollarSign,
  Hash,
  FileText,
} from "lucide-react"
import { toast } from "sonner"
import { formatPriceKsh } from "@/lib/utils"

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  stock: number
  category: {
    id: string
    name: string
  }
  averageRating: number
  reviewCount: number
  orderCount: number
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
}

export default function SellerProductsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    stock: "",
    categoryId: "",
    images: [] as File[],
  })
  const [imagePreview, setImagePreview] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!session) {
      router.push("/auth/login")
      return
    }
    if (session.user.role !== "SELLER") {
      router.push("/")
      return
    }
    fetchProducts()
    fetchCategories()
  }, [session, router])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/seller/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(Array.isArray(data.categories) ? data.categories : [])
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      setCategories([])
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }))

    // Create preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setImagePreview((prev) => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
    setImagePreview((prev) => {
      const newPreviews = prev.filter((_, i) => i !== index)
      return newPreviews
    })
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      stock: "",
      categoryId: "",
      images: [],
    })
    setImagePreview([])
    setEditingProduct(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("price", formData.price)
      formDataToSend.append("originalPrice", formData.originalPrice)
      formDataToSend.append("stock", formData.stock)
      formDataToSend.append("categoryId", formData.categoryId)

      formData.images.forEach((image) => {
        formDataToSend.append("images", image)
      })

      const url = editingProduct
        ? `/api/seller/products/${editingProduct.id}`
        : "/api/seller/products"
      const method = editingProduct ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      })

      if (response.ok) {
        toast.success(
          editingProduct ? "Product updated successfully!" : "Product added successfully!"
        )
        setIsAddDialogOpen(false)
        resetForm()
        fetchProducts()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to save product")
      }
    } catch (error) {
      console.error("Error saving product:", error)
      toast.error("An error occurred while saving the product")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch(`/api/seller/products/${productId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Product deleted successfully!")
        fetchProducts()
      } else {
        toast.error("Failed to delete product")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("An error occurred while deleting the product")
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      stock: product.stock.toString(),
      categoryId: product.category.id,
      images: [],
    })
    setImagePreview(product.images)
    setIsAddDialogOpen(true)
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category.id === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
              My{" "}
              <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Products
              </span>
            </h1>
            <p className="text-xl text-gray-600">
              Manage your product catalog and track performance
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <button className="bg-red-500 text-white p-2 rounded">Test Add Product</button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                    {editingProduct ? "Update your product information" : "Create a new product listing"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Basic Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Product Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter product name"
                        className="rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Category</label>
                      <Select value={formData.categoryId} onValueChange={(value) => handleInputChange("categoryId", value)}>
                        <SelectTrigger className="rounded-2xl border-2 border-gray-200 focus:border-orange-500">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                          {(categories ?? []).map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe your product..."
                      className="rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0"
                      rows={4}
                      required
                    />
                  </div>
                </div>

                <Separator />

                {/* Pricing and Stock */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Pricing & Stock
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Price (KSh)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      placeholder="0.00"
                        className="rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0"
                      required
                    />
                  </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700">Original Price (KSh)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.originalPrice}
                        onChange={(e) => handleInputChange("originalPrice", e.target.value)}
                        placeholder="0.00"
                        className="rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0"
                      />
                    </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Stock Quantity</label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => handleInputChange("stock", e.target.value)}
                      placeholder="0"
                        className="rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0"
                      required
                    />
                  </div>
                </div>
                </div>

                <Separator />

                {/* Images */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center">
                    <Camera className="h-4 w-4 mr-2" />
                    Product Images
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Upload product images</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                      <label
                        htmlFor="image-upload"
                        className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-2xl px-4 py-2 cursor-pointer transition-all duration-300"
                      >
                        Choose Files
                    </label>
                  </div>

                    {imagePreview.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imagePreview.map((preview, index) => (
                          <div key={index} className="relative">
                          <Image
                              src={preview}
                              alt={`Preview ${index + 1}`}
                            width={200}
                            height={200}
                            className="w-full h-32 object-cover rounded-2xl"
                          />
                          <Button
                            type="button"
                              variant="ghost"
                              size="icon"
                            onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600 rounded-full h-6 w-6"
                          >
                              <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false)
                      resetForm()
                    }}
                    className="rounded-2xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploading}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl"
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    {uploading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-0 bg-white/80 backdrop-blur-sm"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="rounded-2xl border-2 border-gray-200 focus:border-orange-500 bg-white/80 backdrop-blur-sm">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(categories ?? []).map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-300">
              <div className="relative aspect-square overflow-hidden rounded-t-3xl">
                  <Image
                  src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(product)}
                    className="bg-white/90 hover:bg-white text-gray-700 shadow-lg backdrop-blur-sm rounded-2xl h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-500/90 hover:bg-red-500 text-white shadow-lg backdrop-blur-sm rounded-2xl h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {product.stock === 0 && (
                  <Badge className="absolute top-4 left-4 bg-red-500 text-white border-0 shadow-lg rounded-2xl">
                    Out of Stock
                    </Badge>
                    )}
                  </div>

              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="rounded-full">
                        {product.category.name}
                      </Badge>
                  <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold">{Number(product.averageRating || 0).toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({product.reviewCount})</span>
                      </div>
                    </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Price</p>
                    <p className="font-bold text-lg text-orange-600">{formatPriceKsh(Number(product.price || 0))}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Stock</p>
                    <p className="font-bold text-gray-900">{product.stock}</p>
                      </div>
                  <div>
                    <p className="text-gray-600">Orders</p>
                    <p className="font-bold text-green-600">{product.orderCount}</p>
                      </div>
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="font-bold text-gray-900">{new Date(product.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                <div className="flex space-x-2">
                      <Button
                        variant="outline"
                    className="flex-1 border-2 border-orange-200 text-orange-600 hover:bg-orange-50 rounded-2xl"
                    onClick={() => router.push(`/cakes/${product.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                        onClick={() => handleEdit(product)}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* No Products */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Package className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your search criteria"
                : "Start by adding your first product"}
            </p>
            {!searchQuery && selectedCategory === "all" && (
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-2xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
