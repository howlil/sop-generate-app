export type StatusKomentar = "TERBUKA" | "SELESAI";

export interface KomentarItem {
  id: string;
  sopDetailId: string;
  userId: string;
  userName?: string;
  isi: string;
  bagian?: string;
  status: StatusKomentar;
  createdAt: string;
  updatedAt?: string;
}
