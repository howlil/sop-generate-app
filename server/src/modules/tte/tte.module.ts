import { Module } from '@nestjs/common';
import { TteController } from './tte.controller';
import { TtePublicController } from './tte-public.controller';
import { TtePenandatangananService } from './tte-penandatanganan.service';
import { TteProfilService } from './tte-profil.service';
import { TteRepository } from './tte.repository';
import { TteService } from './tte.service';
import { TteVerifikasiService } from './tte-verifikasi.service';

@Module({
  controllers: [TteController, TtePublicController],
  providers: [
    TteService,
    TteProfilService,
    TtePenandatangananService,
    TteVerifikasiService,
    TteRepository,
  ],
  exports: [TteService],
})
export class TteModule {}
