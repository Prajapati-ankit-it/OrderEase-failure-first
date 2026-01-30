import { Injectable, Inject } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PaymentOrchestratorService } from '../payment-orchestrator.service';
import { IPaymentRepository, PAYMENT_REPOSITORY } from '../../infra/payment.repository.interface';

@Injectable()
export class PaymentRecoveryWorker {
  // Payments stuck for more than 1 minute are considered recoverable
  private readonly STUCK_THRESHOLD_MS = 1 * 60 * 1000;

  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    private readonly paymentOrchestrator: PaymentOrchestratorService,
  ) {}

  async run(): Promise<void> {
    const cutoff = new Date(Date.now() - this.STUCK_THRESHOLD_MS);
    
    const stuckPayments = await this.paymentRepository.findStuckPayments(cutoff);

    for (const payment of stuckPayments) {
      try {
        await this.paymentOrchestrator.processPayment(payment.id);
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
