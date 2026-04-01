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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TimPenyusunService } from '../service/tim-penyusun.service';
import {
  CreateTimPenyusunDto,
  PindahTimPenyusunDto,
  AnggotaTimPenyusunResponseDto,
} from '../dto/tim-penyusun.dto';
import { Roles, CurrentUser } from '../../../common/decorators';
import { PeranPengguna } from '../../../generated/prisma';

@ApiTags('Tim Penyusun')
@ApiBearerAuth()
@Controller('tim-penyusun')
export class TimPenyusunController {
  constructor(private readonly service: TimPenyusunService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar anggota Tim Penyusun (BIRO: semua; lainnya: OPD sendiri)' })
  @ApiQuery({ name: 'opdId', required: false })
  @ApiResponse({ status: 200, type: [AnggotaTimPenyusunResponseDto] })
  findAll(
    @CurrentUser() user: any,
    @Query('opdId') opdId?: string,
  ): Promise<AnggotaTimPenyusunResponseDto[]> {
    return this.service.findAll(user, opdId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail anggota Tim Penyusun' })
  @ApiResponse({ status: 200, type: AnggotaTimPenyusunResponseDto })
  findOne(@Param('id') id: string): Promise<AnggotaTimPenyusunResponseDto> {
    return this.service.findById(id);
  }

  @Post()
  @Roles(PeranPengguna.BIRO_ORGANISASI)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tambah anggota Tim Penyusun ke OPD (hanya Biro Organisasi)' })
  @ApiResponse({ status: 201, type: AnggotaTimPenyusunResponseDto })
  @ApiResponse({ status: 409, description: 'Pengguna sudah terdaftar di OPD ini' })
  tambah(@Body() dto: CreateTimPenyusunDto): Promise<AnggotaTimPenyusunResponseDto> {
    return this.service.tambah(dto);
  }

  @Patch(':id/nonaktifkan')
  @Roles(PeranPengguna.BIRO_ORGANISASI)
  @ApiOperation({ summary: 'Nonaktifkan anggota Tim Penyusun (hanya Biro Organisasi)' })
  @ApiResponse({ status: 200, type: AnggotaTimPenyusunResponseDto })
  nonaktifkan(@Param('id') id: string): Promise<AnggotaTimPenyusunResponseDto> {
    return this.service.nonaktifkan(id);
  }

  @Patch(':id/pindah')
  @Roles(PeranPengguna.BIRO_ORGANISASI)
  @ApiOperation({ summary: 'Pindah anggota ke OPD lain (hanya Biro Organisasi)' })
  @ApiResponse({ status: 200, type: AnggotaTimPenyusunResponseDto })
  pindah(
    @Param('id') id: string,
    @Body() dto: PindahTimPenyusunDto,
  ): Promise<AnggotaTimPenyusunResponseDto> {
    return this.service.pindah(id, dto);
  }
}
