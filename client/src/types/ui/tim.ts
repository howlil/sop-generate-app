export interface TimPenyusunFormState {
  namaLengkap: string;
  nip: string;
  jabatan: string;
  pangkat: string;
  email: string;
  nohp: string;
  roleInternal?: "Koordinator" | "Anggota";
}
