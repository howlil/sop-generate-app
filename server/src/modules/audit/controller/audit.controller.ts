import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AuditService } from '../service/audit.service';
import { CurrentUser, Roles } from '../../../common/decorators';
import { BagianSOP, PeranPengguna } from '../../../generated/prisma';

@ApiTags('Audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly service: AuditService) {}

  // AUD-04: all logs (BIRO_ORGANISASI only)
  @Get()
  @Roles(PeranPengguna.BIRO_ORGANISASI)
  @ApiOperation({ summary: 'Semua LogEditSOP — AUD-04 (BIRO_ORGANISASI only)' })
  @ApiQuery({ name: 'bagian', required: false, enum: BagianSOP })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  findAll(
    @CurrentUser() user: any,
    @Query('bagian') bagian?: BagianSOP,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.service.findAll(
      user,
      bagian,
      skip ? parseInt(skip, 10) : undefined,
      take ? parseInt(take, 10) : undefined,
    );
  }

  // AUD-03: per-DetailSOP log
  @Get('detail-sop/:sopDetailId')
  @ApiOperation({ summary: 'LogEditSOP per DetailSOP — AUD-03' })
  @ApiQuery({ name: 'bagian', required: false, enum: BagianSOP })
  @ApiQuery({ name: 'skip', required: false })
  @ApiQuery({ name: 'take', required: false })
  findBySopDetail(
    @Param('sopDetailId') sopDetailId: string,
    @Query('bagian') bagian?: BagianSOP,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.service.findBySopDetail(
      sopDetailId,
      bagian,
      skip ? parseInt(skip, 10) : undefined,
      take ? parseInt(take, 10) : undefined,
    );
  }
}
