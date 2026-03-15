import { Module, Global } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { WinstonLoggerConfig } from './winston.config';

@Global()
@Module({
  imports: [WinstonModule.forRoot(WinstonLoggerConfig)],
  exports: [WinstonModule],
})
export class LoggerModule {}
