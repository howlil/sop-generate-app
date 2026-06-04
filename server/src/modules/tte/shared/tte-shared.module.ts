import { Module } from '@nestjs/common';
import { TteRepository } from '../shared/repository/tte.repository';
import { TtePublicUrlResolver } from './utils/tte-public-url.resolver';

@Module({
  providers: [TteRepository, TtePublicUrlResolver],
  exports: [TteRepository, TtePublicUrlResolver],
})
export class TteSharedModule {}
