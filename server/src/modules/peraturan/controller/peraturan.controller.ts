import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PeraturanService } from '../service/peraturan.service';
import {
  CreatePeraturanDto,
  UpdatePeraturanDto,
  PeraturanResponseDto,
} from '../dto/peraturan.dto';
import { Roles, CurrentUser } from '../../../common/decorators';
import { PeranPengguna } from '../../../generated/prisma';

@ApiTags('Peraturan')
@ApiBearerAuth()
@Controller('peraturan')
export class PeraturanController {
  constructor(private readonly peraturanService: PeraturanService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar peraturan (BIRO: semua; Tim Penyusun/Kepala OPD: OPD sendiri)' })
  @ApiQuery({ name: 'opdId', required: false, description: 'Filter by OPD (BIRO only)' })
  @ApiResponse({ status: 200, type: [PeraturanResponseDto] })
  findAll(
    @CurrentUser() user: any,
    @Query('opdId') opdId?: string,
  ): Promise<PeraturanResponseDto[]> {
    return this.peraturanService.findAll(user, opdId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail peraturan' })
  @ApiResponse({ status: 200, type: PeraturanResponseDto })
  @ApiResponse({ status: 404, description: 'Peraturan tidak ditemukan' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<PeraturanResponseDto> {
    return this.peraturanService.findById(id, user);
  }

  @Post()
  @Roles(PeranPengguna.KOORDINATOR_TIM_PENYUSUN, PeranPengguna.TIM_PENYUSUN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat peraturan baru (Koordinator / Tim Penyusun)' })
  @ApiResponse({ status: 201, type: PeraturanResponseDto })
  @ApiResponse({ status: 409, description: 'Nomor + tahun + OPD sudah ada' })
  create(@Body() dto: CreatePeraturanDto): Promise<PeraturanResponseDto> {
    return this.peraturanService.create(dto);
  }

  @Patch(':id')
  @Roles(PeranPengguna.KOORDINATOR_TIM_PENYUSUN, PeranPengguna.TIM_PENYUSUN)
  @ApiOperation({ summary: 'Update peraturan (Koordinator / Tim Penyusun)' })
  @ApiResponse({ status: 200, type: PeraturanResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePeraturanDto,
  ): Promise<PeraturanResponseDto> {
    return this.peraturanService.update(id, dto);
  }

  @Delete(':id')
  @Roles(PeranPengguna.KOORDINATOR_TIM_PENYUSUN, PeranPengguna.TIM_PENYUSUN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus peraturan (Koordinator / Tim Penyusun; gagal jika masih dipakai)' })
  @ApiResponse({ status: 204, description: 'Peraturan berhasil dihapus' })
  @ApiResponse({ status: 409, description: 'Peraturan masih digunakan sebagai dasar hukum' })
  remove(@Param('id') id: string): Promise<void> {
    return this.peraturanService.delete(id);
  }
}
