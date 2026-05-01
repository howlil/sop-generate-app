import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { WinstonLoggerConfig } from './common/logger/winston.config';
import { PrismaModule } from './common/prisma/prisma.module';
import { validateEnv } from './config/env.validation';
import { CoreModule } from './modules/core/core.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: [`.env.${process.env.NODE_ENV ?? 'development'}.local`, '.env'],
      validate: validateEnv,
    }),
    WinstonModule.forRoot(WinstonLoggerConfig),
    PrismaModule,
    CoreModule,
  ],
})
export class AppModule {}
