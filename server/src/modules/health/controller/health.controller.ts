import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { Public } from '../../../common/decorators';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  async check() {
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
}
