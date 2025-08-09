import crypto from 'crypto';

// M-Pesa API Configuration
const MPESA_CONFIG = {
  // Sandbox URLs (change to production URLs for live)
  BASE_URL: process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke',
  CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY || '',
  CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET || '',
  PASSKEY: process.env.MPESA_PASSKEY || '',
  BUSINESS_SHORT_CODE: process.env.MPESA_BUSINESS_SHORT_CODE || '174379',
  CALLBACK_URL: process.env.MPESA_CALLBACK_URL || 'https://your-domain.com/api/mpesa/callback',
  ENVIRONMENT: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  // Development mode flag
  DEV_MODE: process.env.NODE_ENV === 'development' && (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET),
};

// M-Pesa API Endpoints
const ENDPOINTS = {
  AUTH: '/oauth/v1/generate?grant_type=client_credentials',
  STK_PUSH: '/mpesa/stkpush/v1/processrequest',
  QUERY: '/mpesa/stkpushquery/v1/query',
};

export interface MpesaSTKPushRequest {
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  TransactionType: string;
  Amount: number;
  PartyA: string;
  PartyB: string;
  PhoneNumber: string;
  CallBackURL: string;
  AccountReference: string;
  TransactionDesc: string;
}

export interface MpesaSTKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface MpesaCallbackData {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

export interface MpesaQueryResponse {
  ResponseCode: string;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: string;
  ResultDesc: string;
}

class MpesaService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  /**
   * Get M-Pesa access token
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(
        `${MPESA_CONFIG.CONSUMER_KEY}:${MPESA_CONFIG.CONSUMER_SECRET}`
      ).toString('base64');

      const response = await fetch(`${MPESA_CONFIG.BASE_URL}${ENDPOINTS.AUTH}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`M-Pesa auth failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.access_token) {
        this.accessToken = data.access_token;
        // Set expiry to 1 hour from now (minus 5 minutes buffer)
        this.tokenExpiry = Date.now() + (data.expires_in * 1000) - (5 * 60 * 1000);
        return this.accessToken;
      } else {
        throw new Error('No access token received from M-Pesa');
      }
    } catch (error) {
      console.error('M-Pesa authentication error:', error);
      throw new Error('Failed to authenticate with M-Pesa');
    }
  }

  /**
   * Generate M-Pesa password
   */
  private generatePassword(): string {
    const timestamp = this.generateTimestamp();
    const password = `${MPESA_CONFIG.BUSINESS_SHORT_CODE}${MPESA_CONFIG.PASSKEY}${timestamp}`;
    return Buffer.from(password).toString('base64');
  }

  /**
   * Generate M-Pesa timestamp
   */
  private generateTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hour}${minute}${second}`;
  }

  /**
   * Format phone number for M-Pesa (remove +254 and add 254)
   */
  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If it starts with 0, replace with 254
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }
    
    // If it starts with +254, remove the +
    if (cleaned.startsWith('254')) {
      return cleaned;
    }
    
    // If it's already 11 digits (254XXXXXXXXX), return as is
    if (cleaned.length === 11) {
      return cleaned;
    }
    
    // If it's 9 digits (XXXXXXXXX), add 254
    if (cleaned.length === 9) {
      return '254' + cleaned;
    }
    
    throw new Error('Invalid phone number format');
  }

  /**
   * Initiate STK Push (Payment Request)
   */
  async initiateSTKPush(
    phoneNumber: string,
    amount: number,
    orderId: string,
    customerName: string
  ): Promise<MpesaSTKPushResponse> {
    try {
      // Check if we're in development mode without credentials
      if (MPESA_CONFIG.DEV_MODE) {
        console.log('[MPESA] Development mode - simulating STK Push');
        return this.simulateSTKPush(orderId, customerName);
      }

      const accessToken = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword();
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const requestBody: MpesaSTKPushRequest = {
        BusinessShortCode: MPESA_CONFIG.BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount), // M-Pesa expects whole numbers
        PartyA: formattedPhone,
        PartyB: MPESA_CONFIG.BUSINESS_SHORT_CODE,
        PhoneNumber: formattedPhone,
        CallBackURL: MPESA_CONFIG.CALLBACK_URL,
        AccountReference: orderId,
        TransactionDesc: `Cake Order - ${customerName}`,
      };

      console.log('[MPESA] STK Push Request:', {
        ...requestBody,
        Password: '[HIDDEN]',
        PhoneNumber: formattedPhone,
      });

      const response = await fetch(`${MPESA_CONFIG.BASE_URL}${ENDPOINTS.STK_PUSH}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[MPESA] STK Push failed:', errorText);
        throw new Error(`M-Pesa STK Push failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[MPESA] STK Push Response:', data);

      if (data.ResponseCode === '0') {
        return {
          MerchantRequestID: data.MerchantRequestID,
          CheckoutRequestID: data.CheckoutRequestID,
          ResponseCode: data.ResponseCode,
          ResponseDescription: data.ResponseDescription,
          CustomerMessage: data.CustomerMessage,
        };
      } else {
        throw new Error(`M-Pesa error: ${data.ResponseDescription}`);
      }
    } catch (error) {
      console.error('[MPESA] STK Push error:', error);
      throw error;
    }
  }

  /**
   * Simulate STK Push for development (when credentials are not set)
   */
  private simulateSTKPush(orderId: string, customerName: string): MpesaSTKPushResponse {
    const merchantRequestId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const checkoutRequestId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('[MPESA] Simulated STK Push for development');
    
    return {
      MerchantRequestID: merchantRequestId,
      CheckoutRequestID: checkoutRequestId,
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing',
      CustomerMessage: 'Success. Request accepted for processing',
    };
  }

  /**
   * Query STK Push status
   */
  async querySTKPush(
    checkoutRequestId: string,
    timestamp: string
  ): Promise<MpesaQueryResponse> {
    try {
      // Check if we're in development mode without credentials
      if (MPESA_CONFIG.DEV_MODE) {
        console.log('[MPESA] Development mode - simulating query');
        return this.simulateQuery(checkoutRequestId);
      }

      const accessToken = await this.getAccessToken();
      const password = this.generatePassword();

      const requestBody = {
        BusinessShortCode: MPESA_CONFIG.BUSINESS_SHORT_CODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      };

      const response = await fetch(`${MPESA_CONFIG.BASE_URL}${ENDPOINTS.QUERY}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`M-Pesa query failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[MPESA] Query Response:', data);

      return {
        ResponseCode: data.ResponseCode,
        ResponseDescription: data.ResponseDescription,
        MerchantRequestID: data.MerchantRequestID,
        CheckoutRequestID: data.CheckoutRequestID,
        ResultCode: data.ResultCode,
        ResultDesc: data.ResultDesc,
      };
    } catch (error) {
      console.error('[MPESA] Query error:', error);
      throw error;
    }
  }

  /**
   * Simulate query for development (when credentials are not set)
   */
  private simulateQuery(checkoutRequestId: string): MpesaQueryResponse {
    // Simulate successful payment after a delay
    const isSuccess = checkoutRequestId.startsWith('sim_') && Date.now() % 3 === 0; // 33% success rate for testing
    
    console.log('[MPESA] Simulated query result:', isSuccess ? 'SUCCESS' : 'PENDING');
    
    return {
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing',
      MerchantRequestID: checkoutRequestId,
      CheckoutRequestID: checkoutRequestId,
      ResultCode: isSuccess ? '0' : '1032', // 0 = success, 1032 = pending
      ResultDesc: isSuccess ? 'The service request is processed successfully.' : 'Request cancelled by user',
    };
  }

  /**
   * Verify callback signature (for security)
   */
  verifyCallbackSignature(body: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', MPESA_CONFIG.CONSUMER_SECRET)
        .update(body)
        .digest('hex');
      
      return signature === expectedSignature;
    } catch (error) {
      console.error('[MPESA] Signature verification error:', error);
      return false;
    }
  }

  /**
   * Extract payment details from callback
   */
  extractPaymentDetails(callbackData: MpesaCallbackData): {
    merchantRequestId: string;
    checkoutRequestId: string;
    resultCode: number;
    resultDesc: string;
    transactionId?: string;
    amount?: number;
    phoneNumber?: string;
  } {
    const stkCallback = callbackData.Body.stkCallback;
    const metadata = stkCallback.CallbackMetadata;

    let transactionId: string | undefined;
    let amount: number | undefined;
    let phoneNumber: string | undefined;

    if (metadata) {
      metadata.Item.forEach((item) => {
        switch (item.Name) {
          case 'TransactionID':
            transactionId = String(item.Value);
            break;
          case 'Amount':
            amount = Number(item.Value);
            break;
          case 'PhoneNumber':
            phoneNumber = String(item.Value);
            break;
        }
      });
    }

    return {
      merchantRequestId: stkCallback.MerchantRequestID,
      checkoutRequestId: stkCallback.CheckoutRequestID,
      resultCode: stkCallback.ResultCode,
      resultDesc: stkCallback.ResultDesc,
      transactionId,
      amount,
      phoneNumber,
    };
  }
}

// Export singleton instance
export const mpesaService = new MpesaService();

// Helper function to validate phone number
export function validateMpesaPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid Kenyan mobile number
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    return true;
  }
  
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return true;
  }
  
  if (cleaned.length === 9) {
    return true;
  }
  
  return false;
}

// Helper function to format amount for display
export function formatMpesaAmount(amount: number): string {
  return `KSh ${amount.toLocaleString()}`;
} 