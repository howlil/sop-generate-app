import { Module } from '@nestjs/common';
import { PeraturanController } from './controller/peraturan.controller';
import { PeraturanService } from './service/peraturan.service';
import { PeraturanRepository } from './repository/peraturan.repository';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PeraturanController],
  providers: [PeraturanService, PeraturanRepository],
  exports: [PeraturanService, PeraturanRepository],
})
export class PeraturanModule {}
