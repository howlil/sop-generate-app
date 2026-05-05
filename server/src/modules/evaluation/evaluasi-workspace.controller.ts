import { Controller, Get, Param, ParseUUIDPipe, Query, Req } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { type ApiSuccessResponse, Roles, UseJwtAndRolesGuards } from '../../common';
import { PeranPengguna } from '../../generated/prisma';
import { ACCESS_TOKEN_COOKIE_NAME, type JwtAccessPayload } from '../core/auth/helpers/auth.shared';
import { EvaluasiWorkspaceQueryDto } from './dto/evaluasi-workspace-query.dto';
import { EvaluasiWorkspaceOpdResponseDto } from './dto/evaluasi-workspace-response.dto';
import { EvaluasiWorkspaceService } from './evaluasi-workspace.service';

@ApiTags('Evaluasi')
@Controller('evaluasi/workspace')
@UseJwtAndRolesGuards()
export class EvaluasiWorkspaceController {
  constructor(private readonly evaluasiWorkspaceService: EvaluasiWorkspaceService) {}

  @Get('opd/:opdId')
  @Roles(PeranPengguna.EVALUATOR, PeranPengguna.PJ_EVALUATOR)
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary: 'Workspace evaluasi per OPD (agregat untuk halaman evaluator)',
    description:
      'Menggabungkan OPD, daftar SOP pipeline evaluasi, pengajuan aktif, riwayat terbatas, dan opsional preview workbench saat `expand=preview` + `detailSopId`.',
  })
  @ApiParam({ name: 'opdId', format: 'uuid' })
  @ApiQuery({ name: 'detailSopId', required: false, format: 'uuid' })
  @ApiQuery({
    name: 'expand',
    required: false,
    description: 'Contoh: `preview` (butuh detailSopId)',
  })
  @ApiQuery({
    name: 'riwayatLimit',
    required: false,
    description: '1–50, default 30',
    schema: { default: 30, minimum: 1, maximum: 50 },
  })
  @ApiResponse({ status: 200, type: EvaluasiWorkspaceOpdResponseDto })
  @ApiForbiddenResponse({ description: 'Bukan EVALUATOR atau PJ_EVALUATOR' })
  @ApiNotFoundResponse({ description: 'OPD tidak ditemukan' })
  async getWorkspaceOpd(
    @Req() req: Request & { user: JwtAccessPayload },
    @Param('opdId', ParseUUIDPipe) opdId: string,
    @Query() query: EvaluasiWorkspaceQueryDto,
  ): Promise<ApiSuccessResponse<EvaluasiWorkspaceOpdResponseDto>> {
    const data = await this.evaluasiWorkspaceService.getWorkspaceOpd(req.user, opdId, query);
    return {
      message: 'Data workspace evaluasi berhasil diambil',
      success: true,
      data,
    };
  }
}
