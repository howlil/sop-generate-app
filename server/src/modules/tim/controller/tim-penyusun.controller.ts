import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TimPenyusunService } from '../service/tim-penyusun.service';
import {
  CreateTimPenyusunDto,
  PindahTimPenyusunDto,
  AnggotaTimPenyusunResponseDto,
} from '../dto/tim-penyusun.dto';
import { Roles, CurrentUser } from '../../../common/decorators';
import { PeranPengguna } from '../../../generated/prisma';
import { TimMessages } from '../../../common/messages';

export interface PaginatedTimPenyusunResponse {
  data: AnggotaTimPenyusunResponseDto[];
  total: number;
  page: number;
  limit: number;
}

type JwtUser = {
  id: string;
  peran: PeranPengguna;
  opdId: string | null;
};

@ApiTags('Tim Penyusun')
@ApiBearerAuth()
@Controller('tim-penyusun')
export class TimPenyusunController {
  constructor(private readonly service: TimPenyusunService) {}

  @Get()
  @ApiOperation({
    summary: 'Daftar anggota Tim Penyusun (BIRO: semua; lainnya: OPD sendiri)',
  })
  @ApiQuery({ name: 'opdId', required: false })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20)',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/AnggotaTimPenyusunResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  findAll(
    @CurrentUser() user: JwtUser,
    @Query('opdId') opdId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedTimPenyusunResponse> {
    if (
      opdId &&
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        opdId,
      )
    ) {
      throw new BadRequestException(TimMessages.OPD_ID_INVALID_UUID);
    }
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    return this.service
      .findAll(user, opdId, pageNum, limitNum)
      .then((result) => ({
        ...result,
        page: pageNum,
        limit: limitNum,
      }));
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
  @ApiOperation({
    summary: 'Tambah anggota Tim Penyusun ke OPD (hanya Biro Organisasi)',
  })
  @ApiResponse({ status: 201, type: AnggotaTimPenyusunResponseDto })
  @ApiResponse({ status: 404, description: 'Pengguna tidak ditemukan' })
  @ApiResponse({
    status: 409,
    description: 'Pengguna sudah terdaftar di OPD ini',
  })
  tambah(
    @Body() dto: CreateTimPenyusunDto,
  ): Promise<AnggotaTimPenyusunResponseDto> {
    return this.service.tambah(dto);
  }

  @Patch(':id/nonaktifkan')
  @Roles(PeranPengguna.BIRO_ORGANISASI)
  @ApiOperation({
    summary: 'Nonaktifkan anggota Tim Penyusun (hanya Biro Organisasi)',
  })
  @ApiResponse({ status: 200, type: AnggotaTimPenyusunResponseDto })
  @ApiResponse({ status: 404, description: 'Anggota Tim tidak ditemukan' })
  @ApiResponse({ status: 409, description: 'Anggota sudah berstatus NONAKTIF' })
  nonaktifkan(@Param('id') id: string): Promise<AnggotaTimPenyusunResponseDto> {
    return this.service.nonaktifkan(id);
  }

  @Patch(':id/pindah')
  @Roles(PeranPengguna.BIRO_ORGANISASI)
  @ApiOperation({
    summary: 'Pindah anggota ke OPD lain (hanya Biro Organisasi)',
  })
  @ApiResponse({ status: 200, type: AnggotaTimPenyusunResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Data tidak valid (status NONAKTIF atau OPD sama)',
  })
  @ApiResponse({ status: 404, description: 'Anggota Tim tidak ditemukan' })
  @ApiResponse({
    status: 409,
    description: 'Pengguna sudah terdaftar di OPD tujuan',
  })
  pindah(
    @Param('id') id: string,
    @Body() dto: PindahTimPenyusunDto,
  ): Promise<AnggotaTimPenyusunResponseDto> {
    return this.service.pindah(id, dto);
  }
}
