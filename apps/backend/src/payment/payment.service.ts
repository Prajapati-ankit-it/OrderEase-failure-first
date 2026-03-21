/**
 * Payment Service
 * Handles payment lifecycle with Razorpay integration
 * Follows exact flow specification
 */

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@orderease/shared-database';
import { OrderEventType, OrderEventSource, PaymentStatus } from '@prisma/client';
import { RazorpayService } from './razorpay.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly razorpayService: RazorpayService,
  ) {}

  /**
   * Initiate payment for an order
   * POST /payments/:orderId/initiate
   */
  async initiatePayment(orderId: string): Promise<{
    paymentId: string;
    razorpayOrderId: string;
    amount: number;
  }> {
    return this.prisma.$transaction(async (tx) => {
      // Step 1: Validate order exists and has items
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new BadRequestException('Order not found');
      }

      if (order.items.length === 0) {
        throw new BadRequestException('Order has no items');
      }

      // Step 2: Calculate amount from order items
      const amount = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      if (amount <= 0) {
        throw new BadRequestException('Invalid payment amount');
      }

      // Step 3: Create Razorpay order
      const razorpayOrder = await this.razorpayService.createOrder(
        amount,
        orderId,
      );

      // Step 4: Create Payment record
      const payment = await tx.payment.create({
        data: {
          orderId,
          provider: 'RAZORPAY',
          providerOrderId: razorpayOrder.id,
          amount,
          status: PaymentStatus.INITIATED,
        },
      });

      // Step 5: Emit PAYMENT_INITIATED event
      await tx.orderEvent.create({
        data: {
          orderId,
          type: OrderEventType.PAYMENT_INITIATED,
          causedBy: OrderEventSource.SYSTEM,
          paymentId: payment.id,
          payload: {
            amount,
            provider: 'RAZORPAY',
            razorpayOrderId: razorpayOrder.id,
          },
        },
      });

      this.logger.log(`Payment initiated successfully`, {
        paymentId: payment.id,
        orderId,
        amount,
        razorpayOrderId: razorpayOrder.id,
      });

      return {
        paymentId: payment.id,
        razorpayOrderId: razorpayOrder.id,
        amount,
      };
    });
  }

  /**
   * Verify payment and update status
   * POST /payments/verify
   */
  async verifyPayment(
    paymentId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    signature: string,
  ): Promise<{
    status: 'SUCCESS' | 'FAILED';
    message: string;
  }> {
    return this.prisma.$transaction(async (tx) => {
      // Step 1: Load payment and validate
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { order: true },
      });

      if (!payment) {
        throw new BadRequestException('Payment not found');
      }

      if (payment.status === PaymentStatus.SUCCEEDED) {
        return {
          status: 'SUCCESS',
          message: 'Payment already succeeded',
        };
      }

      if (payment.status !== PaymentStatus.INITIATED) {
        throw new BadRequestException(`Payment ${paymentId} is not in INITIATED status`);
      }

      // Step 2: Verify signature
      const isValidSignature = this.razorpayService.verifySignature(
        razorpayOrderId,
        razorpayPaymentId,
        signature,
      );

      if (!isValidSignature) {
        // Update payment to FAILED
        await tx.payment.update({
          where: { id: paymentId },
          data: { status: PaymentStatus.FAILED },
        });

        // Emit PAYMENT_FAILED event
        await tx.orderEvent.create({
          data: {
            orderId: payment.orderId,
            type: OrderEventType.PAYMENT_FAILED,
            causedBy: OrderEventSource.PAYMENT_GATEWAY,
            paymentId: payment.id,
            payload: {
              amount: payment.amount,
              provider: 'RAZORPAY',
              razorpayOrderId,
              razorpayPaymentId,
              error: 'Invalid signature',
            },
          },
        });

        this.logger.warn(`Payment verification failed - invalid signature`, {
          paymentId,
          razorpayOrderId,
          razorpayPaymentId,
        });

        return {
          status: 'FAILED',
          message: 'Invalid signature',
        };
      }

      // Step 3: Update payment to SUCCEEDED
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.SUCCEEDED,
          providerPaymentId: razorpayPaymentId,
        },
      });

      // Step 4: Emit PAYMENT_SUCCEEDED event
      await tx.orderEvent.create({
        data: {
          orderId: payment.orderId,
          type: OrderEventType.PAYMENT_SUCCEEDED,
          causedBy: OrderEventSource.PAYMENT_GATEWAY,
          paymentId: payment.id,
          payload: {
            amount: payment.amount,
            provider: 'RAZORPAY',
            razorpayOrderId,
            razorpayPaymentId,
          },
        },
      });

      this.logger.log(`Payment verified successfully`, {
        paymentId,
        orderId: payment.orderId,
        amount: payment.amount,
        razorpayOrderId,
        razorpayPaymentId,
      });

      return {
        status: 'SUCCESS',
        message: 'Payment verified successfully',
      };
    });
  }

  /**
   * Get payment details
   * GET /payments/:paymentId
   */
  async getPayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    return payment;
  }
}
