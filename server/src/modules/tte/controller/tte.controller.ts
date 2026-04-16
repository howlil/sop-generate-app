import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TteService } from '../service/tte.service';
import {
  RegisterTteDto,
  VerifikasiEmailDto,
  TandaTanganiBaDto,
  TandaTanganiSopDto,
} from '../dto/tte.dto';
import { CurrentUser, Roles } from '../../../common/decorators';
import { PeranPengguna } from '../../../generated/prisma';

@ApiTags('TTE')
@ApiBearerAuth()
@Controller('tte')
export class TteController {
  constructor(private readonly service: TteService) {}

  // ---- KredensialTTE ----

  @Get('profil')
  @ApiOperation({ summary: 'Lihat profil TTE sendiri — TTE-01' })
  getProfil(@CurrentUser() user: any) {
    return this.service.getProfil(user.id);
  }

  @Post('profil')
  @HttpCode(HttpStatus.CREATED)
  @Roles(
    PeranPengguna.KEPALA_OPD,
    PeranPengguna.BIRO_ORGANISASI,
    PeranPengguna.KOORDINATOR_TIM_PENYUSUN,
  )
  @ApiOperation({ summary: 'Daftarkan/update KredensialTTE — TTE-01/03/04' })
  registerProfil(@Body() dto: RegisterTteDto, @CurrentUser() user: any) {
    return this.service.registerProfil(user, dto);
  }

  @Post('profil/verifikasi-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Minta token verifikasi email TTE — TTE-02' })
  mintToken(@CurrentUser() user: any) {
    return this.service.mintTokenVerifikasi(user);
  }

  @Get('profil/verifikasi-email')
  @ApiOperation({ summary: 'Konfirmasi email TTE via token — TTE-02' })
  @ApiQuery({ name: 'token', required: true })
  konfirmasiEmail(@Query('token') token: string) {
    return this.service.konfirmasiEmail({ token });
  }

  // ---- Riwayat TTE — TTE-13 ----

  @Get('riwayat')
  @ApiOperation({ summary: 'Riwayat penandatanganan sendiri — TTE-13' })
  getRiwayat(@CurrentUser() user: any) {
    return this.service.getRiwayat(user.id);
  }

  // ---- Penandatanganan BA — TTE-05/06 ----

  @Post('tanda-tangani/ba/:pengajuanId')
  @HttpCode(HttpStatus.CREATED)
  @Roles(PeranPengguna.BIRO_ORGANISASI, PeranPengguna.KOORDINATOR_TIM_PENYUSUN)
  @ApiOperation({
    summary:
      'TTD Berita Acara — Biro (→ DIVERIFIKASI_BIRO) atau Koordinator (→ DITANDATANGANI_KOORDINATOR) — TTE-05/06',
  })
  tandaTanganiBa(
    @Param('pengajuanId') pengajuanId: string,
    @Body() dto: TandaTanganiBaDto,
    @CurrentUser() user: any,
  ) {
    return this.service.tandaTanganiBa(user, pengajuanId, dto);
  }

  // ---- Pengesahan SOP — TTE-07 ----

  @Post('tanda-tangani/sop/:sopDetailId')
  @HttpCode(HttpStatus.CREATED)
  @Roles(PeranPengguna.KEPALA_OPD)
  @ApiOperation({
    summary: 'Kepala OPD mengesahkan DetailSOP (→ BERLAKU) — TTE-07',
  })
  tandaTanganiSop(
    @Param('sopDetailId') sopDetailId: string,
    @Body() dto: TandaTanganiSopDto,
    @CurrentUser() user: any,
  ) {
    return this.service.tandaTanganiSop(user, sopDetailId, dto);
  }
}
