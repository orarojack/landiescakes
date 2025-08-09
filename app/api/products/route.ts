export const runtime = "nodejs";
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const minPrice = Number.parseFloat(searchParams.get("minPrice") || "0")
    const maxPrice = Number.parseFloat(searchParams.get("maxPrice") || "1000")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const flashSale = searchParams.get("flashSale")
    const isFeatured = searchParams.get("isFeatured")
    const stock = searchParams.get("stock") || "all"
    const minRating = Number.parseFloat(searchParams.get("minRating") || "0")
    const sellerId = searchParams.get("sellerId") || ""

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category && category !== "all") {
      where.categoryId = category
    }

    if (flashSale === "true") {
      where.flashSale = true
    } else if (flashSale === "false") {
      where.flashSale = false
    }

    if (isFeatured === "true") {
      where.isFeatured = true
    } else if (isFeatured === "false") {
      where.isFeatured = false
    }

    if (stock === "in") {
      where.stock = { gt: 0 }
    } else if (stock === "out") {
      where.stock = 0
    }

    if (sellerId) {
      where.sellerId = sellerId
    }

    // Build orderBy clause
    const orderBy: any = {}
    switch (sortBy) {
      case "price":
        orderBy.price = sortOrder
        break
      case "name":
        orderBy.name = sortOrder
        break
      case "rating":
        // For now, we'll sort by createdAt since we don't have aggregated ratings
        orderBy.createdAt = sortOrder
        break
      default:
        orderBy.createdAt = sortOrder
    }

    // Get products with pagination
    let products, totalCount;
    if (isFeatured === "true") {
      // Only filter by isFeatured for featured products
      products = await prisma.product.findMany({
        where: { isFeatured: true },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          seller: {
            select: {
              id: true,
              businessName: true,
              logo: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy,
      });
      totalCount = products.length;
      console.log("[DEBUG] Featured products found:", products.map(p => ({ id: p.id, isFeatured: p.isFeatured })));
    } else {
      [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
            // allowNull: true // Prisma does not support allowNull, but will return null if not found
          },
          seller: {
            select: {
              id: true,
              businessName: true,
              logo: true,
            },
            // allowNull: true
          },
          reviews: {
            select: {
              rating: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])
    }

    console.log("[Products API] Found products:", products.length, "Total count:", totalCount)
    console.log("[Products API] Products:", products.map(p => ({ id: p.id, name: p.name, isActive: p.isActive })))

    // Calculate average rating for each product
    let productsWithRating = products.map((product) => {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        images: Array.isArray(product.images) ? product.images : ["/placeholder.svg?height=400&width=400"],
        stock: product.stock,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        reviewCount: product._count.reviews,
        category: product.category,
        seller: product.seller,
      }
    })

    // Filter by minRating if set
    if (minRating > 0) {
      productsWithRating = productsWithRating.filter(p => p.averageRating >= minRating)
    }

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      products: productsWithRating,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
