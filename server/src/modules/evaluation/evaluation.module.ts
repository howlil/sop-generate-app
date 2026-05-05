import { Module } from '@nestjs/common';
import { AuthModule } from '../core/auth/auth.module';
import { SopCatalogModule } from '../sop/sop-catalog/sop-catalog.module';
import { SopCommentModule } from '../sop/sop-comment/sop-comment.module';
import { EvaluasiNilaiController } from './evaluasi-nilai.controller';
import { EvaluasiNilaiRepository } from './evaluasi-nilai.repository';
import { EvaluasiNilaiService } from './evaluasi-nilai.service';
import { EvaluasiWorkspaceController } from './evaluasi-workspace.controller';
import { EvaluasiWorkspaceRepository } from './evaluasi-workspace.repository';
import { EvaluasiWorkspaceService } from './evaluasi-workspace.service';
import { EvaluasiGrafikController } from './evaluasi-grafik.controller';
import { EvaluasiGrafikRepository } from './evaluasi-grafik.repository';
import { EvaluasiGrafikService } from './evaluasi-grafik.service';
import { PengajuanEvaluasiController } from './pengajuan-evaluasi.controller';
import { PengajuanEvaluasiRepository } from './pengajuan-evaluasi.repository';
import { PengajuanEvaluasiService } from './pengajuan-evaluasi.service';

@Module({
  imports: [AuthModule, SopCatalogModule, SopCommentModule],
  controllers: [
    EvaluasiWorkspaceController,
    PengajuanEvaluasiController,
    EvaluasiNilaiController,
    EvaluasiGrafikController,
  ],
  providers: [
    EvaluasiWorkspaceService,
    EvaluasiWorkspaceRepository,
    PengajuanEvaluasiRepository,
    PengajuanEvaluasiService,
    EvaluasiNilaiService,
    EvaluasiNilaiRepository,
    EvaluasiGrafikService,
    EvaluasiGrafikRepository,
  ],
})
export class EvaluationModule {}
