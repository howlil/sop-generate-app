import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OpdController } from './opd.controller';
import { OpdRepository } from './opd.repository';
import { OpdService } from './opd.service';

@Module({
  imports: [AuthModule],
  controllers: [OpdController],
  providers: [OpdService, OpdRepository],
  exports: [OpdService],
})
export class OpdModule {}
