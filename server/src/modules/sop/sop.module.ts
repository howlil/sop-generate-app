import { Module } from '@nestjs/common';
import { PelaksanaModule } from './pelaksana/pelaksana.module';
import { PeraturanModule } from './peraturan/peraturan.module';
import { SopCatalogModule } from './sop-catalog/sop-catalog.module';
import { SopPublicModule } from './sop-public/sop-public.module';
import { SopProsedurModule } from './sop-prosedur/sop-prosedur.module';

/** Master data SOP untuk penyusun: katalog SOP, peraturan, pelaksana, dan prosedur. */
@Module({
  imports: [
    SopCatalogModule,
    SopPublicModule,
    PeraturanModule,
    PelaksanaModule,
    SopProsedurModule,
  ],
})
export class SopModule {}
