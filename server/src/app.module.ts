import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { PrismaModule } from './common/prisma/prisma.module';
import { WinstonLoggerConfig } from './common/logger/winston.config';

@Module({
  imports: [

    // Use WinstonModule directly instead of LoggerModule wrapper
    WinstonModule.forRoot(WinstonLoggerConfig),

    PrismaModule,
  ],
})
export class AppModule {}
