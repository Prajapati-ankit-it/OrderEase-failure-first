import { Injectable } from '@nestjs/common';
import { PrismaService } from '@orderease/shared-database';
import { PaymentOrchestratorService } from '../payment-orchestrator.service';

@Injectable()
export class PaymentRecoveryWorker {
  // Payments stuck for more than 1 minute are considered recoverable
  private readonly STUCK_THRESHOLD_MS = 1 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentOrchestrator: PaymentOrchestratorService,
  ) { }

  async run(): Promise<void> {

    await this.prisma.$transaction(async (tx) => {
      const cutoff = new Date(Date.now() - this.STUCK_THRESHOLD_MS);

      const lockedPayments = await tx.$queryRaw<
        { id: string; orderId: string }[]
      >`
    SELECT id, "orderId"
    FROM payments
    WHERE status = 'INITIATED'::"PaymentStatus"
      AND "createdAt" < ${cutoff}
    FOR UPDATE SKIP LOCKED
    LIMIT 10
  `;

      for (const payment of lockedPayments) {
        await this.paymentOrchestrator.processPayment(payment.id);
      }
    });

  }
}
