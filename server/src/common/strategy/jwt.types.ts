import { PeranPengguna } from '../../generated/prisma';

export interface JwtPayload {
  sub: string;
  email: string;
  peran: string;
  opdId: string | null;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  nama: string;
  peran: PeranPengguna;
  opdId: string | null;
  nip: string;
  jabatan: string;
}
