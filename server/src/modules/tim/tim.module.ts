import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { TimPenyusunController } from './controller/tim-penyusun.controller';
import { TimEvaluasiController } from './controller/tim-evaluasi.controller';
import { TimPenyusunService } from './service/tim-penyusun.service';
import { TimEvaluasiService } from './service/tim-evaluasi.service';
import { TimPenyusunRepository } from './repository/tim-penyusun.repository';
import { TimEvaluasiRepository } from './repository/tim-evaluasi.repository';

@Module({
  imports: [PrismaModule],
  controllers: [TimPenyusunController, TimEvaluasiController],
  providers: [
    TimPenyusunService,
    TimEvaluasiService,
    TimPenyusunRepository,
    TimEvaluasiRepository,
  ],
  exports: [TimPenyusunService, TimEvaluasiService],
})
export class TimModule {}
