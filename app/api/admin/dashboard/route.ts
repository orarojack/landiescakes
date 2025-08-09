import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { convertBigIntToNumber } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get dashboard statistics
    const [
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingSellers,
      allUsers,
      recentOrders,
      topProducts,
      monthlyStats,
      dailyStats,
      allProducts,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Total sellers
      prisma.sellerProfile.count({
        where: { status: "APPROVED" },
      }),

      // Total products
      prisma.product.count({
        where: { isActive: true },
      }),

      // Total orders
      prisma.order.count(),

      // Total revenue
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "PAID" },
      }),

      // Pending sellers
      prisma.sellerProfile.findMany({
        where: { status: "PENDING" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // All users with seller profiles
      prisma.user.findMany({
        include: {
          sellerProfile: true,
        },
        orderBy: { createdAt: "desc" },
      }),

      // Recent orders
      prisma.order.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  name: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // Top products
      prisma.product.findMany({
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
          DATE_FORMAT(createdAt, '%Y-%m') as month,
          COUNT(*) as orders,
          SUM(total) as revenue
        FROM orders 
        WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        AND paymentStatus = 'PAID'
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
        ORDER BY month DESC
        LIMIT 6
      `,

      // Daily statistics (last 30 days)
      prisma.$queryRaw`
        SELECT 
          DATE(createdAt) as day,
          COUNT(*) as orders,
          SUM(total) as revenue
        FROM orders 
        WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND paymentStatus = 'PAID'
        GROUP BY DATE(createdAt)
        ORDER BY day DESC
        LIMIT 30
      `,

      // All products
      prisma.product.findMany({
        include: {
          category: {
            select: { name: true },
          },
          seller: {
            select: { businessName: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ])

    const totalRevenueValue = totalRevenue && totalRevenue._sum && typeof totalRevenue._sum.total === 'number' && !isNaN(totalRevenue._sum.total) ? totalRevenue._sum.total : 0;

    const stats = {
      overview: {
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenueValue,
        averageOrderValue: totalOrders > 0 ? totalRevenueValue / totalOrders : 0,
        pendingSellers: pendingSellers.length,
        recentOrders: recentOrders.length,
      },
      users: allUsers.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        sellerProfile: user.sellerProfile ? {
          id: user.sellerProfile.id,
          businessName: user.sellerProfile.businessName,
          status: user.sellerProfile.status,
          frozen: user.sellerProfile.frozen,
          freezeReason: user.sellerProfile.freezeReason,
        } : undefined,
      })),
      orders: recentOrders.map(order => ({
        id: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: convertBigIntToNumber(order.total),
        createdAt: order.createdAt,
        user: order.user,
        orderItems: order.orderItems,
      })),
      products: allProducts.map((product) => ({
        id: product.id,
        name: product.name,
        price: convertBigIntToNumber(product.price),
        stock: product.stock,
        images: product.images,
        category: product.category,
        seller: product.seller,
        averageRating: 0,
        reviewCount: 0,
        orderCount: 0, // You can add real order count if needed
        createdAt: product.createdAt,
        flashSale: product.flashSale || false,
        isFeatured: product.isFeatured || false,
      })),
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
      categoryStats: [
        { label: "Birthday Cakes", value: 45, color: "#f97316" },
        { label: "Wedding Cakes", value: 30, color: "#ec4899" },
        { label: "Cupcakes", value: 15, color: "#8b5cf6" },
        { label: "Pastries", value: 10, color: "#06b6d4" },
      ],
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching admin dashboard:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
