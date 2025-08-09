import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { convertBigIntToNumber } from "@/lib/utils"

export async function GET(request: NextRequest) {
  const all = request.nextUrl.searchParams.get("all")
  if (all) {
    const sellers = await prisma.sellerProfile.findMany({
      where: { status: "APPROVED" },
      select: { id: true, businessName: true },
      orderBy: { businessName: "asc" },
    })
    return NextResponse.json({ sellers })
  }
  return NextResponse.json({ sellers: [] })
}
