import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { EvaluasiController } from './controller/evaluasi.controller';
import { EvaluasiService } from './service/evaluasi.service';
import { EvaluasiRepository } from './repository/evaluasi.repository';

@Module({
  imports: [PrismaModule],
  controllers: [EvaluasiController],
  providers: [EvaluasiService, EvaluasiRepository],
  exports: [EvaluasiService],
})
export class EvaluasiModule {}
