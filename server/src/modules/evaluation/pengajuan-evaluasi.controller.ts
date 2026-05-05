import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, Req } from '@nestjs/common';
import {
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
import { CreatePengajuanEvaluasiDto } from './dto/create-pengajuan-evaluasi.dto';
import { PengajuanEvaluasiListQueryDto } from './dto/pengajuan-evaluasi-list-query.dto';
import { PengajuanEvaluasiService } from './pengajuan-evaluasi.service';

@ApiTags('Evaluasi')
@Controller('evaluasi')
@UseJwtAndRolesGuards()
export class PengajuanEvaluasiController {
  constructor(private readonly pengajuanEvaluasiService: PengajuanEvaluasiService) {}

  @Get()
  @Roles(PeranPengguna.PJ_EVALUATOR, PeranPengguna.EVALUATOR, PeranPengguna.PJ_PENYUSUN)
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary: 'Daftar pengajuan evaluasi',
    description:
      'PJ Evaluator dan Evaluator melihat seluruh pengajuan (dapat difilter). PJ Penyusun hanya melihat pengajuan untuk OPD-nya.',
  })
  @ApiResponse({ status: 200, description: 'Daftar payload pengajuan selaras kontrak front-end' })
  @ApiForbiddenResponse({ description: 'Peran tidak diizinkan' })
  async findAll(
    @Req() req: Request & { user: JwtAccessPayload },
    @Query() query: PengajuanEvaluasiListQueryDto,
  ): Promise<ApiSuccessResponse<Record<string, unknown>[]>> {
    const data = await this.pengajuanEvaluasiService.findAll(req.user, query);
    return {
      message: 'Daftar pengajuan evaluasi berhasil diambil',
      success: true,
      data,
    };
  }

  @Get(':pengajuanEvaluasiId')
  @Roles(PeranPengguna.PJ_EVALUATOR, PeranPengguna.EVALUATOR, PeranPengguna.PJ_PENYUSUN)
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({ summary: 'Detail satu pengajuan evaluasi (beserta nilai & riwayat ringkas)' })
  @ApiParam({ name: 'pengajuanEvaluasiId', format: 'uuid' })
  @ApiResponse({ status: 200 })
  @ApiForbiddenResponse({ description: 'Tidak boleh mengakses OPD lain (PJ Penyusun)' })
  @ApiNotFoundResponse({ description: 'Pengajuan tidak ditemukan' })
  async findOne(
    @Req() req: Request & { user: JwtAccessPayload },
    @Param('pengajuanEvaluasiId', ParseUUIDPipe) pengajuanEvaluasiId: string,
  ): Promise<ApiSuccessResponse<Record<string, unknown>>> {
    const data = await this.pengajuanEvaluasiService.findOne(req.user, pengajuanEvaluasiId);
    return {
      message: 'Detail pengajuan evaluasi berhasil diambil',
      success: true,
      data,
    };
  }

  @Post()
  @Roles(PeranPengguna.PJ_EVALUATOR)
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary: 'Buka batch evaluasi untuk sekumpulan DetailSOP satu OPD',
    description:
      'Endpoint administratif / batch terjadwal untuk PJ Evaluator. Evaluator mandiri tidak membutuhkan pemanggilan ini: workspace evaluator dapat mem-bootstrap pengajuan jenis MANDIRI otomatis. Jika dipanggil, membuat pengajuan berstatus SEDANG_DIEVALUASI, baris NilaiEvaluasi per dokumen, dan menyelaraskan status DetailSOP ke SEDANG_DIEVALUASI bila masuk pipeline evaluasi.',
  })
  @ApiResponse({ status: 201 })
  @ApiForbiddenResponse({ description: 'Bukan PJ Evaluator' })
  async create(
    @Req() req: Request & { user: JwtAccessPayload },
    @Body() dto: CreatePengajuanEvaluasiDto,
  ): Promise<ApiSuccessResponse<Record<string, unknown>>> {
    const data = await this.pengajuanEvaluasiService.create(req.user, dto);
    return {
      message: 'Pengajuan evaluasi berhasil dibuat',
      success: true,
      data,
    };
  }
}
