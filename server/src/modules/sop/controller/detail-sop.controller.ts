import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
} from '@nestjs/swagger';
import { DetailSopService } from '../service/detail-sop.service';
import { LampiranService } from '../service/lampiran.service';
import { UpdateMetadataDto, UpdateStatusDto } from '../dto/detail-sop.dto';
import {
  CreateLampiranTeksDto,
  AddDasarHukumDto,
  AddSopTerkaitDto,
} from '../dto/lampiran.dto';
import { CurrentUser } from '../../../common/decorators';
import type { AuthenticatedUser } from '../../../common/decorators/current-user.decorator';
import { PeranPengguna } from '../../../generated/prisma';
import { StatusSOP } from '../../../generated/prisma';

@ApiTags('Detail SOP')
@ApiBearerAuth()
@Controller('detail-sop')
export class DetailSopController {
  constructor(
    private readonly detailService: DetailSopService,
    private readonly lampiranService: LampiranService,
  ) {}

  // ---- Core CRUD ----

  @Get()
  @ApiOperation({ summary: 'Daftar DetailSOP (SOP-09/10/11/12)' })
  @ApiQuery({ name: 'sopId', required: false })
  @ApiQuery({ name: 'opdId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: StatusSOP })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('sopId') sopId?: string,
    @Query('opdId') opdId?: string,
    @Query('status') status?: StatusSOP,
  ) {
    return this.detailService.findAll(
      { ...user, peran: user.peran as PeranPengguna },
      sopId,
      opdId,
      status,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail DetailSOP — SOP-22' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.detailService.findById(id, {
      ...user,
      peran: user.peran as PeranPengguna,
    });
  }

  @Patch(':id/metadata')
  @ApiOperation({
    summary:
      'Update metadata DetailSOP (SOP-02/18) — hanya saat DRAFT/SEDANG_DISUSUN/REVISI',
  })
  updateMetadata(
    @Param('id') id: string,
    @Body() dto: UpdateMetadataDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.detailService.updateMetadata(id, dto, {
      ...user,
      peran: user.peran as PeranPengguna,
    });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Ubah status DetailSOP — SOP-03/04/14/15' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.detailService.updateStatus(id, dto, {
      ...user,
      peran: user.peran as PeranPengguna,
    });
  }

  @Patch(':id/cabut')
  @ApiOperation({
    summary: 'Cabut DetailSOP — set status DICABUT (Kepala OPD)',
  })
  cabut(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const dto: UpdateStatusDto = { status: StatusSOP.DICABUT };
    return this.detailService.updateStatus(id, dto, {
      ...user,
      peran: user.peran as PeranPengguna,
    });
  }

  // ---- LampiranTeks — SOP-24 ----

  @Get(':id/lampiran')
  @ApiOperation({ summary: 'Daftar lampiran teks' })
  getLampiran(@Param('id') id: string) {
    return this.lampiranService.getLampiran(id);
  }

  @Post(':id/lampiran')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tambah lampiran teks — SOP-24' })
  addLampiran(@Param('id') id: string, @Body() dto: CreateLampiranTeksDto) {
    return this.lampiranService.addLampiran(id, dto);
  }

  @Patch(':id/lampiran/:lampiranId')
  @ApiOperation({ summary: 'Update lampiran teks' })
  updateLampiran(
    @Param('lampiranId') lampiranId: string,
    @Body('teks') teks: string,
  ) {
    return this.lampiranService.updateLampiran(lampiranId, teks);
  }

  @Delete(':id/lampiran/:lampiranId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus lampiran teks' })
  deleteLampiran(@Param('lampiranId') lampiranId: string) {
    return this.lampiranService.deleteLampiran(lampiranId);
  }

  // ---- DasarHukum — SOP-19/23 ----

  @Get(':id/dasar-hukum')
  @ApiOperation({ summary: 'Daftar dasar hukum SOP — SOP-19' })
  getDasarHukum(@Param('id') id: string) {
    return this.lampiranService.getDasarHukum(id);
  }

  @Post(':id/dasar-hukum')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tambah dasar hukum — SOP-19/23 (same OPD, not DICABUT)',
  })
  addDasarHukum(@Param('id') id: string, @Body() dto: AddDasarHukumDto) {
    return this.lampiranService.addDasarHukum(id, dto);
  }

  @Delete(':id/dasar-hukum/:peraturanId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus dasar hukum' })
  removeDasarHukum(
    @Param('id') id: string,
    @Param('peraturanId') peraturanId: string,
  ) {
    return this.lampiranService.removeDasarHukum(id, peraturanId);
  }

  // ---- SopTerkait — SOP-20/21 ----

  @Get(':id/sop-terkait')
  @ApiOperation({ summary: 'Daftar SOP terkait — SOP-20' })
  getSopTerkait(@Param('id') id: string) {
    return this.lampiranService.getSopTerkait(id);
  }

  @Post(':id/sop-terkait')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Tambah SOP terkait — SOP-20/21 (no self-ref, no bidirectional dup)',
  })
  addSopTerkait(@Param('id') id: string, @Body() dto: AddSopTerkaitDto) {
    return this.lampiranService.addSopTerkait(id, dto);
  }

  @Delete(':id/sop-terkait/:terkaitId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hapus SOP terkait' })
  removeSopTerkait(
    @Param('id') id: string,
    @Param('terkaitId') terkaitId: string,
  ) {
    return this.lampiranService.removeSopTerkait(id, terkaitId);
  }
}
