import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reason } = await request.json()

    const sellerProfile = await prisma.sellerProfile.update({
      where: { id: params.id },
      data: {
        status: "REJECTED",
        // You could add a rejection reason field to the schema
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: "Seller rejected successfully",
      seller: sellerProfile,
      reason,
    })
  } catch (error) {
    console.error("Error rejecting seller:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
