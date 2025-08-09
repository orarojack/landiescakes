import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

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

    const body = await request.json()
    const { status } = body

    // Validate status
    const validStatuses = ["PENDING", "PREPARING", "READY", "DELIVERED", "CANCELLED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Check if order contains products from this seller
    const orderItems = await prisma.orderItem.findMany({
      where: {
        orderId: params.id,
        product: {
          sellerId: user.sellerProfile.id,
        },
      },
    })

    if (orderItems.length === 0) {
      return NextResponse.json({ error: "Order not found or no products from this seller" }, { status: 404 })
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({
      id: updatedOrder.id,
      status: updatedOrder.status,
      paymentStatus: updatedOrder.paymentStatus,
      total: updatedOrder.total,
      createdAt: updatedOrder.createdAt,
      updatedAt: updatedOrder.updatedAt,
      user: updatedOrder.user,
      orderItems: updatedOrder.orderItems,
    })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 