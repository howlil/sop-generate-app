import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../core/auth/auth.module';
import { SopCatalogModule } from '../sop/sop-catalog/sop-catalog.module';
import { EvaluasiNilaiController } from './evaluasi-nilai.controller';
import { EvaluasiUmpanBalikController } from './evaluasi-umpan-balik.controller';
import { EvaluasiUmpanBalikService } from './evaluasi-umpan-balik.service';
import { EvaluasiNilaiRepository } from './evaluasi-nilai.repository';
import { EvaluasiNilaiService } from './evaluasi-nilai.service';
import { EvaluasiWorkspaceController } from './evaluasi-workspace.controller';
import { EvaluasiWorkspaceRepository } from './evaluasi-workspace.repository';
import { EvaluasiWorkspaceService } from './evaluasi-workspace.service';
import { EvaluasiGrafikController } from './evaluasi-grafik.controller';
import { EvaluasiGrafikRepository } from './evaluasi-grafik.repository';
import { EvaluasiGrafikService } from './evaluasi-grafik.service';
import { PengajuanEvaluasiController } from './pengajuan-evaluasi.controller';
import { PengajuanEvaluasiDetailController } from './pengajuan-evaluasi-detail.controller';
import { PengajuanEvaluasiDetailRepository } from './pengajuan-evaluasi-detail.repository';
import { PengajuanEvaluasiDetailService } from './pengajuan-evaluasi-detail.service';
import { PengajuanEvaluasiRepository } from './pengajuan-evaluasi.repository';
import { PengajuanEvaluasiService } from './pengajuan-evaluasi.service';

@Module({
  imports: [AuthModule, forwardRef(() => SopCatalogModule)],
  controllers: [
    EvaluasiWorkspaceController,
    PengajuanEvaluasiController,
    PengajuanEvaluasiDetailController,
    EvaluasiNilaiController,
    EvaluasiUmpanBalikController,
    EvaluasiGrafikController,
  ],
  providers: [
    EvaluasiWorkspaceService,
    EvaluasiWorkspaceRepository,
    PengajuanEvaluasiRepository,
    PengajuanEvaluasiDetailRepository,
    PengajuanEvaluasiService,
    PengajuanEvaluasiDetailService,
    EvaluasiNilaiService,
    EvaluasiNilaiRepository,
    EvaluasiUmpanBalikService,
    EvaluasiGrafikService,
    EvaluasiGrafikRepository,
  ],
  exports: [EvaluasiNilaiService, EvaluasiNilaiRepository],
})
export class EvaluationModule {}
