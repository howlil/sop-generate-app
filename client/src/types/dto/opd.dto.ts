export interface OpdResponse {
  id: string;
  nama: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    pengguna: number;
    sop: number;
    pelaksana: number;
    anggotaTimPenyusun: number;
    pengajuanEvaluasi: number;
    peraturan: number;
  };
  totalSOP?: number;
  sopBerlaku?: number;
  sopDraft?: number;
}

export type OPD = OpdResponse;

export interface OpdWithStats extends OpdResponse {
  totalSOP: number;
  sopBerlaku: number;
  sopDraft: number;
}

export interface CreateOpdDto {
  nama: string;
}

export interface UpdateOpdDto {
  nama: string;
}

export interface UpdateOpdMutationDto {
  id: string;
  payload: UpdateOpdDto;
}
