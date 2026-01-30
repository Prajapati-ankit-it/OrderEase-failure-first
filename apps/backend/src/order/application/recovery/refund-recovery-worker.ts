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
      // We lock payment rows first, then extract unique order IDs
      const refundablePayments = await tx.$queryRaw<
        { orderId: string }[]
      >`
        SELECT p."orderId"
        FROM payments p
        WHERE p.status = 'SUCCEEDED'::"PaymentStatus"
          AND EXISTS (
            SELECT 1 FROM order_events oe
            WHERE oe."orderId" = p."orderId"
            AND oe.type = 'ORDER_CANCELLED'
          )
          AND NOT EXISTS (
            SELECT 1 FROM payments p2
            WHERE p2."orderId" = p."orderId"
            AND p2.status = 'REFUNDED'::"PaymentStatus"
          )
        FOR UPDATE OF p SKIP LOCKED
        LIMIT 10
      `;

      // Extract unique order IDs from locked payments
      const uniqueOrderIds = [...new Set(refundablePayments.map(p => p.orderId))];
      return uniqueOrderIds;
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
