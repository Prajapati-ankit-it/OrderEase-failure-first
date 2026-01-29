import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "@orderease/shared-database";
import { assertValidTransition, deriveOrderState, OrderState } from "../domain";
import { OrderEventSource, OrderEventType, PaymentStatus } from "@prisma/client";

@Injectable()
export class RefundOrchestratorService {
  constructor(private readonly prisma: PrismaService) {}

  async initiateRefund(orderId: string): Promise<string | null> {
    
    return this.prisma.$transaction(async (tx) => {

      const events = await tx.orderEvent.findMany({
        where: { orderId },
        orderBy: { createdAt: 'asc' },
      });

      if (events.length === 0) {
        throw new BadRequestException('Order not found');
      }

      const currentState = deriveOrderState(events);

      if (currentState !== OrderState.CANCELLED) {
        return null;
      }

      const payment = await tx.payment.findFirst({
        where: { orderId },
        orderBy: { createdAt: 'desc' },
      });

      if (!payment) return null;

      if (payment.status === PaymentStatus.REFUNDED) {
        return payment.id;
      }

      if (payment.status !== PaymentStatus.SUCCEEDED) {
        return null;
      }
      console.log("entering");
      
      // assertValidTransition(
      //   currentState,
      //   OrderEventType.PAYMENT_REFUNDED,
      // );

      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.REFUNDED },
      });

      await tx.orderEvent.create({
        data: {
          orderId,
          paymentId: payment.id,
          type: OrderEventType.PAYMENT_REFUNDED,
          causedBy: OrderEventSource.SYSTEM,
          payload: {
            amount: payment.amount,
            refundedAt: new Date().toISOString(),
          },
        },
      });

      return payment.id;
    });
  }
}
