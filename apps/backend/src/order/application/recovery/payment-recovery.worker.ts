import { Injectable } from '@nestjs/common';
import { PrismaService } from '@orderease/shared-database';
import { FakePaymentGateway } from '../../infra/fake-payment.gateway';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentRecoveryWorker {
  private readonly STUCK_THRESHOLD_MS = 1 * 60 * 1000;
  private isProcessing = false; // 🚩 The Guard Flag

  constructor(
    private readonly prisma: PrismaService,
    private readonly fakePaymentGateway: FakePaymentGateway,
  ) {}

  async run(): Promise<void> {
    // 1️⃣ Check if a run is already in progress
    if (this.isProcessing) {
      console.log('[RecoveryWorker] Previous run still active, skipping...');
      return;
    }

    this.isProcessing = true; // 🔒 Lock it

    try {
      const cutoff = new Date(Date.now() - this.STUCK_THRESHOLD_MS);

      const stuckPayments = await this.prisma.payment.findMany({
        where: {
          status: PaymentStatus.INITIATED,
          createdAt: { lt: cutoff },
        },
      });

      for (const payment of stuckPayments) {
        try {
          await this.fakePaymentGateway.processPayment(payment.id);
          console.log(payment);
          
        } catch (err) {
          console.error(`[RecoveryWorker] Failed payment ${payment.id}`, err);
        }
      }
    } finally {
      this.isProcessing = false; // 🔓 Unlock it (Always runs, even on error)
    }
  }
}