import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { OpdModule } from './modules/opd/opd.module';
import { PeraturanModule } from './modules/peraturan/peraturan.module';
import { TimModule } from './modules/tim/tim.module';
import { SopModule } from './modules/sop/sop.module';
import { EvaluasiModule } from './modules/evaluasi/evaluasi.module';
import { TteModule } from './modules/tte/tte.module';
import { AuditModule } from './modules/audit/audit.module';
import { envSchema, validateEnv } from './config/env.validation';
import { WinstonLoggerConfig } from './common/logger/winston.config';

// Rate limiting configuration
const AUTH_THROTTLE_TTL_MS = 60 * 1000; // 1 minute
const AUTH_THROTTLE_LIMIT = 5; // 5 requests per minute for auth endpoints
const GENERAL_THROTTLE_TTL_MS = 60 * 60 * 1000; // 1 hour
const GENERAL_THROTTLE_LIMIT = 100; // 100 requests per hour for general API

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: (config) => validateEnv(config),
    }),

    // Use WinstonModule directly instead of LoggerModule wrapper
    WinstonModule.forRoot(WinstonLoggerConfig),

    // Rate Limiting - protect against brute force attacks
    // Separate configs for auth (strict) and general API (relaxed)
    ThrottlerModule.forRoot([
      {
        name: 'auth',
        ttl: AUTH_THROTTLE_TTL_MS,
        limit: AUTH_THROTTLE_LIMIT,
      },
      {
        name: 'general',
        ttl: GENERAL_THROTTLE_TTL_MS,
        limit: GENERAL_THROTTLE_LIMIT,
      },
    ]),

    PrismaModule,
    AuthModule,
    UsersModule,
    HealthModule,
    OpdModule,
    PeraturanModule,
    TimModule,
    SopModule,
    EvaluasiModule,
    TteModule,
    AuditModule,
  ],
})
export class AppModule {}
