import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TimEvaluasiService } from '../service/tim-evaluasi.service';
import {
  CreateTimEvaluasiDto,
  AnggotaTimEvaluasiResponseDto,
} from '../dto/tim-evaluasi.dto';
import { Roles } from '../../../common/decorators';
import { PeranPengguna } from '../../../generated/prisma';

@ApiTags('Tim Evaluasi')
@ApiBearerAuth()
@Controller('tim-evaluasi')
export class TimEvaluasiController {
  constructor(private readonly service: TimEvaluasiService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar anggota Tim Evaluasi' })
  @ApiResponse({ status: 200, type: [AnggotaTimEvaluasiResponseDto] })
  findAll(): Promise<AnggotaTimEvaluasiResponseDto[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail anggota Tim Evaluasi' })
  @ApiResponse({ status: 200, type: AnggotaTimEvaluasiResponseDto })
  @ApiResponse({ status: 404, description: 'Anggota Tim tidak ditemukan' })
  findOne(@Param('id') id: string): Promise<AnggotaTimEvaluasiResponseDto> {
    return this.service.findById(id);
  }

  @Post()
  @Roles(PeranPengguna.BIRO_ORGANISASI)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tambah anggota Tim Evaluasi (hanya Biro Organisasi)',
  })
  @ApiResponse({ status: 201, type: AnggotaTimEvaluasiResponseDto })
  @ApiResponse({ status: 404, description: 'Pengguna tidak ditemukan' })
  @ApiResponse({
    status: 409,
    description: 'Pengguna sudah terdaftar sebagai anggota Tim Evaluasi',
  })
  tambah(
    @Body() dto: CreateTimEvaluasiDto,
  ): Promise<AnggotaTimEvaluasiResponseDto> {
    return this.service.tambah(dto);
  }

  @Patch(':id/nonaktifkan')
  @Roles(PeranPengguna.BIRO_ORGANISASI)
  @ApiOperation({
    summary: 'Nonaktifkan anggota Tim Evaluasi (hanya Biro Organisasi)',
  })
  @ApiResponse({ status: 200, type: AnggotaTimEvaluasiResponseDto })
  @ApiResponse({ status: 404, description: 'Anggota Tim tidak ditemukan' })
  @ApiResponse({ status: 409, description: 'Anggota sudah berstatus NONAKTIF' })
  nonaktifkan(@Param('id') id: string): Promise<AnggotaTimEvaluasiResponseDto> {
    return this.service.nonaktifkan(id);
  }
}
