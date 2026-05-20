/** Skor evaluasi tingkat OPD (pengajuan TERJADWAL) — selaras `SelesaiEvaluasiDto` dan UI evaluator. */
export const NILAI_OPD_SKOR_MIN = 1;
export const NILAI_OPD_SKOR_MAX = 5;

export function isNilaiOpdSkorValid(nilai: number | null | undefined): boolean {
  if (nilai === null || nilai === undefined) {
    return false;
  }
  return (
    Number.isInteger(nilai) &&
    nilai >= NILAI_OPD_SKOR_MIN &&
    nilai <= NILAI_OPD_SKOR_MAX
  );
}
