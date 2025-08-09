import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mpesaService } from "@/lib/mpesa";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-mpesa-signature') || '';
    
    console.log("[MPESA CALLBACK] Received callback");
    console.log("[MPESA CALLBACK] Body:", body);
    console.log("[MPESA CALLBACK] Signature:", signature);

    // Verify callback signature (optional but recommended for security)
    // if (!mpesaService.verifyCallbackSignature(body, signature)) {
    //   console.error("[MPESA CALLBACK] Invalid signature");
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    const callbackData = JSON.parse(body);
    const paymentDetails = mpesaService.extractPaymentDetails(callbackData);

    console.log("[MPESA CALLBACK] Payment details:", paymentDetails);

    // Find the order using the merchant request ID
    const order = await prisma.order.findFirst({
      where: {
        mpesaMerchantRequestId: paymentDetails.merchantRequestId,
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
        user: true,
      },
    });

    if (!order) {
      console.error("[MPESA CALLBACK] Order not found for merchant request ID:", paymentDetails.merchantRequestId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    console.log("[MPESA CALLBACK] Found order:", order.id);

    // Update order based on payment result
    if (paymentDetails.resultCode === 0) {
      // Payment successful
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          mpesaTransactionId: paymentDetails.transactionId,
          mpesaPaymentTimestamp: new Date(),
        },
      });

      console.log("[MPESA CALLBACK] Payment successful for order:", order.id);

      // Send notification to customer (you can implement email/SMS here)
      try {
        // Example: Send email confirmation
        // await sendOrderConfirmationEmail(order.customerEmail, order);
        console.log("[MPESA CALLBACK] Order confirmation sent to:", order.customerEmail);
      } catch (notificationError) {
        console.error("[MPESA CALLBACK] Failed to send notification:", notificationError);
      }

      // Notify sellers about new order
      try {
        const sellerIds = [...new Set(order.orderItems.map(item => item.product.seller.id))];
        for (const sellerId of sellerIds) {
          await prisma.notification.create({
            data: {
              userId: sellerId,
              title: "New Order Received",
              message: `You have received a new order #${order.id.slice(-8)} for KSh ${order.total.toLocaleString()}`,
              type: "ORDER",
              isRead: false,
            },
          });
        }
        console.log("[MPESA CALLBACK] Seller notifications created");
      } catch (notificationError) {
        console.error("[MPESA CALLBACK] Failed to create seller notifications:", notificationError);
      }

    } else {
      // Payment failed
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
          status: "CANCELLED",
        },
      });

      console.log("[MPESA CALLBACK] Payment failed for order:", order.id, paymentDetails.resultDesc);
    }

    // Return success response to M-Pesa
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success",
    });

  } catch (error) {
    console.error("[MPESA CALLBACK] Error processing callback:", error);
    return NextResponse.json({ 
      error: "Failed to process callback" 
    }, { status: 500 });
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    message: "M-Pesa callback endpoint is active",
    timestamp: new Date().toISOString(),
  });
} 