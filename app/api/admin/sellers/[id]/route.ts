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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { status, frozen, reason } = body

    // Validate status
    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"]
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Update seller profile status and/or frozen state
    const updatedSellerProfile = await prisma.sellerProfile.update({
      where: { id: params.id },
      data: {
        ...(status ? { status } : {}),
        ...(typeof frozen === "boolean" ? { frozen } : {}),
        freezeReason: frozen ? reason : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    })

    // Create notification for the seller
    let notificationType = "SELLER_STATUS"
    let notificationTitle = ""
    let notificationMessage = ""
    
    if (typeof frozen === "boolean") {
      notificationType = frozen ? "ACCOUNT_FREEZE" : "ACCOUNT_UNFREEZE"
      notificationTitle = frozen ? "Your seller account has been frozen" : "Your seller account has been unfrozen"
      notificationMessage = frozen
        ? `Reason: ${reason || "No reason provided."}`
        : "Your account is now active and you can continue selling."
    } else if (status) {
      notificationType = "SELLER_STATUS"
      switch (status) {
        case "APPROVED":
          notificationTitle = "🎉 Your seller application has been approved!"
          notificationMessage = "Congratulations! You can now start adding products and selling on our platform. Welcome to our community of sellers!"
          break
        case "REJECTED":
          notificationTitle = "Your seller application was rejected"
          notificationMessage = reason ? `Reason: ${reason}` : "Your application did not meet our requirements. You can reapply in the future."
          break
        case "PENDING":
          notificationTitle = "Your seller application is under review"
          notificationMessage = "We're currently reviewing your application. You'll receive a notification once the review is complete."
          break
        default:
          notificationTitle = `Your seller status was updated to ${status.toLowerCase()}`
          notificationMessage = reason ? `Reason: ${reason}` : `Your status is now ${status}`
      }
    }
    
    await prisma.notification.create({
      data: {
        userId: updatedSellerProfile.user.id,
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
      },
    })

    return NextResponse.json({
      id: updatedSellerProfile.id,
      businessName: updatedSellerProfile.businessName,
      description: updatedSellerProfile.description,
      status: updatedSellerProfile.status,
      frozen: updatedSellerProfile.frozen,
      freezeReason: updatedSellerProfile.freezeReason,
      user: updatedSellerProfile.user,
    })
  } catch (error) {
    console.error("Error updating seller status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 