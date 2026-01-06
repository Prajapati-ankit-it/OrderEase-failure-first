import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Liveness check - returns OK if the application is running
   * Does not check dependencies
   */
  getLiveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness check - returns OK if the application is ready to accept requests
   * Includes database connectivity check
   */
  async getReadiness() {
    const startTime = Date.now();
    let dbStatus = 'ok';
    let dbError: string | undefined;

    try {
      // Simple database ping using Prisma's $queryRaw
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      dbStatus = 'error';
      dbError = error instanceof Error ? error.message : 'Unknown error';
    }

    const responseTime = Date.now() - startTime;

    return {
      status: dbStatus === 'ok' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: dbStatus,
          ...(dbError && { error: dbError }),
          responseTime: `${responseTime}ms`,
        },
      },
    };
  }
}
