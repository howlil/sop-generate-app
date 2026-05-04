import { Global, Module } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

/**
 * Guard lintas fitur (tanpa `APP_GUARD` untuk JWT — tetap dipasang di controller).
 * `@Global()` agar modul fitur tidak perlu mengimpor CommonModule berulang (pol Nest umum).
 */
@Global()
@Module({
  providers: [JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard],
})
export class CommonModule {}
