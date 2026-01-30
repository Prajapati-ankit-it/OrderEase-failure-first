/**
 * Payment Repository Interface
 * Pure repository contract - only persistence operations
 * No business logic, no state machine, no event emission
 */

import { PaymentStatus } from '@prisma/client';

export interface IPaymentRepository {
  /**
   * Find a payment by its ID
   * @param paymentId - The payment ID
   * @returns The payment record or null if not found
   */
  findById(paymentId: string): Promise<{
    id: string;
    orderId: string;
    provider: string;
    amount: number;
    status: PaymentStatus;
    createdAt: Date;
    updatedAt: Date;
  } | null>;

  /**
   * Find the latest payment for an order
   * @param orderId - The order ID
   * @returns The most recent payment record or null if none exists
   */
  findLatestByOrderId(orderId: string): Promise<{
    id: string;
    orderId: string;
    provider: string;
    amount: number;
    status: PaymentStatus;
    createdAt: Date;
    updatedAt: Date;
  } | null>;

  /**
   * Create a new payment record
   * @param orderId - The order ID
   * @param amount - Payment amount in cents
   * @returns The created payment record
   */
  create(orderId: string, amount: number): Promise<{
    id: string;
    orderId: string;
    provider: string;
    amount: number;
    status: PaymentStatus;
    createdAt: Date;
    updatedAt: Date;
  }>;

  /**
   * Update payment status
   * @param paymentId - The payment ID
   * @param status - The new status
   */
  updateStatus(paymentId: string, status: PaymentStatus): Promise<void>;

  /**
   * Find payments that are stuck in INITIATED status
   * @param cutoffDate - Payments created before this date are considered stuck
   * @returns Array of stuck payment records
   */
  findStuckPayments(cutoffDate: Date): Promise<Array<{
    id: string;
    orderId: string;
    provider: string;
    amount: number;
    status: PaymentStatus;
    createdAt: Date;
    updatedAt: Date;
  }>>;
}

export const PAYMENT_REPOSITORY = Symbol('IPaymentRepository');
