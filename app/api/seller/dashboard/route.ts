import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { convertBigIntToNumber } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get seller profile
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!sellerProfile) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 })
    }



    // Get dashboard statistics
    const [totalProducts, totalOrders, totalRevenue, pendingOrders, recentOrders, topProducts, monthlyStats, dailyStats] =
      await Promise.all([
        // Total products
        prisma.product.count({
          where: {
            sellerId: sellerProfile.id,
            isActive: true,
          },
        }),

        // Total orders
        prisma.orderItem.count({
          where: {
            product: {
              sellerId: sellerProfile.id,
            },
          },
        }),

        // Total revenue
        prisma.orderItem.aggregate({
          _sum: { price: true },
          where: {
            product: {
              sellerId: sellerProfile.id,
            },
            order: {
              paymentStatus: "PAID",
              status: "DELIVERED", // Only count delivered orders
            },
          },
        }),

        // Pending orders
        prisma.orderItem.count({
          where: {
            product: {
              sellerId: sellerProfile.id,
            },
            order: {
              status: "PENDING",
            },
          },
        }),

        // Recent orders
        prisma.orderItem.findMany({
          where: {
            product: {
              sellerId: sellerProfile.id,
            },
          },
          include: {
            order: {
              select: {
                id: true,
                status: true,
                paymentStatus: true,
                createdAt: true, // <-- Added this line
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
            product: {
              select: {
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
          take: 10,
        }),

        // Top products
        prisma.product.findMany({
          where: { sellerId: sellerProfile.id },
          include: {
            _count: {
              select: {
                orderItems: true,
              },
            },
            category: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            orderItems: {
              _count: "desc",
            },
          },
          take: 5,
        }),

        // Monthly statistics (last 6 months)
        prisma.$queryRaw`
        SELECT 
          DATE_FORMAT(o.createdAt, '%Y-%m') as month,
          COUNT(DISTINCT o.id) as orders,
          SUM(oi.price * oi.quantity) as revenue
        FROM orders o
        JOIN order_items oi ON o.id = oi.orderId
        JOIN products p ON oi.productId = p.id
        WHERE p.sellerId = ${sellerProfile.id}
        AND o.createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        AND o.paymentStatus = 'PAID'
        GROUP BY DATE_FORMAT(o.createdAt, '%Y-%m')
        ORDER BY month DESC
        LIMIT 6
      `,

        // Daily statistics (last 30 days)
        prisma.$queryRaw`
        SELECT 
          DATE(o.createdAt) as day,
          COUNT(DISTINCT o.id) as orders,
          SUM(oi.price * oi.quantity) as revenue
        FROM orders o
        JOIN order_items oi ON o.id = oi.orderId
        JOIN products p ON oi.productId = p.id
        WHERE p.sellerId = ${sellerProfile.id}
        AND o.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND o.paymentStatus = 'PAID'
        GROUP BY DATE(o.createdAt)
        ORDER BY day DESC
        LIMIT 30
      `,
      ])

    const totalRevenueValue = Number(totalRevenue?._sum?.price) || 0;

    const stats = {
      profile: {
        ...sellerProfile,
        rating: 4.8, // Mock rating
        totalReviews: 127, // Mock review count
      },
      overview: {
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenueValue,
        averageOrderValue: totalOrders > 0 ? totalRevenueValue / totalOrders : 0,
        pendingOrders,
      },
      recentOrders: convertBigIntToNumber(recentOrders),
      topProducts: convertBigIntToNumber(topProducts.map((product) => ({
        ...product,
        orderCount: product._count.orderItems,
        rating: 4.7, // Mock rating
        stockQuantity: Math.floor(Math.random() * 50) + 10, // Mock stock
      }))),
      monthlyStats: Array.isArray(monthlyStats) ? monthlyStats.map(stat => ({
        ...stat,
        orders: Number(stat.orders ?? 0),
        revenue: Number(stat.revenue ?? 0),
      })) : [],
      dailyStats: Array.isArray(dailyStats) ? dailyStats.map(stat => ({
        ...stat,
        orders: Number(stat.orders ?? 0),
        revenue: Number(stat.revenue ?? 0),
        day: stat.day ? String(stat.day) : "",
      })) : [],
    }
    
    console.log('[DEBUG] Sending stats to frontend:', {
      totalRevenue: stats.overview.totalRevenue,
      totalOrders: stats.overview.totalOrders,
      monthlyStatsLength: stats.monthlyStats.length,
      dailyStatsLength: stats.dailyStats.length
    })

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching seller dashboard:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
