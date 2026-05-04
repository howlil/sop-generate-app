import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { OpdModule } from './opd/opd.module';
import { PenggunaModule } from './pengguna/pengguna.module';

/** Konteks inti aplikasi: autentikasi, pengguna, OPD, dan layanan dasar terkait. */
@Module({
  imports: [AuthModule, OpdModule, PenggunaModule],
  exports: [AuthModule, OpdModule, PenggunaModule],
})
export class CoreModule {}
