import { Module } from '@nestjs/common';
import { TteRepository } from '../shared/repository/tte.repository';

@Module({
  providers: [TteRepository],
  exports: [TteRepository],
})
export class TteSharedModule {}
