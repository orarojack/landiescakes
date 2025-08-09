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
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { isFeatured } = await request.json()
    
    if (typeof isFeatured !== "boolean") {
      return NextResponse.json({ error: "isFeatured must be a boolean" }, { status: 400 })
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data: { isFeatured }
    })

    return NextResponse.json({ 
      message: `Product ${isFeatured ? "added to" : "removed from"} featured products`,
      product 
    })
  } catch (error) {
    console.error("Error updating featured status:", error)
    return NextResponse.json({ error: "Failed to update featured status" }, { status: 500 })
  }
} 