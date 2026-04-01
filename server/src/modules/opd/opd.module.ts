import { Module } from '@nestjs/common';
import { OpdController } from './controller/opd.controller';
import { OpdService } from './service/opd.service';
import { OpdRepository } from './repository/opd.repository';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OpdController],
  providers: [OpdService, OpdRepository],
  exports: [OpdService, OpdRepository],
})
export class OpdModule {}
