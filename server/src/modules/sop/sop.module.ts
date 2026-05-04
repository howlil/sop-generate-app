import { Module } from '@nestjs/common';
import { PelaksanaModule } from './pelaksana/pelaksana.module';
import { PeraturanModule } from './peraturan/peraturan.module';
import { SopCatalogModule } from './sop-catalog/sop-catalog.module';
import { SopCommentModule } from './sop-comment/sop-comment.module';
import { SopProsedurModule } from './sop-prosedur/sop-prosedur.module';

/** Master data SOP untuk penyusun: katalog SOP, peraturan, pelaksana, prosedur, dan komentar. */
@Module({
  imports: [
    SopCatalogModule,
    PeraturanModule,
    PelaksanaModule,
    SopCommentModule,
    SopProsedurModule,
  ],
})
export class SopModule {}
