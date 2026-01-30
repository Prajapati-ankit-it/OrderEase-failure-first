/**
 * Payment Repository Interface
 * Pure repository contract - only persistence operations
 * No business logic, no state machine, no event emission
 */

import { PaymentStatus, Prisma } from '@prisma/client';

// Type for Prisma transaction client
export type PrismaTransactionClient = Omit<
  Prisma.TransactionClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export interface IPaymentRepository {
  /**
   * Find a payment by its ID
   * @param paymentId - The payment ID
   * @param tx - Optional transaction client for transactional operations
   * @returns The payment record or null if not found
   */
  findById(
    paymentId: string,
    tx?: PrismaTransactionClient,
  ): Promise<{
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
   * @param tx - Optional transaction client for transactional operations
   * @returns The most recent payment record or null if none exists
   */
  findLatestByOrderId(
    orderId: string,
    tx?: PrismaTransactionClient,
  ): Promise<{
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
   * @param provider - Payment provider name
   * @param tx - Optional transaction client for transactional operations
   * @returns The created payment record
   */
  create(
    orderId: string,
    amount: number,
    provider: string,
    tx?: PrismaTransactionClient,
  ): Promise<{
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
   * @param tx - Optional transaction client for transactional operations
   */
  updateStatus(
    paymentId: string,
    status: PaymentStatus,
    tx?: PrismaTransactionClient,
  ): Promise<void>;

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
