import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                seller: {
                  select: {
                    businessName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Add estimated delivery dates
    const ordersWithDelivery = orders.map((order) => ({
      ...order,
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    }))

    return NextResponse.json(ordersWithDelivery)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { items, total, shippingAddress, paymentMethod, paymentDetails, customerInfo } = body

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 })
    }

    if (!total || total <= 0) {
      return NextResponse.json({ error: "Invalid order total" }, { status: 400 })
    }

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          total,
          status: "PENDING",
          paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING",
          shippingAddress,
          paymentMethod,
          customerInfo: JSON.stringify(customerInfo),
          paymentDetails: JSON.stringify(paymentDetails),
          orderItems: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  seller: {
                    select: {
                      businessName: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      // Update product stock (if you have stock tracking)
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            // Assuming you have a stock field
            // stock: { decrement: item.quantity }
          },
        })
      }

      return newOrder
    })

    // Simulate payment processing for M-Pesa
    if (paymentMethod === "MPESA") {
      // In a real application, you would integrate with M-Pesa API here
      console.log(`Processing M-Pesa payment for ${paymentDetails.mpesaNumber}`)

      // Update payment status after successful payment
      setTimeout(async () => {
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: "PAID" },
        })
      }, 5000) // Simulate 5 second payment processing
    }

    return NextResponse.json(
      {
        order,
        message: "Order placed successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
