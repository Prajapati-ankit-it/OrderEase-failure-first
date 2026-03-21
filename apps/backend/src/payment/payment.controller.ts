/**
 * Payment Controller
 * Handles payment-related API endpoints
 * Follows exact specification
 */

import { Controller, Post, Body, Param, Get, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Initiate payment for an order
   * POST /payments/:orderId/initiate
   */
  @Post(':orderId/initiate')
  async initiatePayment(@Param('orderId') orderId: string) {
    try {
      const result = await this.paymentService.initiatePayment(orderId);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Failed to initiate payment');
    }
  }

  /**
   * Verify payment
   * POST /payments/verify
   */
  @Post('verify')
  async verifyPayment(@Body() verifyDto: VerifyPaymentDto) {
    try {
      const result = await this.paymentService.verifyPayment(
        verifyDto.paymentId,
        verifyDto.razorpayOrderId,
        verifyDto.razorpayPaymentId,
        verifyDto.signature,
      );
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Failed to verify payment');
    }
  }

  /**
   * Get payment details
   * GET /payments/:paymentId
   */
  @Get(':paymentId')
  async getPayment(@Param('paymentId') paymentId: string) {
    try {
      const payment = await this.paymentService.getPayment(paymentId);
      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Failed to get payment');
    }
  }
}
