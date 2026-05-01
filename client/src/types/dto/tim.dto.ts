export type StatusTim = "AKTIF" | "NONAKTIF";
export type PeranInternalTimPenyusun = "Koordinator" | "Anggota";

export interface AnggotaTimPenyusun {
  id: string;
  userId: string;
  opdId: string;
  status: StatusTim;
  tanggalBergabung: string;
  berakhirPada?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    nama: string;
    email: string;
    nip: string;
    jabatan: string;
    pangkat: string;
    nohp: string;
    peran: string;
  };
  opd?: {
    id: string;
    nama: string;
  };
  jumlahSOPDisusun?: number;
  peranInternal?: PeranInternalTimPenyusun;
}

export interface TimPenyusunQueryParams {
  opdId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedTimPenyusunResponse<TItem = AnggotaTimPenyusun> {
  data: TItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AnggotaTimEvaluasi {
  id: string;
  userId: string;
  status: StatusTim;
  tanggalBergabung: string;
  berakhirPada?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    nama: string;
    email: string;
    nip: string;
    jabatan: string;
    pangkat: string;
    nohp: string;
    peran: string;
  };
}

export interface CreateTimPenyusunDto {
  userId: string;
  opdId: string;
}

export interface PindahTimPenyusunDto {
  opdId: string;
}

export interface PindahTimPenyusunMutationDto {
  id: string;
  opdId: string;
}

export interface CreateTimEvaluasiDto {
  userId: string;
}

export interface UpdateTimEvaluasiDto {
  status: StatusTim;
  berakhirPada?: string;
}
