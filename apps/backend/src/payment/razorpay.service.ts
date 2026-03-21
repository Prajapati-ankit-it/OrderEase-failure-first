/**
 * Razorpay Service
 * Pure external API wrapper - NO database access, NO business logic
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
  private readonly razorpay: Razorpay;

  constructor(private readonly configService: ConfigService) {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials not configured');
    }

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  /**
   * Create Razorpay order
   * @param amount - Amount in smallest currency unit (paise/cents)
   * @param receipt - Receipt identifier (our orderId)
   * @returns Razorpay order details
   */
  async createOrder(amount: number, receipt: string): Promise<{
    id: string;
    amount: number;
    currency: string;
    receipt: string;
    status: string;
  }> {
    try {
      const orderData = {
        amount: amount,
        currency: 'INR',
        receipt: receipt,
        notes: {
          source: 'orderease_backend',
        },
      };

      this.logger.debug(`Creating Razorpay order`, { amount, receipt });

      const order = await this.razorpay.orders.create(orderData);

      this.logger.log(`Razorpay order created successfully`, {
        razorpayOrderId: order.id,
        amount,
        receipt,
      });

      return {
        id: order.id,
        amount: Number(order.amount),
        currency: order.currency,
        receipt: order.receipt || '',
        status: order.status,
      };
    } catch (error) {
      this.logger.error(`Failed to create Razorpay order`, {
        amount,
        receipt,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Verify payment signature
   * @param orderId - Razorpay order ID
   * @param paymentId - Razorpay payment ID
   * @param signature - Razorpay signature
   * @returns True if signature is valid
   */
  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    try {
      const secret = this.configService.get<string>('RAZORPAY_KEY_SECRET');
      if (!secret) {
        throw new Error('Razorpay secret not configured for signature verification');
      }

      const crypto = require('crypto');
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      return crypto.timingSafeEqual(signature, expectedSignature);
    } catch (error) {
      this.logger.error(`Payment signature verification failed`, {
        orderId,
        paymentId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }
}
