import { Module } from '@nestjs/common';
import { SopCatalogModule } from '../catalog/sop-catalog.module';
import { SopPublicController } from './sop-public.controller';
import { SopPublicRepository } from './sop-public.repository';
import { SopPublicService } from './sop-public.service';

@Module({
  imports: [SopCatalogModule],
  controllers: [SopPublicController],
  providers: [SopPublicService, SopPublicRepository],
})
export class SopPublicModule {}
