export interface SOPDetailMetadata {
  id?: string;
  judul?: string;
  nomor?: string;
  nomorSOP?: string;
  nama?: string;
  tahun?: number;
  tentang?: string;
  opdId?: string;
  lembaga?: string;
  logoUrl?: string;
  tanggalEfektif?: string;
  tanggalRevisi?: string;
  version?: number;
  name?: string;
  number?: string;
  institutionLogo?: string;
  institutionLines?: string[];
  lawBasis?: string[];
  relatedSop?: string[];
  warning?: string;
  implementQualification?: string | string[];
  equipment?: string | string[];
  recordData?: string | string[];
}

export interface ProsedurRow {
  id: string;
  urutan: number;
  no?: number;
  kegiatan: string;
  pelaksana: string;
  waktu?: number;
  satuanWaktu?: string;
  time?: number;
  time_unit?: string;
  mutu_kelengkapan?: string;
  kelengkapan?: string;
  mutu_waktu?: string;
  keluaran?: string;
  output?: string;
  keterangan?: string;
  type?: "terminator" | "task" | "decision";
  id_next_step_if_yes?: string;
  id_next_step_if_no?: string;
  pelaksanaIds?: string[];
  pelaksanaMapping?: Record<string, string>;
}

export interface SopItem {
  id: string;
  judul: string;
  opdId: string;
  status: string;
  nomorSOP?: string;
  author?: string;
  peraturanId?: string;
  tanggal?: string;
  terakhirDiperbarui?: string;
  lastEditedBy?: string;
  lastEditedAt?: string;
  versi?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PelaksanaRow {
  id: string;
  nama: string;
  opdId?: string;
  urutan?: number;
}

export interface SOPTemplate {
  id?: string;
  judul: string;
  opdId: string;
  kode?: string;
  opd?: string;
  kategori?: string;
  versi?: number;
  logoInstansi?: string;
  namaLembaga?: string;
}
