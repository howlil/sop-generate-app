
export interface RiwayatEvaluasiItem {
  tanggal: string;
  evaluator: string;
  hasil?: string;
  catatan?: string;
}

export interface RiwayatCardItem {
  date: string;
  evaluatorName: string;
  hasil: string;
  komentar?: string;
}

export function transformRiwayatToCards(
  riwayat: RiwayatEvaluasiItem[],
): RiwayatCardItem[] {
  return riwayat.map((r) => ({
    date: r.tanggal,
    evaluatorName: r.evaluator,
    hasil: r.hasil ?? "SESUAI",
    komentar: r.catatan,
  }));
}
