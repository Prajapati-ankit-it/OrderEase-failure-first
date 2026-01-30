/**
 * Prisma Payment Repository Implementation
 * Pure repository - ONLY persistence operations
 * NO business logic, NO state machine, NO event emission
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@orderease/shared-database';
import { PaymentStatus } from '@prisma/client';
import { IPaymentRepository } from './payment.repository.interface';

@Injectable()
export class PrismaPaymentRepository implements IPaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(paymentId: string) {
    return this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
  }

  async findLatestByOrderId(orderId: string) {
    return this.prisma.payment.findFirst({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(orderId: string, amount: number, provider: string) {
    return this.prisma.payment.create({
      data: {
        orderId,
        provider,
        amount,
        status: PaymentStatus.INITIATED,
      },
    });
  }

  async updateStatus(paymentId: string, status: PaymentStatus): Promise<void> {
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status },
    });
  }

  async findStuckPayments(cutoffDate: Date) {
    return this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.INITIATED,
        createdAt: { lt: cutoffDate },
      },
    });
  }
}
