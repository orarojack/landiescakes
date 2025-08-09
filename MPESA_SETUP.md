# M-Pesa Payment Integration Setup Guide

This guide will help you set up the M-Pesa payment integration for your cake marketplace.

## 🚀 Overview

The M-Pesa integration includes:
- **STK Push**: Initiates payment requests to customer phones
- **Callback Handling**: Processes payment confirmations
- **Status Polling**: Real-time payment status updates
- **Order Management**: Automatic order status updates
- **Security**: Signature verification and validation

## 📋 Prerequisites

1. **M-Pesa Developer Account**: Register at [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. **Business Short Code**: Get your M-Pesa business short code
3. **API Credentials**: Consumer key, consumer secret, and passkey
4. **Callback URL**: Publicly accessible URL for payment callbacks

## 🔧 Environment Variables

Add these variables to your `.env.local` file:

```bash
# M-Pesa Configuration
MPESA_BASE_URL="https://sandbox.safaricom.co.ke"
MPESA_CONSUMER_KEY="your-consumer-key"
MPESA_CONSUMER_SECRET="your-consumer-secret"
MPESA_PASSKEY="your-passkey"
MPESA_BUSINESS_SHORT_CODE="174379"
MPESA_CALLBACK_URL="https://your-domain.com/api/mpesa/callback"
```

### Environment Configuration

#### For Development (Sandbox):
```bash
MPESA_BASE_URL="https://sandbox.safaricom.co.ke"
MPESA_BUSINESS_SHORT_CODE="174379"
```

#### For Production (Live):
```bash
MPESA_BASE_URL="https://api.safaricom.co.ke"
MPESA_BUSINESS_SHORT_CODE="your-actual-shortcode"
```

## 🗄️ Database Migration

Run the database migration to add M-Pesa payment fields:

```bash
npx prisma migrate dev --name add_mpesa_payment_fields
```

This adds the following fields to the Order model:
- `mpesaMerchantRequestId`: M-Pesa merchant request ID
- `mpesaCheckoutRequestId`: M-Pesa checkout request ID
- `mpesaTransactionId`: M-Pesa transaction ID
- `mpesaPhoneNumber`: Customer phone number
- `mpesaPaymentTimestamp`: Payment timestamp
- `customerName`: Customer name for guest checkout
- `customerEmail`: Customer email for guest checkout

## 🔌 API Endpoints

### 1. Checkout API (`/api/checkout`)
- **Method**: POST
- **Purpose**: Initiates M-Pesa STK Push
- **Request Body**:
```json
{
  "items": [...],
  "phone": "07XXXXXXXX",
  "guestName": "John Doe",
  "guestEmail": "john@example.com"
}
```

### 2. M-Pesa Callback (`/api/mpesa/callback`)
- **Method**: POST
- **Purpose**: Handles payment confirmations from M-Pesa
- **Security**: Optional signature verification

### 3. Payment Status (`/api/mpesa/status/[orderId]`)
- **Method**: GET
- **Purpose**: Check payment status and poll for updates
- **Authentication**: Required (user must own the order)

## 📱 Frontend Integration

The checkout page now includes:
- **Real-time payment status polling**
- **Payment processing state**
- **Success/failure handling**
- **Automatic order confirmation**

### Payment Flow:
1. User fills checkout form
2. System creates order and initiates STK Push
3. User receives M-Pesa prompt on phone
4. Frontend polls payment status every 3 seconds
5. Order status updates automatically
6. User redirected to orders page on success

## 🧪 Testing

### Sandbox Testing:
1. Use sandbox credentials
2. Test with sandbox phone numbers
3. Use test amounts (KSh 1-1000)
4. Monitor logs for debugging

### Test Phone Numbers:
- `254708374149` (Success)
- `254708374150` (Insufficient funds)
- `254708374151` (User cancelled)

## 🔒 Security Considerations

1. **Signature Verification**: Enable in production
2. **HTTPS**: Required for callbacks
3. **Input Validation**: Phone number and amount validation
4. **Rate Limiting**: Implement API rate limiting
5. **Logging**: Monitor payment logs

## 🚨 Error Handling

Common M-Pesa errors and solutions:

| Error Code | Description | Solution |
|------------|-------------|----------|
| 1032 | Request cancelled by user | User cancelled payment |
| 1037 | Timeout | Network timeout, retry |
| 2001 | Invalid phone number | Validate phone format |
| 2002 | Invalid amount | Check amount limits |
| 2003 | Invalid shortcode | Verify business shortcode |

## 📊 Monitoring

Monitor these logs for payment issues:
- `[CHECKOUT API]` - Order creation and STK Push
- `[MPESA CALLBACK]` - Payment confirmations
- `[MPESA STATUS]` - Status polling
- `[MPESA]` - General M-Pesa operations

## 🔄 Production Deployment

1. **Update Environment Variables**:
   - Switch to production URLs
   - Use live credentials
   - Set production callback URL

2. **Database Migration**:
   ```bash
   npx prisma migrate deploy
   ```

3. **SSL Certificate**: Ensure HTTPS for callbacks

4. **Monitoring**: Set up payment monitoring

## 📞 Support

For M-Pesa API issues:
- [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
- [M-Pesa API Documentation](https://developer.safaricom.co.ke/docs)

For application issues:
- Check application logs
- Verify environment variables
- Test with sandbox credentials first

## 🎯 Next Steps

1. **Email Notifications**: Implement order confirmation emails
2. **SMS Notifications**: Add SMS order updates
3. **Payment Analytics**: Track payment success rates
4. **Refund Handling**: Implement refund functionality
5. **Multi-payment**: Support other payment methods

---

**Note**: Always test thoroughly in sandbox before going live with real payments! 