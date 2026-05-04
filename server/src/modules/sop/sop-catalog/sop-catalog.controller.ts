import {
  Body,
  Controller,
  DefaultValuePipe,
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
import { PenyusunWorkbenchDataDto } from './dto/penyusun-workbench-data.dto';
import { SopDaftarRowDto } from './dto/sop-daftar-row.dto';
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

  @Get()
  @Roles(
    PeranPengguna.PENYUSUN,
    PeranPengguna.PJ_PENYUSUN,
    PeranPengguna.KEPALA_OPD,
    PeranPengguna.EVALUATOR,
    PeranPengguna.PJ_EVALUATOR,
  )
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({ summary: 'Daftar SOP header untuk OPD pengguna (versi DetailSOP terbaru per SOP)' })
  @ApiResponse({ status: 200, type: [SopDaftarRowDto] })
  @ApiForbiddenResponse()
  async list(@Req() req: Request & { user: JwtAccessPayload }): Promise<ApiSuccessResponse<SopDaftarRowDto[]>> {
    const data = await this.sopCatalogService.listForCurrentUser(req.user);
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
}
