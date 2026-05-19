import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { type ApiSuccessResponse, Roles, UseJwtAndRolesGuards } from '../../../common';
import { PeranPengguna } from '../../../generated/prisma';
import { ACCESS_TOKEN_COOKIE_NAME, type JwtAccessPayload } from '../../core/auth/helpers/auth.shared';
import { CreateSopDto } from './dto/create-sop.dto';
import { ListSopQueryDto } from './dto/list-sop-query.dto';
import { PenyusunWorkbenchDataDto } from './dto/penyusun-workbench-data.dto';
import { SopDaftarRowDto } from './dto/sop-daftar-row.dto';
import { SopRiwayatVersiRowDto } from './dto/sop-riwayat-versi-row.dto';
import { UpdateDetailSopStatusDto } from './dto/update-detail-sop-status.dto';
import { UpdateSopHeaderDto } from './dto/update-sop-header.dto';
import { SopCatalogService } from './sop-catalog.service';

@ApiTags('SOP')
@Controller('sop')
@UseJwtAndRolesGuards()
export class SopCatalogController {
  constructor(private readonly sopCatalogService: SopCatalogService) {}

  @Get('penyusun-workbench/:detailSopId')
  @Roles(
    PeranPengguna.PENYUSUN,
    PeranPengguna.PJ_PENYUSUN,
    PeranPengguna.KEPALA_OPD,
    PeranPengguna.EVALUATOR,
    PeranPengguna.PJ_EVALUATOR,
  )
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary:
      'Workbench penyusun: detail DetailSOP + langkah + log edit (satu response). Param :detailSopId boleh berupa ID DetailSOP atau ID header SOP (sopId); jika sopId, dipakai versi DetailSOP terbaru.',
  })
  @ApiQuery({
    name: 'logsLimit',
    required: false,
    description: 'Jumlah maksimum entri logEdit (1–500, default 100)',
    schema: { default: 100, minimum: 1, maximum: 500 },
  })
  @ApiResponse({ status: 200, type: PenyusunWorkbenchDataDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse({ description: 'DetailSOP tidak ditemukan' })
  async getPenyusunWorkbench(
    @Req() req: Request & { user: JwtAccessPayload },
    @Param('detailSopId', ParseUUIDPipe) detailSopId: string,
    @Query('logsLimit', new DefaultValuePipe(100), ParseIntPipe) logsLimit: number,
  ): Promise<ApiSuccessResponse<PenyusunWorkbenchDataDto>> {
    const data = await this.sopCatalogService.getPenyusunWorkbench(req.user, detailSopId, logsLimit);
    return {
      message: 'Data workbench penyusun berhasil diambil',
      success: true,
      data,
    };
  }

  @Post('penyusun-workbench/:detailSopId/kirim-ulang-evaluasi')
  @HttpCode(200)
  @Roles(PeranPengguna.PENYUSUN, PeranPengguna.PJ_PENYUSUN)
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary:
      'Kirim ulang ke evaluator setelah revisi (satu aksi: SIAP_DIEVALUASI lalu DIAJUKAN_EVALUASI dalam transaksi)',
    description:
      'Hanya untuk DetailSOP berstatus REVISI_DARI_EVALUATOR. Memvalidasi kelengkapan dokumen seperti tombol Selesai/Siap dievaluasi, lalu mengajukan kembali ke evaluator tanpa langkah terpisah di Manajemen SOP. Param :detailSopId boleh ID DetailSOP atau ID header SOP.',
  })
  @ApiQuery({
    name: 'logsLimit',
    required: false,
    description: 'Jumlah maksimum entri logEdit pada response workbench (1–500, default 100)',
    schema: { default: 100, minimum: 1, maximum: 500 },
  })
  @ApiResponse({ status: 200, type: PenyusunWorkbenchDataDto })
  @ApiBadRequestResponse({ description: 'SOP belum lengkap untuk diajukan kembali' })
  @ApiConflictResponse({ description: 'Status bukan REVISI_DARI_EVALUATOR' })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse({ description: 'DetailSOP tidak ditemukan' })
  async kirimUlangEvaluasiSetelahRevisi(
    @Req() req: Request & { user: JwtAccessPayload },
    @Param('detailSopId', ParseUUIDPipe) detailSopId: string,
    @Query('logsLimit', new DefaultValuePipe(100), ParseIntPipe) logsLimit: number,
  ): Promise<ApiSuccessResponse<PenyusunWorkbenchDataDto>> {
    const data = await this.sopCatalogService.kirimUlangKeEvaluatorSetelahRevisi(
      req.user,
      detailSopId,
      logsLimit,
    );
    return {
      message: 'SOP berhasil dikirim ulang ke evaluator',
      success: true,
      data,
    };
  }

  @Get()
  @Roles(
    PeranPengguna.PENYUSUN,
    PeranPengguna.PJ_PENYUSUN,
    PeranPengguna.KEPALA_OPD,
    PeranPengguna.EVALUATOR,
    PeranPengguna.PJ_EVALUATOR,
  )
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary:
      'Daftar SOP header untuk OPD pengguna (versi DetailSOP terbaru per SOP). Filter opsional: status, tanggalDari, tanggalSampai (YYYY-MM-DD, tanggal dari `updatedAt` UTC).',
  })
  @ApiQuery({ name: 'status', required: false, description: 'Status DetailSOP terbaru atau `all`' })
  @ApiQuery({ name: 'tanggalDari', required: false, description: 'Batas bawah tanggal terakhir diperbarui (YYYY-MM-DD)' })
  @ApiQuery({
    name: 'tanggalSampai',
    required: false,
    description: 'Batas atas tanggal terakhir diperbarui (YYYY-MM-DD)',
  })
  @ApiResponse({ status: 200, type: [SopDaftarRowDto] })
  @ApiBadRequestResponse({ description: 'Rentang tanggal tidak valid (tanggalDari > tanggalSampai)' })
  @ApiForbiddenResponse()
  async list(
    @Req() req: Request & { user: JwtAccessPayload },
    @Query() query: ListSopQueryDto,
  ): Promise<ApiSuccessResponse<SopDaftarRowDto[]>> {
    const data = await this.sopCatalogService.listForCurrentUser(req.user, query);
    return {
      message: 'Daftar SOP berhasil diambil',
      success: true,
      data,
    };
  }

  @Post()
  @HttpCode(201)
  @Roles(PeranPengguna.PENYUSUN, PeranPengguna.PJ_PENYUSUN)
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({ summary: 'Buat SOP baru (header + DetailSOP versi 1, DRAFT)' })
  @ApiResponse({ status: 201, type: SopDaftarRowDto })
  @ApiConflictResponse({ description: 'Nomor SOP bentrok (unik global)' })
  @ApiForbiddenResponse()
  async create(
    @Req() req: Request & { user: JwtAccessPayload },
    @Body() dto: CreateSopDto,
  ): Promise<ApiSuccessResponse<SopDaftarRowDto>> {
    const data = await this.sopCatalogService.createForPenyusun(req.user, dto);
    return {
      message: 'SOP berhasil dibuat',
      success: true,
      data,
    };
  }

  @Patch('status/:detailSopId')
  @Roles(PeranPengguna.PENYUSUN, PeranPengguna.PJ_PENYUSUN, PeranPengguna.KEPALA_OPD)
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary:
      'Ubah status DetailSOP versi terbaru (transisi divalidasi di server). Param :detailSopId boleh ID DetailSOP atau ID header SOP.',
  })
  @ApiQuery({
    name: 'logsLimit',
    required: false,
    description: 'Jumlah maksimum entri logEdit pada response workbench (1–500, default 100)',
    schema: { default: 100, minimum: 1, maximum: 500 },
  })
  @ApiResponse({ status: 200, type: PenyusunWorkbenchDataDto })
  @ApiBadRequestResponse({ description: 'Validasi DTO gagal' })
  @ApiConflictResponse({ description: 'Transisi status tidak diizinkan atau status sudah sama' })
  @ApiForbiddenResponse({ description: 'Peran tidak diizinkan untuk transisi ini' })
  @ApiNotFoundResponse({ description: 'DetailSOP tidak ditemukan' })
  async transitionDetailSopStatus(
    @Req() req: Request & { user: JwtAccessPayload },
    @Param('detailSopId', ParseUUIDPipe) detailSopId: string,
    @Body() dto: UpdateDetailSopStatusDto,
    @Query('logsLimit', new DefaultValuePipe(100), ParseIntPipe) logsLimit: number,
  ): Promise<ApiSuccessResponse<PenyusunWorkbenchDataDto>> {
    const data = await this.sopCatalogService.transitionDetailSopStatus(req.user, detailSopId, dto, logsLimit);
    return {
      message: 'Status DetailSOP berhasil diperbarui',
      success: true,
      data,
    };
  }

  @Patch('header/:detailSopId')
  @Roles(PeranPengguna.PENYUSUN, PeranPengguna.PJ_PENYUSUN)
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary:
      'PATCH header SOP penyusun (judul, nomor, nama lembaga, dasar hukum, keterkaitan SOP, peringatan, kualifikasi, peralatan, pencatatan). Param :detailSopId boleh DetailSOP atau SOP header (versi terbaru dipakai). Hanya field yang dikirim yang diperbarui (autosave-friendly).',
  })
  @ApiQuery({
    name: 'logsLimit',
    required: false,
    description: 'Jumlah maksimum entri logEdit pada response refresh (1–500, default 100)',
    schema: { default: 100, minimum: 1, maximum: 500 },
  })
  @ApiResponse({ status: 200, type: PenyusunWorkbenchDataDto })
  @ApiBadRequestResponse({ description: 'Validasi DTO gagal' })
  @ApiConflictResponse({ description: 'Nomor SOP sudah digunakan (unik global)' })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse({ description: 'DetailSOP tidak ditemukan' })
  async updateHeader(
    @Req() req: Request & { user: JwtAccessPayload },
    @Param('detailSopId', ParseUUIDPipe) detailSopId: string,
    @Body() dto: UpdateSopHeaderDto,
    @Query('logsLimit', new DefaultValuePipe(100), ParseIntPipe) logsLimit: number,
  ): Promise<ApiSuccessResponse<PenyusunWorkbenchDataDto>> {
    const data = await this.sopCatalogService.updatePenyusunHeader(
      req.user,
      detailSopId,
      dto,
      logsLimit,
    );
    return {
      message: 'Header SOP berhasil diperbarui',
      success: true,
      data,
    };
  }

  @Post(':detailSopId/buat-versi-baru')
  @HttpCode(201)
  @Roles(PeranPengguna.PENYUSUN, PeranPengguna.PJ_PENYUSUN)
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary: 'Buat versi baru dari DetailSOP BERLAKU (clone isi dokumen, status DRAFT)',
    description:
      'Param boleh detailSopId atau sopId. Jika bukan BERLAKU, server memakai versi BERLAKU pada SOP yang sama bila ada.',
  })
  @ApiQuery({
    name: 'logsLimit',
    required: false,
    schema: { default: 100, minimum: 1, maximum: 500 },
  })
  @ApiResponse({ status: 201, type: PenyusunWorkbenchDataDto })
  @ApiConflictResponse({ description: 'Bukan BERLAKU atau masih ada revisi in-flight' })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async buatVersiBaru(
    @Req() req: Request & { user: JwtAccessPayload },
    @Param('detailSopId', ParseUUIDPipe) detailSopId: string,
    @Query('logsLimit', new DefaultValuePipe(100), ParseIntPipe) logsLimit: number,
  ): Promise<ApiSuccessResponse<PenyusunWorkbenchDataDto>> {
    const data = await this.sopCatalogService.buatVersiBaruDariBerlaku(
      req.user,
      detailSopId,
      logsLimit,
    );
    return {
      message: 'Versi baru SOP berhasil dibuat',
      success: true,
      data,
    };
  }

  @Get(':sopId/riwayat-versi')
  @Roles(
    PeranPengguna.PENYUSUN,
    PeranPengguna.PJ_PENYUSUN,
    PeranPengguna.KEPALA_OPD,
    PeranPengguna.EVALUATOR,
    PeranPengguna.PJ_EVALUATOR,
  )
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({ summary: 'Riwayat semua versi DetailSOP pada satu header SOP' })
  @ApiResponse({ status: 200, type: [SopRiwayatVersiRowDto] })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async riwayatVersi(
    @Req() req: Request & { user: JwtAccessPayload },
    @Param('sopId', ParseUUIDPipe) sopId: string,
  ): Promise<ApiSuccessResponse<SopRiwayatVersiRowDto[]>> {
    const data = await this.sopCatalogService.getRiwayatVersi(req.user, sopId);
    return {
      message: 'Riwayat versi SOP berhasil diambil',
      success: true,
      data,
    };
  }

  @Delete(':detailSopId/versi-draft')
  @HttpCode(200)
  @Roles(PeranPengguna.PENYUSUN, PeranPengguna.PJ_PENYUSUN)
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary: 'Hapus versi DRAFT hasil revisi dari BERLAKU (belum masuk evaluasi)',
  })
  @ApiResponse({ status: 200, description: 'Versi draft dihapus' })
  @ApiConflictResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async hapusVersiDraft(
    @Req() req: Request & { user: JwtAccessPayload },
    @Param('detailSopId', ParseUUIDPipe) detailSopId: string,
  ): Promise<ApiSuccessResponse<null>> {
    await this.sopCatalogService.hapusVersiDraft(req.user, detailSopId);
    return {
      message: 'Versi draft berhasil dihapus',
      success: true,
      data: null,
    };
  }
}
