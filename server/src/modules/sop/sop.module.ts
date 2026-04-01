import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';

import { SopController } from './controller/sop.controller';
import { DetailSopController } from './controller/detail-sop.controller';
import { PelaksanaController } from './controller/pelaksana.controller';
import { LangkahSopController } from './controller/langkah-sop.controller';

import { SopService } from './service/sop.service';
import { DetailSopService } from './service/detail-sop.service';
import { PelaksanaService } from './service/pelaksana.service';
import { LangkahSopService } from './service/langkah-sop.service';
import { LampiranService } from './service/lampiran.service';

import { SopRepository } from './repository/sop.repository';
import { DetailSopRepository } from './repository/detail-sop.repository';
import { PelaksanaRepository } from './repository/pelaksana.repository';
import { LangkahSopRepository } from './repository/langkah-sop.repository';
import { LampiranRepository } from './repository/lampiran.repository';

@Module({
  imports: [PrismaModule],
  controllers: [
    SopController,
    DetailSopController,
    PelaksanaController,
    LangkahSopController,
  ],
  providers: [
    SopService,
    DetailSopService,
    PelaksanaService,
    LangkahSopService,
    LampiranService,
    SopRepository,
    DetailSopRepository,
    PelaksanaRepository,
    LangkahSopRepository,
    LampiranRepository,
  ],
  exports: [DetailSopService, SopService],
})
export class SopModule {}
