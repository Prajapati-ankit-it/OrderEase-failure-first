/**
 * Fake Payment Gateway
 * Pure gateway - simulates external payment provider ONLY
 * NO database access, NO business logic, NO event emission
 */

import { Injectable } from '@nestjs/common';

type FakePaymentMode =
  | 'ALWAYS_SUCCESS'
  | 'ALWAYS_FAIL'
  | 'FAIL_ONCE_THEN_SUCCESS';

@Injectable()
export class FakePaymentGateway {
  private readonly mode: FakePaymentMode = 'ALWAYS_SUCCESS';
  private failureCount = new Map<string, number>();

  /**
   * Simulate charging a payment through external provider
   * @param paymentId - The payment ID (used for fail-once mode tracking)
   * @returns 'SUCCESS' or 'FAILED'
   */
  async charge(paymentId: string): Promise<'SUCCESS' | 'FAILED'> {
    // Simulate network latency
    await this.simulateDelay();

    // Determine outcome based on mode
    switch (this.mode) {
      case 'ALWAYS_SUCCESS':
        return 'SUCCESS';

      case 'ALWAYS_FAIL':
        return 'FAILED';

      case 'FAIL_ONCE_THEN_SUCCESS': {
        const failures = this.failureCount.get(paymentId) || 0;
        if (failures === 0) {
          this.failureCount.set(paymentId, 1);
          return 'FAILED';
        }
        return 'SUCCESS';
      }

      default:
        return 'SUCCESS';
    }
  }

  private async simulateDelay(): Promise<void> {
    // Simulate 10-50ms network delay
    const delay = Math.random() * 40 + 10;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}
