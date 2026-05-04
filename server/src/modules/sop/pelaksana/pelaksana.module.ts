import { Module } from '@nestjs/common';
import { AuthModule } from '../../core/auth/auth.module';
import { PelaksanaController } from './pelaksana.controller';
import { PelaksanaRepository } from './pelaksana.repository';
import { PelaksanaService } from './pelaksana.service';

@Module({
  imports: [AuthModule],
  controllers: [PelaksanaController],
  providers: [PelaksanaService, PelaksanaRepository],
})
export class PelaksanaModule {}
