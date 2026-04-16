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
  ApiResponse,
} from '@nestjs/swagger';
import { EvaluasiService } from '../service/evaluasi.service';
import {
  CreatePengajuanEvaluasiDto,
  IsiNilaiEvaluasiDto,
  SelesaiEvaluasiDto,
  RekapEvaluasiResponseDto,
} from '../dto/evaluasi.dto';
import { CurrentUser, Roles } from '../../../common/decorators';
import {
  JenisPengajuanEvaluasi,
  PeranPengguna,
  StatusPengajuanEvaluasi,
} from '../../../generated/prisma';

@ApiTags('Evaluasi')
@ApiBearerAuth()
@Controller('evaluasi')
export class EvaluasiController {
  constructor(private readonly service: EvaluasiService) {}

  @Get()
  @ApiOperation({
    summary: 'Daftar PengajuanEvaluasi — EVL-04 (open pool for TIM_EVALUASI)',
  })
  @ApiQuery({ name: 'opdId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: StatusPengajuanEvaluasi })
  @ApiQuery({ name: 'jenis', required: false, enum: JenisPengajuanEvaluasi })
  findAll(
    @CurrentUser() user: any,
    @Query('opdId') opdId?: string,
    @Query('status') status?: StatusPengajuanEvaluasi,
    @Query('jenis') jenis?: JenisPengajuanEvaluasi,
  ) {
    return this.service.findAll(user, opdId, status, jenis);
  }

  // Must come before :id to avoid route conflict
  @Get('rekap')
  @Roles(PeranPengguna.BIRO_ORGANISASI)
  @ApiOperation({ summary: 'Rekap evaluasi tahunan per OPD — EVL-09' })
  @ApiQuery({ name: 'tahun', required: false })
  @ApiResponse({
    status: 200,
    description: 'Rekap evaluasi tahunan berhasil',
    type: RekapEvaluasiResponseDto,
  })
  rekap(@Query('tahun') tahun?: string) {
    return this.service.rekap(tahun ? parseInt(tahun, 10) : undefined);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detail PengajuanEvaluasi beserta NilaiEvaluasi — EVL-08',
  })
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles(PeranPengguna.BIRO_ORGANISASI)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Buat PengajuanEvaluasi — EVL-01 (DIAJUKAN_EVALUASI → SEDANG_DIEVALUASI)',
  })
  create(@Body() dto: CreatePengajuanEvaluasiDto) {
    return this.service.create(dto);
  }

  @Patch(':id/nilai/:sopDetailId')
  @Roles(PeranPengguna.TIM_EVALUASI)
  @ApiOperation({
    summary:
      'Isi hasil evaluasi per DetailSOP — EVL-05 (optimistic lock via version)',
  })
  isiNilai(
    @Param('id') id: string,
    @Param('sopDetailId') sopDetailId: string,
    @Body() dto: IsiNilaiEvaluasiDto,
    @CurrentUser() user: any,
  ) {
    return this.service.isiNilai(id, sopDetailId, dto, user.id);
  }

  @Patch(':id/selesai')
  @Roles(PeranPengguna.TIM_EVALUASI)
  @ApiOperation({
    summary: 'Selesaikan evaluasi — EVL-06/07 (nilaiOPD wajib untuk TERJADWAL)',
  })
  selesai(
    @Param('id') id: string,
    @Body() dto: SelesaiEvaluasiDto,
    @CurrentUser() user: any,
  ) {
    return this.service.selesai(id, dto, user.id);
  }
}
