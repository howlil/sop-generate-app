import type { PeranPengguna } from '../../generated/prisma';

/** Isi payload JWT akses (sesuai yang di-sign di auth service). */
export type JwtAccessPayload = {
  readonly sub: string;
  readonly email: string;
  readonly peran: PeranPengguna;
};
