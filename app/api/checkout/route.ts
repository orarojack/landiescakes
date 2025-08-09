import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { mpesaService, validateMpesaPhoneNumber } from "@/lib/mpesa";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items, phone, guestName, guestEmail } = body;
    
    console.log("[CHECKOUT API] Received items:", items);
    console.log("[CHECKOUT API] Received phone:", phone);
    console.log("[CHECKOUT API] Customer info:", { guestName, guestEmail });

    // Validate request
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!phone || !validateMpesaPhoneNumber(phone)) {
      return NextResponse.json({ 
        error: "Please provide a valid M-Pesa phone number (e.g. 07XXXXXXXX)" 
      }, { status: 400 });
    }

    if (!guestName?.trim()) {
      return NextResponse.json({ error: "Please provide your full name" }, { status: 400 });
    }

    if (!guestEmail?.match(/^\S+@\S+\.\S+$/)) {
      return NextResponse.json({ error: "Please provide a valid email address" }, { status: 400 });
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = total > 5000 ? 0 : 500;
    const finalTotal = total + deliveryFee;

    // Create order first
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total: finalTotal,
        status: "PENDING",
        shippingAddress: {}, // Not used for digital orders
        paymentMethod: "MPESA",
        paymentStatus: "PENDING",
        customerName: guestName,
        customerEmail: guestEmail,
        mpesaPhoneNumber: phone,
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    console.log("[CHECKOUT API] Order created:", order.id);

    try {
      // Initiate M-Pesa STK Push
      const stkResponse = await mpesaService.initiateSTKPush(
        phone,
        finalTotal,
        order.id,
        guestName
      );

      console.log("[CHECKOUT API] M-Pesa STK Push initiated:", stkResponse);

      // Update order with M-Pesa request IDs
      await prisma.order.update({
        where: { id: order.id },
        data: {
          mpesaMerchantRequestId: stkResponse.MerchantRequestID,
          mpesaCheckoutRequestId: stkResponse.CheckoutRequestID,
        },
      });

      // Check if we're in development mode
      const isDevMode = process.env.NODE_ENV === 'development' && (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET);
      
      return NextResponse.json({
        success: true,
        orderId: order.id,
        checkoutRequestId: stkResponse.CheckoutRequestID,
        message: isDevMode 
          ? "Development mode: Payment simulation initiated. Check status in 10 seconds." 
          : (stkResponse.CustomerMessage || "Please check your phone for M-Pesa prompt"),
        amount: finalTotal,
        devMode: isDevMode,
      });

    } catch (mpesaError) {
      console.error("[CHECKOUT API] M-Pesa error:", mpesaError);
      
      // Update order status to failed
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
        },
      });

      return NextResponse.json({
        error: mpesaError instanceof Error ? mpesaError.message : "M-Pesa payment failed",
        orderId: order.id,
      }, { status: 400 });
    }

  } catch (error) {
    console.error("[CHECKOUT API] Error in checkout:", error);
    return NextResponse.json({ 
      error: "Failed to process order" 
    }, { status: 500 });
  }
} 