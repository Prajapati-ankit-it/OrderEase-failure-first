import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '@orderease/shared-database';
import { OrderEventType, OrderEventSource, PaymentStatus } from '@prisma/client';

import {
  deriveOrderState,
  assertValidTransition,
  OrderState,
} from '../domain';
import { FakePaymentGateway } from '../infra/fake-payment.gateway';
import type { IPaymentRepository } from '../infra/payment.repository.interface';
import { PAYMENT_REPOSITORY } from '../infra/payment.repository.interface';

@Injectable()
export class PaymentOrchestratorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fakePaymentGateway: FakePaymentGateway,
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  /**
   * Initiates payment for an order.
   * This function ONLY emits PAYMENT_INITIATED.
   * It does NOT call any external gateway.
   */
  async initiatePayment(orderId: string): Promise<string> {
    return this.prisma.$transaction(async (tx) => {
      // ===============================
      // Step 1: Load order events
      // ===============================
      const events = await tx.orderEvent.findMany({
        where: { orderId },
        orderBy: { createdAt: 'asc' },
      });

      if (events.length === 0) {
        throw new BadRequestException(
          'Cannot initiate payment for non-existent order',
        );
      }

      // ===============================
      // Step 2: Derive current state
      // ===============================
      const currentState: OrderState = deriveOrderState(events);

      // ===============================
      // Step 3: Validate transition
      // ===============================
      assertValidTransition(
        currentState,
        OrderEventType.PAYMENT_INITIATED,
      );

      // ===============================
      // Step 4: Calculate payable amount
      // ===============================
      const orderItems = await tx.orderItem.findMany({
        where: { orderId },
      });

      // Amount in cents - use integer arithmetic
      const amount = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      if (amount <= 0) {
        throw new BadRequestException('Invalid payment amount');
      }

      // ===============================
      // Step 5: Create Payment record
      // ===============================
      const payment = await tx.payment.create({
        data: {
          orderId,
          provider: 'FAKE_GATEWAY',
          amount,
          status: PaymentStatus.INITIATED,
        },
      });

      // ===============================
      // Step 6: Emit PAYMENT_INITIATED event
      // ===============================
      await tx.orderEvent.create({
        data: {
          orderId,
          type: OrderEventType.PAYMENT_INITIATED,
          causedBy: OrderEventSource.SYSTEM,
          paymentId: payment.id,
          payload: {
            amount,
            provider: 'FAKE_GATEWAY',
          },
        },
      });

      return payment.id;
    });
  }

  /**
   * Process a payment - orchestrates the entire payment workflow
   * This is the main business logic for payment processing:
   * 1. Load payment and order events (in transaction)
   * 2. Derive current order state
   * 3. Validate that processing can proceed
   * 4. Call FakePaymentGateway to simulate external payment (OUTSIDE transaction)
   * 5. Validate state transition using domain state machine
   * 6. Update payment status and emit event (in new transaction)
   * 
   * Note: Gateway call is intentionally OUTSIDE transaction to avoid long-held locks.
   * This pattern assumes the external payment gateway is configured with reasonable
   * timeouts. In a real system, very long-running or stuck gateway calls can still
   * tie up worker threads and indirectly impact resources (e.g. connection pools)
   * under high concurrency, even though the database transaction is not held open.
   */
  async processPayment(paymentId: string): Promise<void> {
    // ===============================
    // Step 1-3: Load data and validate (inside transaction for consistency)
    // ===============================
    const { payment } = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        throw new BadRequestException('Payment not found');
      }

      // Idempotency check: ensure payment hasn't already been processed
      if (payment.status !== PaymentStatus.INITIATED) {
        throw new BadRequestException(
          `Payment ${paymentId} has already been processed with status: ${payment.status}`,
        );
      }

      return { payment };
    });

    // ===============================
    // Step 4: Call FakePaymentGateway to simulate external payment
    // This is OUTSIDE transaction to avoid holding DB locks during external call
    // ===============================
    let paymentResult: 'SUCCESS' | 'FAILED';
    let gatewayError: Error | null = null;

    try {
      paymentResult = await this.fakePaymentGateway.charge(paymentId);
    } catch (error) {
      // If the gateway call itself fails (e.g., timeout), treat as FAILED
      gatewayError = error instanceof Error ? error : new Error('Unknown payment gateway error');
      paymentResult = 'FAILED';
    }

    // ===============================
    // Step 5-7: Update database based on gateway response (new transaction)
    // ===============================
    await this.prisma.$transaction(async (tx) => {
      // Re-derive current state to check for race conditions
      const events = await tx.orderEvent.findMany({
        where: { orderId: payment.orderId },
        orderBy: { createdAt: 'asc' },
      });

      const currentState: OrderState = deriveOrderState(events);

      // Determine next event type based on gateway response
      const nextEventType = paymentResult === 'SUCCESS'
        ? OrderEventType.PAYMENT_SUCCEEDED
        : OrderEventType.PAYMENT_FAILED;

      // Validate state transition using domain state machine
      assertValidTransition(currentState, nextEventType);

      // Update payment status
      const newStatus = paymentResult === 'SUCCESS'
        ? PaymentStatus.SUCCEEDED
        : PaymentStatus.FAILED;

      await tx.payment.update({
        where: { id: payment.id },
        data: { status: newStatus },
      });

      // Emit OrderEvent (PAYMENT_SUCCEEDED / PAYMENT_FAILED)
      await tx.orderEvent.create({
        data: {
          orderId: payment.orderId,
          paymentId: payment.id,
          type: nextEventType,
          causedBy: OrderEventSource.PAYMENT_GATEWAY,
          payload: {
            amount: payment.amount,
            provider: payment.provider,
            simulated: true,
            result: paymentResult,
            ...(gatewayError && {
              errorMessage: gatewayError.message,
              errorType: 'GATEWAY_ERROR',
            }),
          },
        },
      });
    });

    // If there was a gateway error, propagate it after recording the failure
    if (gatewayError) {
      throw gatewayError;
    }
  }
}
