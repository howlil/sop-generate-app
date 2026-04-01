import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SopService } from '../service/sop.service';
import { CreateSopDto } from '../dto/sop.dto';
import { Roles, CurrentUser } from '../../../common/decorators';
import { PeranPengguna } from '../../../generated/prisma';

@ApiTags('Sop')
@ApiBearerAuth()
@Controller('sop')
export class SopController {
  constructor(private readonly service: SopService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar SOP (SOP-09/10/11/12)' })
  @ApiQuery({ name: 'opdId', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @CurrentUser() user: any,
    @Query('opdId') opdId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll(user, opdId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail SOP' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findById(id, user);
  }

  @Post()
  @Roles(PeranPengguna.TIM_PENYUSUN, PeranPengguna.KOORDINATOR_TIM_PENYUSUN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat SOP baru + DetailSOP versi 1 (DRAFT) — SOP-01' })
  @ApiResponse({ status: 201, description: 'SOP + DetailSOP DRAFT berhasil dibuat' })
  create(@Body() dto: CreateSopDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Patch(':id')
  @Roles(PeranPengguna.TIM_PENYUSUN, PeranPengguna.KOORDINATOR_TIM_PENYUSUN, PeranPengguna.BIRO_ORGANISASI)
  @ApiOperation({ summary: 'Update judul SOP' })
  update(@Param('id') id: string, @Body('judul') judul: string) {
    return this.service.update(id, judul);
  }

  @Delete(':id')
  @Roles(PeranPengguna.BIRO_ORGANISASI)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus SOP (hanya jika belum ada TTE/evaluasi) — SOP-16' })
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
