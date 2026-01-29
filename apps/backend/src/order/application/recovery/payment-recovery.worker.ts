import { Injectable } from '@nestjs/common';
import { PrismaService } from '@orderease/shared-database';
import { FakePaymentGateway } from '../../infra/fake-payment.gateway';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentRecoveryWorker {
  // Payments stuck for more than 1 minute are considered recoverable
  private readonly STUCK_THRESHOLD_MS = 1 * 60 * 1000;
  constructor(
    private readonly prisma: PrismaService,
    private readonly fakePaymentGateway: FakePaymentGateway,
  ) {}

  async run(): Promise<void> {
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
        console.log(
          `[RecoveryWorker] Successfully processed payment ${payment.id}`,
        );
      } catch (err) {
        console.error(
          `[RecoveryWorker] Failed to recover payment ${payment.id}`,
          err,
        );
      }
    }
  }
}
