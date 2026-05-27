import { Module } from '@nestjs/common';
import { TteSharedModule } from '../shared/tte-shared.module';
import { TtePenandatangananService } from './tte-penandatanganan.service';
import { TtePdfSigningService } from './tte-pdf-signing.service';

@Module({
  imports: [TteSharedModule],
  providers: [TtePenandatangananService, TtePdfSigningService],
  exports: [TtePenandatangananService, TtePdfSigningService],
})
export class TtePenandatangananModule {}
