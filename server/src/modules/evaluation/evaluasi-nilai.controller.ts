import { Body, Controller, Param, ParseUUIDPipe, Patch, Req } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { type ApiSuccessResponse, Roles, UseJwtAndRolesGuards } from '../../common';
import { PeranPengguna } from '../../generated/prisma';
import { ACCESS_TOKEN_COOKIE_NAME, type JwtAccessPayload } from '../core/auth/helpers/auth.shared';
import { IsiNilaiEvaluasiDto } from './dto/isi-nilai-evaluasi.dto';
import { NilaiEvaluasiPatchResponseDto } from './dto/nilai-evaluasi-patch-response.dto';
import { PengajuanEvaluasiSelesaiResponseDto } from './dto/pengajuan-evaluasi-selesai-response.dto';
import { SelesaiEvaluasiDto } from './dto/selesai-evaluasi.dto';
import { EvaluasiNilaiService } from './evaluasi-nilai.service';

@ApiTags('Evaluasi')
@Controller('evaluasi')
@UseJwtAndRolesGuards()
export class EvaluasiNilaiController {
  constructor(private readonly evaluasiNilaiService: EvaluasiNilaiService) {}

  @Patch(':pengajuanEvaluasiId/nilai/:detailSopId')
  @Roles(PeranPengguna.EVALUATOR, PeranPengguna.PJ_EVALUATOR)
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary: 'Isi / ubah nilai evaluasi untuk satu DetailSOP dalam pengajuan aktif',
    description:
      'Pengajuan harus berstatus SEDANG_DIEVALUASI atau MENUNGGU_EVALUASI (otomatis menjadi SEDANG_DIEVALUASI pada penyimpanan pertama). Hasil Perlu perbaikan wajib disertai catatan; catatan disalin ke umpan balik penyusun (Komentar); status dokumen diarahkan ke REVISI_DARI_TIM_EVALUASI.',
  })
  @ApiParam({ name: 'pengajuanEvaluasiId', format: 'uuid' })
  @ApiParam({ name: 'detailSopId', format: 'uuid' })
  @ApiResponse({ status: 200, type: NilaiEvaluasiPatchResponseDto })
  @ApiForbiddenResponse({ description: 'Bukan EVALUATOR atau PJ_EVALUATOR' })
  @ApiNotFoundResponse({ description: 'Pengajuan atau baris nilai tidak ditemukan' })
  @ApiConflictResponse({ description: 'Konflik versi optimistik' })
  async isiNilai(
    @Req() req: Request & { user: JwtAccessPayload },
    @Param('pengajuanEvaluasiId', ParseUUIDPipe) pengajuanEvaluasiId: string,
    @Param('detailSopId', ParseUUIDPipe) detailSopId: string,
    @Body() dto: IsiNilaiEvaluasiDto,
  ): Promise<ApiSuccessResponse<NilaiEvaluasiPatchResponseDto>> {
    const data = await this.evaluasiNilaiService.isiNilai(
      req.user,
      pengajuanEvaluasiId,
      detailSopId,
      dto,
    );
    return {
      message: 'Nilai evaluasi berhasil disimpan',
      success: true,
      data,
    };
  }

  @Patch(':pengajuanEvaluasiId/selesai')
  @Roles(PeranPengguna.EVALUATOR, PeranPengguna.PJ_EVALUATOR)
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary: 'Selesaikan pengajuan evaluasi (semua SOP harus SESUAI, lalu ajukan ke PJ)',
    description:
      'Memvalidasi seluruh baris NilaiEvaluasi berhasil SESUAI, memperbarui status dokumen ke SIAP_DIVERIFIKASI, dan mengubah pengajuan ke SELESAI_DIEVALUASI.',
  })
  @ApiParam({ name: 'pengajuanEvaluasiId', format: 'uuid' })
  @ApiResponse({ status: 200, type: PengajuanEvaluasiSelesaiResponseDto })
  @ApiForbiddenResponse({ description: 'Bukan EVALUATOR atau PJ_EVALUATOR' })
  @ApiNotFoundResponse({ description: 'Pengajuan tidak ditemukan' })
  async selesai(
    @Req() req: Request & { user: JwtAccessPayload },
    @Param('pengajuanEvaluasiId', ParseUUIDPipe) pengajuanEvaluasiId: string,
    @Body() dto: SelesaiEvaluasiDto,
  ): Promise<ApiSuccessResponse<PengajuanEvaluasiSelesaiResponseDto>> {
    const data = await this.evaluasiNilaiService.selesai(req.user, pengajuanEvaluasiId, dto);
    return {
      message: 'Pengajuan evaluasi berhasil diselesaikan',
      success: true,
      data,
    };
  }
}
