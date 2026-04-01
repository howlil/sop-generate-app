import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PelaksanaService } from '../service/pelaksana.service';
import {
  CreatePelaksanaDto, UpdatePelaksanaDto,
  AddSwimlanDto, SwimlanResponseDto,
} from '../dto/pelaksana.dto';
import { Roles } from '../../../common/decorators';
import { PeranPengguna } from '../../../generated/prisma';

@ApiTags('Pelaksana')
@ApiBearerAuth()
@Controller('pelaksana')
export class PelaksanaController {
  constructor(private readonly service: PelaksanaService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar pelaksana master per OPD — PLK-01' })
  @ApiQuery({ name: 'opdId', required: false })
  findAll(@Query('opdId') opdId?: string) {
    return this.service.findAll(opdId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles(PeranPengguna.TIM_PENYUSUN, PeranPengguna.KOORDINATOR_TIM_PENYUSUN, PeranPengguna.BIRO_ORGANISASI)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat pelaksana master — PLK-01' })
  create(@Body() dto: CreatePelaksanaDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(PeranPengguna.TIM_PENYUSUN, PeranPengguna.KOORDINATOR_TIM_PENYUSUN, PeranPengguna.BIRO_ORGANISASI)
  @ApiOperation({ summary: 'Update pelaksana' })
  update(@Param('id') id: string, @Body() dto: UpdatePelaksanaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(PeranPengguna.TIM_PENYUSUN, PeranPengguna.KOORDINATOR_TIM_PENYUSUN, PeranPengguna.BIRO_ORGANISASI)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus pelaksana (gagal jika masih digunakan di LangkahSOP)' })
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }

  // ---- Swimlane management — PLK-08 ----

  @Get(':sopDetailId/swimlane')
  @ApiOperation({ summary: 'Daftar swimlane DetailSOP — PLK-08' })
  getSwimlane(@Param('sopDetailId') sopDetailId: string) {
    return this.service.getSwimlane(sopDetailId);
  }

  @Post(':sopDetailId/swimlane')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tambah pelaksana ke swimlane — PLK-08' })
  addToSwimlane(
    @Param('sopDetailId') sopDetailId: string,
    @Body() dto: AddSwimlanDto,
  ) {
    return this.service.addToSwimlane(sopDetailId, dto);
  }

  @Delete(':sopDetailId/swimlane/:pelaksanaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus pelaksana dari swimlane' })
  removeFromSwimlane(
    @Param('sopDetailId') sopDetailId: string,
    @Param('pelaksanaId') pelaksanaId: string,
  ) {
    return this.service.removeFromSwimlane(sopDetailId, pelaksanaId);
  }
}
