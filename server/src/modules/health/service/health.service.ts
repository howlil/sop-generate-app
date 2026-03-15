import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  uptime: number;
  timestamp: Date;
  database: {
    status: 'connected' | 'disconnected';
    responseTime?: number;
  };
  memory: {
    rss: string;
    heapUsed: string;
  };
}

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    let dbStatus: 'connected' | 'disconnected' = 'disconnected';
    let dbResponseTime: number | undefined;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
      dbResponseTime = Date.now() - startTime;
    } catch (error) {
      dbStatus = 'disconnected';
    }

    const memoryUsage = process.memoryUsage();

    return {
      status: dbStatus === 'connected' ? 'ok' : 'error',
      uptime: process.uptime(),
      timestamp: new Date(),
      database: {
        status: dbStatus,
        responseTime: dbResponseTime,
      },
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      },
    };
  }

  async isReady(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
