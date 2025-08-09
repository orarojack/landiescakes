import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { convertBigIntToNumber } from "@/lib/utils"

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

    // Get all orders that contain products from this seller
    const orderItems = await prisma.orderItem.findMany({
      where: {
        product: {
          sellerId: user.sellerProfile.id,
        },
      },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
              },
            },
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            images: true,
          },
        },
      },
      orderBy: {
        order: {
          createdAt: "desc",
        },
      },
    })

    // Group order items by order
    const ordersMap = new Map()
    
    orderItems.forEach((item) => {
      const orderId = item.order.id
      
      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          id: item.order.id,
          status: item.order.status,
          paymentStatus: item.order.paymentStatus,
          total: 0,
          createdAt: item.order.createdAt,
          updatedAt: item.order.updatedAt,
          user: item.order.user,
          orderItems: [],
        })
      }
      
      const order = ordersMap.get(orderId)
      order.orderItems.push({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        product: item.product,
      })
      
      // Add to total only if this item belongs to this seller
      order.total += Number(item.price * item.quantity)
    })

    const orders = Array.from(ordersMap.values())

    return NextResponse.json(convertBigIntToNumber(orders))
  } catch (error) {
    console.error("Error fetching seller orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 