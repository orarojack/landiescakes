import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { rating, comment } = body

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    if (!comment || comment.trim().length < 10) {
      return NextResponse.json({ error: "Comment must be at least 10 characters long" }, { status: 400 })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { seller: true }
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if user has purchased this product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: params.id,
        order: {
          userId: session.user.id,
          paymentStatus: "PAID",
          status: { in: ["DELIVERED", "COMPLETED"] }
        }
      }
    })

    if (!hasPurchased) {
      return NextResponse.json({ 
        error: "You can only review products you have purchased and received" 
      }, { status: 403 })
    }

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: params.id
        }
      }
    })

    let review
    if (existingReview) {
      // Update existing review
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          comment: comment.trim()
        },
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        }
      })
    } else {
      // Create new review
      review = await prisma.review.create({
        data: {
          userId: session.user.id,
          productId: params.id,
          rating,
          comment: comment.trim()
        },
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        }
      })
    }

    // Update product's average rating
    const allReviews = await prisma.review.findMany({
      where: { productId: params.id }
    })

    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    const reviewCount = allReviews.length

    await prisma.product.update({
      where: { id: params.id },
      data: {
        averageRating,
        reviewCount
      }
    })

    return NextResponse.json({
      success: true,
      review,
      averageRating,
      reviewCount
    })

  } catch (error) {
    console.error("Error submitting review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    // Get all reviews for the product
    const reviews = await prisma.review.findMany({
      where: { productId: params.id },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Check if current user can review this product
    let canReview = false
    let hasReviewed = false
    let userReview = null

    if (session) {
      // Check if user has purchased this product
      const hasPurchased = await prisma.orderItem.findFirst({
        where: {
          productId: params.id,
          order: {
            userId: session.user.id,
            paymentStatus: "PAID",
            status: { in: ["DELIVERED", "COMPLETED"] }
          }
        }
      })

      canReview = !!hasPurchased

      // Check if user has already reviewed
      userReview = await prisma.review.findUnique({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId: params.id
          }
        }
      })

      hasReviewed = !!userReview
    }

    return NextResponse.json({
      reviews,
      canReview,
      hasReviewed,
      userReview
    })

  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 