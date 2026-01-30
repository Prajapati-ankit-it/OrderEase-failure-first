import { Injectable } from '@nestjs/common';
import { PrismaService } from '@orderease/shared-database';
import { PaymentOrchestratorService } from '../payment-orchestrator.service';

@Injectable()
export class PaymentRecoveryWorker {
  private readonly STUCK_THRESHOLD_MS = 1 * 60 * 1000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentOrchestrator: PaymentOrchestratorService,
  ) { }
  
  async run(): Promise<void> {
    // ===============================
    // Phase 1: CLAIM - Short transaction with row locking
    // ===============================
    const claimedPayments = await this.prisma.$transaction(async (tx) => {
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

      return lockedPayments;
    });

    // ===============================
    // Phase 2: PROCESS - Outside transaction
    // Each payment processes in its own independent transaction
    // ===============================
    for (const payment of claimedPayments) {
      try {
        await this.paymentOrchestrator.processPayment(payment.id);
        console.log(`[PaymentRecoveryWorker] Successfully processed payment ${payment.id}`);
      } catch (error) {
        console.error(
          `[PaymentRecoveryWorker] Failed to process payment ${payment.id}`,
          error,
        );
      }
    }
  }
}
