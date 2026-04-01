import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { TteController } from './controller/tte.controller';
import { TteService } from './service/tte.service';
import { TteRepository } from './repository/tte.repository';

@Module({
  imports: [PrismaModule],
  controllers: [TteController],
  providers: [TteService, TteRepository],
  exports: [TteService],
})
export class TteModule {}
