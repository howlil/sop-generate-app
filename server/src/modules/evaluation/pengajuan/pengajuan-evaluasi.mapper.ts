import {
  displayHasilEvaluasi,
  displayStatusPengajuan,
  displayStatusSop,
  displayStatusTindakLanjut,
} from '../../../common/status/status-display';
import { StatusPengajuanEvaluasi } from '../../../generated/prisma';
import { encodeLogNilaiEvaluasiClientId } from '../nilai/log-nilai-evaluasi-client-id';
import { buildNilaiEvaluasiClientId } from '../nilai/nilai-evaluasi-client-id';
import type { PengajuanEvaluasiDetailRow } from './pengajuan-evaluasi.repository';

const STATUS_PENGAJUAN_SUDAH_DIVERIFIKASI = new Set<StatusPengajuanEvaluasi>([
  StatusPengajuanEvaluasi.DIVERIFIKASI_PJ_EVALUATOR,
  StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
  StatusPengajuanEvaluasi.SELESAI,
]);

/** Muatan data selaras kebutuhan klien (`PengajuanEvaluasi` di `evaluasi.dto.ts`). */
export type PengajuanEvaluasiApiPayload = Record<string, unknown>;

export function mapPengajuanEvaluasiRow(row: PengajuanEvaluasiDetailRow): PengajuanEvaluasiApiPayload {
  const dokBa = row.dokumenTte[0];
  const nomorBA =
    row.nomorBA ??
    (dokBa !== undefined && dokBa !== null ? dokBa.nomorDokumen : undefined);
  const sopList = row.nilaiEvaluasi.map((n) => {
    const statusDisplay = displayStatusSop(n.detailSop.status);
    const hasilDisplay = displayHasilEvaluasi(n.hasil);
    return {
      id: buildNilaiEvaluasiClientId(row.pengajuanEvaluasiId, n.detailSopId),
      sopDetailId: n.detailSopId,
      judul: n.detailSop.sop.judul,
      nomor: n.detailSop.nomorSOP,
      nama: n.detailSop.sop.judul,
      nomorSOP: n.detailSop.nomorSOP,
      status: statusDisplay.value,
      statusLabel: statusDisplay.label,
      hasil: hasilDisplay.value,
      hasilLabel: hasilDisplay.label,
    };
  });
  const nilaiEvaluasi = row.nilaiEvaluasi.map((n) => {
    const tindakDisplay = displayStatusTindakLanjut(n.statusTindakLanjut);
    return {
      id: buildNilaiEvaluasiClientId(row.pengajuanEvaluasiId, n.detailSopId),
      pengajuanEvaluasiId: row.pengajuanEvaluasiId,
      sopDetailId: n.detailSopId,
      hasil: displayHasilEvaluasi(n.hasil).value,
      catatan: n.catatan ?? undefined,
      statusTindakLanjut: tindakDisplay?.value,
      statusTindakLanjutLabel: tindakDisplay?.label,
      ditindaklanjutiPada: n.ditindaklanjutiPada?.toISOString(),
      version: n.version,
      dinilaiOlehId: n.dinilaiOlehId ?? undefined,
      dinilaiOleh:
        n.dinilaiOleh !== null && n.dinilaiOleh !== undefined
          ? { id: n.dinilaiOleh.penggunaId, nama: n.dinilaiOleh.nama }
          : undefined,
      sopDetail: { id: n.detailSopId },
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    };
  });
  const riwayatEvaluasi = row.logNilaiEvaluasi.map((log) => ({
    id: encodeLogNilaiEvaluasiClientId(
      log.pengajuanEvaluasiId,
      log.detailSopId,
      log.penggunaId,
      log.createdAt,
    ),
    sopDetailId: log.detailSopId,
    evaluatorId: log.penggunaId,
    evaluatorNama: log.pengguna.nama,
    hasilSebelum:
      log.hasilSebelum === null || log.hasilSebelum === undefined
        ? undefined
        : displayHasilEvaluasi(log.hasilSebelum).value,
    hasilSesudah:
      log.hasilSesudah === null || log.hasilSesudah === undefined
        ? undefined
        : displayHasilEvaluasi(log.hasilSesudah).value,
    catatanSebelum: log.catatanSebelum ?? undefined,
    catatanSesudah: log.catatanSesudah ?? undefined,
    createdAt: log.createdAt.toISOString(),
  }));
  const tanggalVerifikasi = STATUS_PENGAJUAN_SUDAH_DIVERIFIKASI.has(row.status)
    ? row.updatedAt.toISOString()
    : undefined;
  const statusDisplay = displayStatusPengajuan(row.status);
  return {
    id: row.pengajuanEvaluasiId,
    opdId: row.opdId,
    opdNama: row.opd.nama,
    jenis: String(row.jenis),
    status: statusDisplay.value,
    statusLabel: statusDisplay.label,
    nomorBA,
    tanggalPermintaan: row.tanggalPermintaan?.toISOString(),
    tanggalEvaluasi: row.tanggalEvaluasi?.toISOString(),
    tanggalVerifikasi,
    namaBiro: undefined,
    nilaiOPD: row.nilaiOPD ?? undefined,
    diverifikasiOlehUserId: row.diverifikasiOlehUserId ?? undefined,
    namaPjEvaluator: row.diverifikasiOlehUser?.nama ?? row.diselesaikanOleh?.nama ?? undefined,
    ditandatanganiOlehPjPenyusunUserId: row.ditandatanganiOlehPjPenyusunUserId ?? undefined,
    namaPjPenyusun: row.ditandatanganiOlehPjPenyusunUser?.nama ?? undefined,
    tanggalTTDBaPjPenyusun: row.tanggalTTDBaPjPenyusun?.toISOString(),
    diselesaikanOlehId: row.diselesaikanOlehId ?? undefined,
    diselesaikanOleh:
      row.diselesaikanOleh !== null && row.diselesaikanOleh !== undefined
        ? { id: row.diselesaikanOleh.penggunaId, nama: row.diselesaikanOleh.nama }
        : undefined,
    opd: { id: row.opd.opdId, nama: row.opd.nama },
    timEvaluasi: row.diselesaikanOleh?.nama ?? '',
    tanggalDiselesaikan: row.tanggalDiselesaikan?.toISOString(),
    sopList,
    nilaiEvaluasi,
    riwayatEvaluasi,
    version: row.version,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
