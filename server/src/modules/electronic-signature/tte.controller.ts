import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { type ApiSuccessResponse, Roles, UseJwtAndRolesGuards } from '../../common';
import type { JwtAccessPayload } from '../../common/types/jwt-access-payload.type';
import { PeranPengguna } from '../../generated/prisma';
import { ACCESS_TOKEN_COOKIE_NAME } from '../core/auth/helpers/auth.shared';
import { RegisterTteDto } from './register-tte.dto';
import { UpdateTtePinDto } from './update-tte-pin.dto';
import { TandaTanganiDto } from './tanda-tangani.dto';
import {
  TteService,
  type TteBatchSignSopPengajuanResponse,
  type TteProfilResponse,
  type TteRiwayatResponse,
} from './tte.service';

@ApiTags('TTE')
@Controller('tte')
@UseJwtAndRolesGuards()
@Roles(PeranPengguna.PJ_EVALUATOR, PeranPengguna.PJ_PENYUSUN, PeranPengguna.KEPALA_OPD)
export class TteController {
  constructor(private readonly tteService: TteService) {}

  @Get('profil')
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary: 'Profil kredensial TTE',
    description:
      'Identitas diambil dari pengguna terautentikasi. `data` bernilai null jika PIN TTE belum didaftarkan.',
  })
  async getProfil(
    @Req() req: Request & { user: JwtAccessPayload },
  ): Promise<ApiSuccessResponse<TteProfilResponse | null>> {
    const data = await this.tteService.getProfil(req.user);
    return {
      message:
        data === null ? 'Kredensial TTE belum ada' : 'Profil TTE berhasil diambil',
      success: true,
      data,
    };
  }

  @Post('profil')
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary: 'Atur PIN TTE pertama kali',
    description:
      'Hanya jika PIN belum pernah diatur. Untuk ubah PIN gunakan PATCH /tte/profil/pin.',
  })
  async registerProfil(
    @Req() req: Request & { user: JwtAccessPayload },
    @Body() dto: RegisterTteDto,
  ): Promise<ApiSuccessResponse<TteProfilResponse>> {
    const data = await this.tteService.registerProfil(req.user, dto);
    return {
      message: 'PIN TTE berhasil diatur',
      success: true,
      data,
    };
  }

  @Patch('profil/pin')
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary: 'Ubah PIN TTE',
    description: 'Wajib mengirim PIN lama yang valid beserta PIN baru.',
  })
  async updateProfilPin(
    @Req() req: Request & { user: JwtAccessPayload },
    @Body() dto: UpdateTtePinDto,
  ): Promise<ApiSuccessResponse<TteProfilResponse>> {
    const data = await this.tteService.updateProfilPin(req.user, dto);
    return {
      message: 'PIN TTE berhasil diperbarui',
      success: true,
      data,
    };
  }

  @Post('profil/verifikasi-email')
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary: 'Token verifikasi email (placeholder)',
    description: 'Mode simulasi: tidak mengirim email; kompatibilitas klien lama.',
  })
  async mintVerifikasiEmail(
    @Req() req: Request & { user: JwtAccessPayload },
  ): Promise<ApiSuccessResponse<{ token: string }>> {
    const data = await this.tteService.mintTokenVerifikasi(req.user);
    return {
      message: 'Token placeholder dibuat',
      success: true,
      data,
    };
  }

  @Get('profil/verifikasi-email')
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary: 'Konfirmasi verifikasi email (noop)',
    description: 'Mode simulasi — tidak mengubah status.',
  })
  async konfirmasiEmail(
    @Query('token') token: string,
  ): Promise<ApiSuccessResponse<{ message: string }>> {
    const data = await this.tteService.konfirmasiEmail(token);
    return {
      message: data.message,
      success: true,
      data,
    };
  }

  @Post('tanda-tangani/ba/:pengajuanId')
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary: 'Tanda tangani Berita Acara evaluasi',
    description:
      'PJ Evaluator pada status SELESAI_DIEVALUASI → DIVERIFIKASI_PJ_EVALUATOR. PJ Penyusun pada DIVERIFIKASI_PJ_EVALUATOR → DITANDATANGANI_PJ_PENYUSUN.',
  })
  @ApiResponse({ status: 200, description: 'Berhasil' })
  async tandaTanganiBa(
    @Req() req: Request & { user: JwtAccessPayload },
    @Param('pengajuanId', ParseUUIDPipe) pengajuanId: string,
    @Body() dto: TandaTanganiDto,
  ): Promise<ApiSuccessResponse<TteRiwayatResponse>> {
    const data = await this.tteService.tandaTanganiBa(req.user, pengajuanId, dto);
    return {
      message: 'Berita Acara berhasil ditandatangani',
      success: true,
      data,
    };
  }

  @Post('tanda-tangani/pengajuan/:pengajuanId/sop-semua')
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary: 'Tanda tangani seluruh SOP dalam satu pengajuan (Kepala OPD)',
    description:
      'Atomic all-or-nothing: semua SOP yang eligible dalam pengajuan ditandatangani sekaligus. Jika satu gagal, seluruh transaksi dibatalkan.',
  })
  async tandaTanganiSemuaSopPengajuan(
    @Req() req: Request & { user: JwtAccessPayload },
    @Param('pengajuanId', ParseUUIDPipe) pengajuanId: string,
    @Body() dto: TandaTanganiDto,
  ): Promise<ApiSuccessResponse<TteBatchSignSopPengajuanResponse>> {
    const data = await this.tteService.tandaTanganiSemuaSopPengajuan(req.user, pengajuanId, dto);
    return {
      message: 'Seluruh SOP dalam pengajuan berhasil ditandatangani',
      success: true,
      data,
    };
  }
}
