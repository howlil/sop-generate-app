import { Module } from '@nestjs/common';
import { AuthModule } from '../../core/auth/auth.module';
import { SopCatalogModule } from '../sop-catalog/sop-catalog.module';
import { SopProsedurController } from './sop-prosedur.controller';
import { SopProsedurRepository } from './sop-prosedur.repository';
import { SopProsedurService } from './sop-prosedur.service';

@Module({
  imports: [AuthModule, SopCatalogModule],
  controllers: [SopProsedurController],
  providers: [SopProsedurService, SopProsedurRepository],
})
export class SopProsedurModule {}
