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
    await this.prisma.$transaction(async (tx) => {
      const refundablePayments = await tx.$queryRaw<
        { id: string; orderId: string }[]
      >`
        SELECT p.id, p."orderId"
        FROM payments p
        JOIN order_events oe
          ON oe."orderId" = p."orderId"
        WHERE oe.type = 'ORDER_CANCELLED'
          AND p.status = 'SUCCEEDED'::"PaymentStatus"
        FOR UPDATE SKIP LOCKED
        LIMIT 10
      `;

      for (const payment of refundablePayments) {
        await this.refundOrchestrator.initiateRefund(payment.orderId);
      }
    });
  }
}
