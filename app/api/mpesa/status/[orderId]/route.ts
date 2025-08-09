import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mpesaService } from "@/lib/mpesa";

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = params;

    // Find the order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                seller: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If payment is already completed or failed, return current status
    if (order.paymentStatus === "PAID" || order.paymentStatus === "FAILED") {
      return NextResponse.json({
        orderId: order.id,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        transactionId: order.mpesaTransactionId,
        paymentTimestamp: order.mpesaPaymentTimestamp,
        total: order.total,
        message: order.paymentStatus === "PAID" 
          ? "Payment completed successfully" 
          : "Payment failed",
      });
    }

    // If payment is pending and we have checkout request ID, query M-Pesa
    if (order.paymentStatus === "PENDING" && order.mpesaCheckoutRequestId) {
      try {
        // Generate timestamp for query
        const now = new Date();
        const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        
        const queryResponse = await mpesaService.querySTKPush(
          order.mpesaCheckoutRequestId,
          timestamp
        );

        console.log("[MPESA STATUS] Query response:", queryResponse);

        // Update order based on query result
        if (queryResponse.ResultCode === "0") {
          // Payment successful
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: "PAID",
              status: "CONFIRMED",
              mpesaPaymentTimestamp: new Date(),
            },
          });

          return NextResponse.json({
            orderId: order.id,
            paymentStatus: "PAID",
            orderStatus: "CONFIRMED",
            total: order.total,
            message: "Payment completed successfully",
          });

        } else if (queryResponse.ResultCode === "1032") {
          // Request cancelled by user
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: "FAILED",
              status: "CANCELLED",
            },
          });

          return NextResponse.json({
            orderId: order.id,
            paymentStatus: "FAILED",
            orderStatus: "CANCELLED",
            total: order.total,
            message: "Payment was cancelled",
          });

        } else {
          // Still pending or other status
          return NextResponse.json({
            orderId: order.id,
            paymentStatus: "PENDING",
            orderStatus: order.status,
            total: order.total,
            message: "Payment is being processed. Please check your phone.",
          });
        }

      } catch (queryError) {
        console.error("[MPESA STATUS] Query error:", queryError);
        
        // Return current status if query fails
        return NextResponse.json({
          orderId: order.id,
          paymentStatus: order.paymentStatus,
          orderStatus: order.status,
          total: order.total,
          message: "Unable to check payment status. Please try again later.",
        });
      }
    }

    // Default response for pending orders without checkout request ID
    return NextResponse.json({
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      total: order.total,
      message: "Payment is being processed",
    });

  } catch (error) {
    console.error("[MPESA STATUS] Error:", error);
    return NextResponse.json({ 
      error: "Failed to check payment status" 
    }, { status: 500 });
  }
} 