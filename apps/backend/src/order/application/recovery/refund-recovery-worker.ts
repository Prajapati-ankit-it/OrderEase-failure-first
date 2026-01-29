import { Injectable } from "@nestjs/common";
import { OrderEventType } from "@prisma/client";
import { RefundOrchestratorService } from "../refund-orchestrator.service";
import { PrismaService } from "@orderease/shared-database";

@Injectable()
export class RefundRecoveryWorker {
    constructor(
        private readonly prisma: PrismaService,
        private readonly refundOrchestrator: RefundOrchestratorService,
      ) {}
  async run() {
    const cancelledOrders = await this.prisma.orderEvent.groupBy({
      by: ['orderId'],
      where: { type: OrderEventType.ORDER_CANCELLED },
    });

    for (const order of cancelledOrders) {
      await this.refundOrchestrator.initiateRefund(order.orderId);
    }
  }
}
