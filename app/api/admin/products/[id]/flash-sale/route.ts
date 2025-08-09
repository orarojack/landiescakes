import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { flashSale } = await request.json()
    const product = await prisma.product.update({
      where: { id: params.id },
      data: { flashSale: !!flashSale },
    })
    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error("Error updating flash sale status:", error)
    return NextResponse.json({ error: "Failed to update flash sale status" }, { status: 500 })
  }
} 