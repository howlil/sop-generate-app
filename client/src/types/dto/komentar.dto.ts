export type StatusKomentar = "TERBUKA" | "SELESAI";

/** Ringkasan pengguna pembuat komentar (selaras response server). */
export interface KomentarUser {
  id: string;
  nama: string;
  /** Peran pengguna (mis. "TIM_EVALUASI", "PENYUSUN"). */
  peran: string;
  email?: string | null;
}

/** Item komentar SOP — diproduksi oleh TIM_EVALUASI, ditandai selesai oleh penyusun. */
export interface KomentarItem {
  id: string;
  sopDetailId: string;
  userId: string;
  isi: string;
  status: StatusKomentar;
  createdAt: string;
  updatedAt: string;
  user: KomentarUser;
}

export interface CreateKomentarDto {
  isi: string;
}
