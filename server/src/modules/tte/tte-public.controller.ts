import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { type ApiSuccessResponse } from '../../common';
import { TtePengesahanPublicResponseDto } from './dto/tte-pengesahan-public-response.dto';
import { TteService } from './tte.service';

@ApiTags('TTE Publik')
@Controller('tte/public')
export class TtePublicController {
  constructor(private readonly tteService: TteService) {}

  @Get('pengesahan/:dokumenTteId/:userId')
  @ApiOperation({
    summary: 'Verifikasi pengesahan (publik)',
    description:
      'Mengambil ringkasan data pengesahan berdasarkan pasangan junction `(dokumenTteId, userId)` — sama dengan segmen path halaman validasi publik / QR. Tidak memerlukan autentikasi.',
  })
  @ApiResponse({ status: 200, type: TtePengesahanPublicResponseDto })
  @ApiNotFoundResponse({ description: 'Riwayat pengesahan tidak ditemukan' })
  async getPengesahan(
    @Param('dokumenTteId', ParseUUIDPipe) dokumenTteId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<ApiSuccessResponse<TtePengesahanPublicResponseDto>> {
    const data = await this.tteService.getPengesahanPublic(dokumenTteId, userId);
    return {
      message: 'Data pengesahan berhasil ditemukan',
      success: true,
      data: data as TtePengesahanPublicResponseDto,
    };
  }
}
