import { Module } from '@nestjs/common';
import { SopCatalogModule } from '../catalog/sop-catalog.module';
import { SopOfficialPdfService } from './sop-official-pdf.service';
import { SopPdfStorageService } from './sop-pdf-storage.service';

@Module({
  imports: [SopCatalogModule],
  providers: [SopOfficialPdfService, SopPdfStorageService],
  exports: [SopOfficialPdfService, SopPdfStorageService],
})
export class SopPdfModule {}
