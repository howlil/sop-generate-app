import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OpdService } from '../service/opd.service';
import { CreateOpdDto, UpdateOpdDto, OpdResponseDto } from '../dto/opd.dto';
import { Roles, CurrentUser } from '../../../common/decorators';
import type { AuthenticatedUser } from '../../../common/decorators/current-user.decorator';
import { PeranPengguna } from '../../../generated/prisma';

@ApiTags('Opd')
@ApiBearerAuth()
@Controller('opd')
export class OpdController {
  constructor(private readonly opdService: OpdService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar OPD (BIRO: semua; lainnya: OPD sendiri)' })
  @ApiResponse({ status: 200, type: [OpdResponseDto] })
  findAll(@CurrentUser() user: AuthenticatedUser): Promise<OpdResponseDto[]> {
    return this.opdService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail OPD' })
  @ApiResponse({ status: 200, type: OpdResponseDto })
  @ApiResponse({ status: 404, description: 'OPD tidak ditemukan' })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OpdResponseDto> {
    return this.opdService.findById(id, user);
  }

  @Post()
  @Roles(PeranPengguna.BIRO_ORGANISASI)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Buat OPD baru (hanya Biro Organisasi)' })
  @ApiResponse({ status: 201, type: OpdResponseDto })
  create(@Body() dto: CreateOpdDto): Promise<OpdResponseDto> {
    return this.opdService.create(dto);
  }

  @Patch(':id')
  @Roles(PeranPengguna.BIRO_ORGANISASI)
  @ApiOperation({ summary: 'Update OPD (hanya Biro Organisasi)' })
  @ApiResponse({ status: 200, type: OpdResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOpdDto,
  ): Promise<OpdResponseDto> {
    return this.opdService.update(id, dto);
  }

  @Delete(':id')
  @Roles(PeranPengguna.BIRO_ORGANISASI)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Nonaktifkan OPD / soft-delete (hanya Biro Organisasi)',
  })
  @ApiResponse({ status: 204, description: 'OPD berhasil dinonaktifkan' })
  @ApiResponse({
    status: 409,
    description: 'OPD masih punya pengajuan evaluasi aktif',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.opdService.softDelete(id);
  }
}
