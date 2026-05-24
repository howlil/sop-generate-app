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
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { type ApiSuccessResponse, Roles, UseJwtAndRolesGuards } from '../../common';
import type { JwtAccessPayload } from '../../common/types/jwt-access-payload.type';
import { PeranPengguna } from '../../generated/prisma';
import { ACCESS_TOKEN_COOKIE_NAME } from '../core/auth/helpers/auth.shared';
import { RegisterTteDto } from './dto/register-tte.dto';
import { SignBeritaAcaraArsipDto } from './dto/sign-berita-acara-arsip.dto';
import { SignPdfDto } from './dto/sign-pdf.dto';
import { TandaTanganiDto } from './dto/tanda-tangani.dto';
import { UpdateTtePinDto } from './dto/update-tte-pin.dto';
import {
  TteService,
  type TteBatchSignSopPengajuanResponse,
  type SignPdfResponse,
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
      message: data === null ? 'Kredensial TTE belum ada' : 'Profil TTE berhasil diambil',
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
    summary: 'Token verifikasi email (simulasi)',
    description: 'Mode simulasi: tidak mengirim email; kompatibilitas klien lama.',
  })
  async mintVerifikasiEmail(
    @Req() req: Request & { user: JwtAccessPayload },
  ): Promise<ApiSuccessResponse<{ token: string }>> {
    const data = await this.tteService.mintTokenVerifikasi(req.user);
    return {
      message: 'Token simulasi dibuat',
      success: true,
      data,
    };
  }

  @Get('profil/verifikasi-email')
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary: 'Konfirmasi verifikasi email tanpa perubahan status',
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
      'Transaksi utuh: semua SOP yang memenuhi syarat dalam pengajuan ditandatangani sekaligus. Jika satu gagal, seluruh transaksi dibatalkan.',
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

  @Post('pdf/sign')
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary: 'Sisipkan tanda tangan digital PKCS#7 ke PDF',
    description:
      'Menandatangani PDF dengan sertifikat P12 server. Sertifikat harus dikonfigurasi lewat env; kunci privat tidak pernah dikirim ke klien.',
  })
  async signPdf(
    @Req() req: Request & { user: JwtAccessPayload },
    @Body() dto: SignPdfDto,
  ): Promise<ApiSuccessResponse<SignPdfResponse>> {
    const data = await this.tteService.signPdf(req.user, dto);
    return {
      message: data.signed ? 'PDF berhasil ditandatangani' : 'Penandatanganan PDF server dinonaktifkan',
      success: true,
      data,
    };
  }

  @Post('pdf/sign-berita-acara-arsip')
  @Roles(PeranPengguna.KEPALA_OPD)
  @ApiCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
  @ApiOperation({
    summary: 'Tanda tangani PDF Berita Acara arsip (Kepala OPD)',
    description:
      'Menyisipkan PKCS#7 ke PDF unduhan arsip setelah PJ Evaluator dan PJ Penyusun menandatangani TTE. Tidak menggantikan riwayat TTE aplikasi.',
  })
  async signBeritaAcaraArsip(
    @Req() req: Request & { user: JwtAccessPayload },
    @Body() dto: SignBeritaAcaraArsipDto,
  ): Promise<ApiSuccessResponse<SignPdfResponse>> {
    const data = await this.tteService.signBeritaAcaraArsip(req.user, dto);
    return {
      message: data.signed
        ? 'PDF Berita Acara arsip berhasil ditandatangani'
        : 'Penandatanganan PDF server dinonaktifkan',
      success: true,
      data,
    };
  }
}
