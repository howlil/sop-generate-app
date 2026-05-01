export interface JabatanUser {
  id: string;
  nama: string;
  nip: string;
  jabatan: string;
  opdId: string | null;
  email: string;
  nohp: string;
  peran: string;
  isActive: boolean;
  updatedAt: string;
  totalSopDisusun: number;
}

export interface SetKepalaAktifDto {
  userId: string;
  opdId: string;
}

export interface PindahJabatanDto {
  opdId: string;
}

export interface PindahJabatanMutationDto {
  userId: string;
  opdId: string;
}

export interface RiwayatJabatanQueryParams {
  opdId?: string;
}
