import { Injectable } from '@nestjs/common';
import { PrismaService } from '@orderease/shared-database';
import { RefundOrchestratorService } from '../refund-orchestrator.service';

@Injectable()
export class RefundRecoveryWorker {
  constructor(
    private readonly prisma: PrismaService,
    private readonly refundOrchestrator: RefundOrchestratorService,
  ) {}

  async run(): Promise<void> {
    // ===============================
    // Phase 1: CLAIM - Short transaction with row locking
    // ===============================
    const claimedOrders = await this.prisma.$transaction(async (tx) => {
      // Find orders eligible for refund using PostgreSQL row locking
      const refundablePayments = await tx.$queryRaw<
        { id: string; orderId: string }[]
      >`
        SELECT DISTINCT p."orderId"
        FROM payments p
        JOIN order_events oe
          ON oe."orderId" = p."orderId"
        WHERE oe.type = 'ORDER_CANCELLED'
          AND p.status = 'SUCCEEDED'::"PaymentStatus"
          AND NOT EXISTS (
            SELECT 1 FROM payments p2
            WHERE p2."orderId" = p."orderId"
            AND p2.status = 'REFUNDED'::"PaymentStatus"
          )
        FOR UPDATE OF p SKIP LOCKED
        LIMIT 10
      `;

      return refundablePayments.map(p => p.orderId);
    });

    // ===============================
    // Phase 2: PROCESS - Outside transaction
    // Each refund runs in its own independent transaction
    // ===============================
    for (const orderId of claimedOrders) {
      try {
        await this.refundOrchestrator.initiateRefund(orderId);
        console.log(`[RefundRecoveryWorker] Successfully processed refund for order ${orderId}`);
      } catch (error) {
        console.error(
          `[RefundRecoveryWorker] Failed to process refund for order ${orderId}`,
          error,
        );
        // Continue processing other orders even if one fails
      }
    }
  }
}
