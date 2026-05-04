import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { type ApiSuccessResponse, Roles, UseJwtAndRolesGuards } from '../../../common';
import { PeranPengguna } from '../../../generated/prisma';
import { ACCESS_TOKEN_COOKIE_NAME, type JwtAccessPayload } from '../../core/auth/helpers/auth.shared';
import { CreateKomentarDto } from './dto/create-komentar.dto';
import { KomentarResponseDto } from './dto/komentar-response.dto';
import { SopCommentService } from './sop-comment.service';

@ApiTags('SOP - Komentar')
@Controller('sop/komentar')
@UseJwtAndRolesGuards()
export class SopCommentController {
  constructor(private readonly sopCommentService: SopCommentService) {}

  @Get(':detailSopId')
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
      'Daftar komentar SOP (urut terbaru). Param :detailSopId boleh DetailSOP atau SOP header (versi terbaru dipakai bila header).',
  })
  @ApiResponse({ status: 200, type: [KomentarResponseDto] })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse({ description: 'SOP tidak ditemukan' })
  async list(
    @Req() req: Request & { user: JwtAccessPayload },
    @Param('detailSopId', ParseUUIDPipe) detailSopId: string,
  ): Promise<ApiSuccessResponse<KomentarResponseDto[]>> {
    const data = await this.sopCommentService.listForDetailSop(req.user, detailSopId);
    return {
      message: 'Daftar komentar berhasil diambil',
      success: true,
      data,
    };
  }

  @Post(':detailSopId')
  @HttpCode(201)
  @Roles(PeranPengguna.EVALUATOR)
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({ summary: 'Kirim komentar baru (hanya Tim Evaluasi).' })
  @ApiResponse({ status: 201, type: KomentarResponseDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse({ description: 'SOP tidak ditemukan' })
  async create(
    @Req() req: Request & { user: JwtAccessPayload },
    @Param('detailSopId', ParseUUIDPipe) detailSopId: string,
    @Body() dto: CreateKomentarDto,
  ): Promise<ApiSuccessResponse<KomentarResponseDto>> {
    const data = await this.sopCommentService.createKomentar(req.user, detailSopId, dto);
    return {
      message: 'Komentar berhasil dikirim',
      success: true,
      data,
    };
  }

  @Patch(':komentarId/selesai')
  @Roles(PeranPengguna.PENYUSUN, PeranPengguna.PJ_PENYUSUN)
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({ summary: 'Tandai komentar sebagai selesai (hanya Penyusun pemilik OPD).' })
  @ApiResponse({ status: 200, type: KomentarResponseDto })
  @ApiConflictResponse({ description: 'Komentar sudah selesai' })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse({ description: 'Komentar tidak ditemukan' })
  async resolve(
    @Req() req: Request & { user: JwtAccessPayload },
    @Param('komentarId', ParseUUIDPipe) komentarId: string,
  ): Promise<ApiSuccessResponse<KomentarResponseDto>> {
    const data = await this.sopCommentService.resolveKomentar(req.user, komentarId);
    return {
      message: 'Komentar ditandai selesai',
      success: true,
      data,
    };
  }

  @Delete(':komentarId')
  @Roles(PeranPengguna.EVALUATOR)
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({ summary: 'Hapus komentar (hanya pembuat / Tim Evaluasi).' })
  @ApiResponse({ status: 200, description: 'Komentar dihapus' })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse({ description: 'Komentar tidak ditemukan' })
  async delete(
    @Req() req: Request & { user: JwtAccessPayload },
    @Param('komentarId', ParseUUIDPipe) komentarId: string,
  ): Promise<ApiSuccessResponse<null>> {
    await this.sopCommentService.deleteKomentar(req.user, komentarId);
    return {
      message: 'Komentar dihapus',
      success: true,
      data: null,
    };
  }
}
