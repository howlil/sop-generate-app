import { Module } from '@nestjs/common';
import { TteController } from './tte.controller';
import { TteRepository } from './tte.repository';
import { TteService } from './tte.service';

@Module({
  controllers: [TteController],
  providers: [TteService, TteRepository],
  exports: [TteService],
})
export class TteModule {}
