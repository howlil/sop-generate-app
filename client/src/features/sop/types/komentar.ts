export interface KomentarItem {
  id: string;
  sopDetailId: string;
  userId: string;
  userName?: string;
  isi: string;
  bagian?: string;
  status: "TERBUKA" | "SELESAI";
  createdAt: string;
  updatedAt?: string;
}
