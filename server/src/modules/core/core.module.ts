import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';

/** Konteks inti aplikasi: autentikasi, pengguna (nanti), dan layanan dasar terkait. */
@Module({
  imports: [AuthModule],
  exports: [AuthModule],
})
export class CoreModule {}
