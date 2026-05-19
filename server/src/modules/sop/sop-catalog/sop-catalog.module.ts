import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../../core/auth/auth.module';
import { EvaluationModule } from '../../evaluation/evaluation.module';
import { SopCatalogController } from './sop-catalog.controller';
import { SopCatalogRepository } from './sop-catalog.repository';
import { SopCatalogService } from './sop-catalog.service';

@Module({
  imports: [AuthModule, forwardRef(() => EvaluationModule)],
  controllers: [SopCatalogController],
  providers: [SopCatalogService, SopCatalogRepository],
  exports: [SopCatalogService, SopCatalogRepository],
})
export class SopCatalogModule {}
