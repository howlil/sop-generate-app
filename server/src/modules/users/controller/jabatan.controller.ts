import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JabatanService } from '../service/jabatan.service';
import { Roles, CurrentUser } from '../../../common/decorators';
import type { AuthenticatedUser } from '../../../common/decorators/current-user.decorator';
import { PeranPengguna } from '../../../generated/prisma';

@ApiTags('Jabatan')
@ApiBearerAuth()
@Controller('users/jabatan')
export class JabatanController {
  constructor(private readonly jabatanService: JabatanService) {}

  @Post('set-kepala-aktif')
  @Roles(PeranPengguna.BIRO_ORGANISASI)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Set Kepala OPD aktif — nonaktifkan kepala lama jika ada',
  })
  @ApiResponse({ status: 200, description: 'Kepala OPD berhasil ditetapkan' })
  async setKepalaAktif(
    @Body() dto: { userId: string; opdId: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.jabatanService.setKepalaAktif(dto.userId, dto.opdId, user);
  }

  @Post('akhiri/:userId')
  @Roles(PeranPengguna.BIRO_ORGANISASI)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Akhiri jabatan Kepala OPD — kembalikan ke role default',
  })
  @ApiResponse({ status: 200, description: 'Jabatan berhasil diakhiri' })
  async akhiriJabatan(
    @Param('userId') userId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.jabatanService.akhiriJabatan(userId, user);
  }

  @Post('pindah/:userId')
  @Roles(PeranPengguna.BIRO_ORGANISASI)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pindah jabatan Kepala OPD ke OPD lain' })
  @ApiResponse({ status: 200, description: 'Jabatan berhasil dipindah' })
  async pindahJabatan(
    @Param('userId') userId: string,
    @Body() dto: { opdId: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.jabatanService.pindahJabatan(userId, dto.opdId, user);
  }

  @Get('riwayat')
  @Roles(PeranPengguna.BIRO_ORGANISASI)
  @ApiOperation({ summary: 'Riwayat jabatan Kepala OPD' })
  @ApiResponse({ status: 200, description: 'Return riwayat jabatan' })
  async getRiwayat(@Query('opdId') opdId?: string) {
    return this.jabatanService.getRiwayat(opdId);
  }
}
