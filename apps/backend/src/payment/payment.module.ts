/**
 * Payment Module
 * Independent module for handling payment lifecycle with Razorpay
 */

import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { RazorpayService } from './razorpay.service';
import { DatabaseModule } from '@orderease/shared-database';

@Module({
  imports: [DatabaseModule],
  controllers: [PaymentController],
  providers: [PaymentService, RazorpayService],
  exports: [PaymentService],
})
export class PaymentModule {}
