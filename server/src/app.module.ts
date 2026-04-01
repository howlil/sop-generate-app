import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: (config) => validateEnv(config),
    }),

    // Use WinstonModule directly instead of LoggerModule wrapper
    WinstonModule.forRoot(WinstonLoggerConfig),

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
