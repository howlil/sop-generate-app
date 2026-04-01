import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LangkahSopService } from '../service/langkah-sop.service';
import { CreateLangkahSopDto, UpdateLangkahSopDto } from '../dto/langkah-sop.dto';
import { Roles } from '../../../common/decorators';
import { PeranPengguna } from '../../../generated/prisma';

@ApiTags('Langkah SOP')
@ApiBearerAuth()
@Controller('detail-sop/:sopDetailId/langkah')
export class LangkahSopController {
  constructor(private readonly service: LangkahSopService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar langkah SOP dalam urutan — PLK-02' })
  findAll(@Param('sopDetailId') sopDetailId: string) {
    return this.service.findAll(sopDetailId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles(PeranPengguna.TIM_PENYUSUN, PeranPengguna.KOORDINATOR_TIM_PENYUSUN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tambah langkah SOP — PLK-02/03/04/05/06' })
  create(
    @Param('sopDetailId') sopDetailId: string,
    @Body() dto: CreateLangkahSopDto,
  ) {
    return this.service.create(sopDetailId, dto);
  }

  @Patch(':id')
  @Roles(PeranPengguna.TIM_PENYUSUN, PeranPengguna.KOORDINATOR_TIM_PENYUSUN)
  @ApiOperation({ summary: 'Update langkah SOP — PLK-02/05/06' })
  update(@Param('id') id: string, @Body() dto: UpdateLangkahSopDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(PeranPengguna.TIM_PENYUSUN, PeranPengguna.KOORDINATOR_TIM_PENYUSUN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus langkah SOP — PLK-07 (auto-delete DiagramEdge + NodePosition)' })
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
