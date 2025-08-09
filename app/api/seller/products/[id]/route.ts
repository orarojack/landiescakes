export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { writeFile, unlink } from "fs/promises"
import { join } from "path"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { sellerProfile: true },
    })

    if (!user?.sellerProfile) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 })
    }

    // Check if product belongs to this seller
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.id,
        sellerId: user.sellerProfile.id,
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = parseFloat(formData.get("price") as string)
    const originalPrice = formData.get("originalPrice") as string
    const stock = parseInt(formData.get("stock") as string)
    const categoryId = formData.get("categoryId") as string
    const images = formData.getAll("images") as File[]

    // Validate required fields
    if (!name || !description || !price || !stock || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Handle image uploads
    const imageUrls: string[] = []
    
    for (const image of images) {
      if (image.size > 5 * 1024 * 1024) { // 5MB limit
        return NextResponse.json({ error: "Image size too large" }, { status: 400 })
      }

      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Generate unique filename
      const timestamp = Date.now()
      const filename = `${timestamp}-${image.name}`
      const uploadDir = join(process.cwd(), "public", "uploads")
      const filepath = join(uploadDir, filename)
      
      // Ensure upload directory exists
      await writeFile(filepath, buffer)
      
      imageUrls.push(`/uploads/${filename}`)
    }

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        stock,
        images: imageUrls.length > 0 ? imageUrls : existingProduct.images,
        categoryId,
      },
      include: {
        category: true,
        _count: {
          select: {
            orderItems: true,
            reviews: true,
          },
        },
      },
    })

    // Calculate average rating
    const reviews = await prisma.review.findMany({
      where: { productId: params.id },
      select: { rating: true },
    })

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0

    return NextResponse.json({
      id: updatedProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      originalPrice: updatedProduct.originalPrice,
      images: updatedProduct.images,
      stock: updatedProduct.stock,
      category: updatedProduct.category,
      averageRating,
      reviewCount: updatedProduct._count.reviews,
      orderCount: updatedProduct._count.orderItems,
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt,
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { sellerProfile: true },
    })

    if (!user?.sellerProfile) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 })
    }

    // Check if product belongs to this seller
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.id,
        sellerId: user.sellerProfile.id,
      },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if product has orders
    const orderItems = await prisma.orderItem.findMany({
      where: { productId: params.id },
    })

    if (orderItems.length > 0) {
      return NextResponse.json({ 
        error: "Cannot delete product with existing orders" 
      }, { status: 400 })
    }

    // Delete associated images from filesystem
    for (const imageUrl of existingProduct.images) {
      try {
        const imagePath = join(process.cwd(), "public", imageUrl)
        await unlink(imagePath)
      } catch (error) {
        console.error("Error deleting image file:", error)
      }
    }

    // Delete product
    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
