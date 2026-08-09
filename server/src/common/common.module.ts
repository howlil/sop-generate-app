import { Global, Module } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { RolesGuard } from './guards/roles.guard';
import { SecurityRateLimiterService } from './security/security-rate-limiter.service';

/**
 * Guard lintas fitur (tanpa `APP_GUARD` untuk JWT — tetap dipasang di controller).
 * `@Global()` agar modul fitur tidak perlu mengimpor CommonModule berulang (pol Nest umum).
 */
@Global()
@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
  providers: [JwtAuthGuard, RolesGuard, SecurityRateLimiterService],
  exports: [JwtAuthGuard, RolesGuard, SecurityRateLimiterService],
})
export class CommonModule {}
