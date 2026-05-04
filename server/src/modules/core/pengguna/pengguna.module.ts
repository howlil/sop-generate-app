import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EvaluatorController } from './evaluator/evaluator.controller';
import { EvaluatorService } from './evaluator/evaluator.service';
import { KepalaOpdController } from './kepala-opd/kepala-opd.controller';
import { KepalaOpdRepository } from './kepala-opd/kepala-opd.repository';
import { KepalaOpdService } from './kepala-opd/kepala-opd.service';
import { PenggunaRepository } from './pengguna.repository';
import { PenyusunController } from './penyusun/penyusun.controller';
import { PenyusunRepository } from './penyusun/penyusun.repository';
import { PenyusunService } from './penyusun/penyusun.service';

@Module({
  imports: [AuthModule],
  controllers: [PenyusunController, EvaluatorController, KepalaOpdController],
  providers: [
    EvaluatorService,
    PenyusunService,
    PenyusunRepository,
    PenggunaRepository,
    KepalaOpdService,
    KepalaOpdRepository,
  ],
  exports: [
    EvaluatorService,
    PenyusunService,
    PenggunaRepository,
    PenyusunRepository,
    KepalaOpdService,
  ],
})
export class PenggunaModule {}
