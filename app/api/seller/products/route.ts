export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { writeFile } from "fs/promises"
import { join } from "path"
import { mkdir } from "fs/promises"

export async function GET() {
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

    if (user.sellerProfile.status !== "APPROVED") {
      return NextResponse.json({ 
        error: "Your seller account is not yet approved. Please wait for admin approval before managing products." 
      }, { status: 403 })
    }

    const products = await prisma.product.findMany({
      where: { sellerId: user.sellerProfile.id },
      include: {
        category: true,
        _count: {
          select: {
            orderItems: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Calculate average ratings
    const productsWithRatings = await Promise.all(
      products.map(async (product) => {
        const reviews = await prisma.review.findMany({
          where: { productId: product.id },
          select: { rating: true },
        })

        const averageRating = reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
          : 0

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          originalPrice: product.originalPrice,
          images: product.images,
          stock: product.stock,
          category: product.category,
          averageRating,
          reviewCount: product._count.reviews,
          orderCount: product._count.orderItems,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        }
      })
    )

    return NextResponse.json(productsWithRatings)
  } catch (error) {
    console.error("Error fetching seller products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    if (user.sellerProfile.status !== "APPROVED") {
      return NextResponse.json({ 
        error: "Your seller account is not yet approved. Please wait for admin approval before adding products." 
      }, { status: 403 })
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
      try {
        await mkdir(uploadDir, { recursive: true })
      } catch (error) {
        console.error("Error creating upload directory:", error)
      }
      
      await writeFile(filepath, buffer)
      
      imageUrls.push(`/uploads/${filename}`)
    }

    // Create product
    console.log("[Product Creation] Creating product with data:", {
      name,
      description,
      price,
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      stock,
      images: imageUrls,
      categoryId,
      sellerId: user.sellerProfile.id,
      isActive: true,
    })

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        stock,
        images: imageUrls,
        categoryId,
        sellerId: user.sellerProfile.id,
        isActive: true, // Explicitly set to true
      },
      include: {
        category: true,
      },
    })

    console.log("[Product Creation] Product created successfully:", product.id)

    return NextResponse.json({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      images: product.images,
      stock: product.stock,
      category: product.category,
      averageRating: 0,
      reviewCount: 0,
      orderCount: 0,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
