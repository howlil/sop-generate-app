export interface TimPenyusunFormState {
  namaLengkap: string;
  nip: string;
  jabatan: string;
  pangkat: string;
  email: string;
  nohp: string;
  roleInternal?: "Koordinator" | "Anggota";
}

export interface TimEvaluasiAnggotaUI {
  id: string;
  namaLengkap: string;
  nip: string;
  jabatan: string;
  pangkat: string;
  email: string;
  nohp: string;
  status?: string;
  endedAt?: string;
  [key: string]: unknown;
}
