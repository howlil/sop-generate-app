/** OPD ringkas (GET list & GET by id) — selaras server. */
export interface OpdRingkas {
  id: string;
  nama: string;
}

/** GET `/opd/evaluasi-ringkas` — OPD dengan jumlah SOP dalam pipeline evaluasi. */
export interface OpdEvaluasiRingkas {
  id: string;
  nama: string;
  jumlahSop: number;
  jumlahSopBaru: number;
}

/** OPD setelah create/update — selaras server. */
export interface OpdMutasi {
  id: string;
  nama: string;
  createdAt: string;
  updatedAt: string;
}

/** @deprecated gunakan OpdRingkas; tetap diekspor untuk kompatibilitas impor lama */
export type OpdResponse = OpdRingkas;

export type OPD = OpdRingkas;

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
