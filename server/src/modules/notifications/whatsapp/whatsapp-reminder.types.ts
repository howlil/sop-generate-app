import {
  JenisPengingatWhatsApp,
  PeranPengguna,
  StatusPengajuanEvaluasi,
} from '../../../generated/prisma';

export type ActionablePengajuan = Readonly<{
  pengajuanEvaluasiId: string;
  opdId: string;
  opdNama: string;
  nomorBA: string | null;
  status: StatusPengajuanEvaluasi;
  jumlahSop: number;
}>;

export type ActiveWhatsappRecipient = Readonly<{
  penggunaId: string;
  opdId: string;
  nama: string;
  nohp: string;
  peran: PeranPengguna;
}>;

export type DesiredWhatsappReminder = Readonly<{
  pengajuanEvaluasiId: string;
  penggunaId: string;
  jenis: JenisPengingatWhatsApp;
  nomorTujuan: string;
}>;

export type ClaimedWhatsappReminder = Readonly<{
  pengingatWhatsAppId: string;
  pengajuanEvaluasiId: string;
  penggunaId: string;
  jenis: JenisPengingatWhatsApp;
  nomorTujuan: string;
  consecutiveFailures: number;
  lockToken: string | null;
  pengajuanEvaluasi: ActionablePengajuan;
  pengguna: ActiveWhatsappRecipient & { deletedAt: Date | null };
}>;

export const ACTIONABLE_REMINDER_STATUSES: readonly StatusPengajuanEvaluasi[] = [
  StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
  StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
  StatusPengajuanEvaluasi.DITANDATANGANI_PJ_EVALUATOR,
  StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
] as const;

export const REMINDER_KIND_BY_STATUS: Readonly<
  Partial<Record<StatusPengajuanEvaluasi, JenisPengingatWhatsApp>>
> = {
  [StatusPengajuanEvaluasi.SEDANG_DIEVALUASI]: JenisPengingatWhatsApp.EVALUASI_SOP,
  [StatusPengajuanEvaluasi.SELESAI_DIEVALUASI]: JenisPengingatWhatsApp.TTD_BA_PJ_EVALUATOR,
  [StatusPengajuanEvaluasi.DITANDATANGANI_PJ_EVALUATOR]: JenisPengingatWhatsApp.TTD_BA_PJ_PENYUSUN,
  [StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN]: JenisPengingatWhatsApp.TTD_SOP_KEPALA_OPD,
};

export const EXPECTED_STATUS_BY_REMINDER_KIND: Readonly<
  Record<JenisPengingatWhatsApp, StatusPengajuanEvaluasi>
> = {
  [JenisPengingatWhatsApp.EVALUASI_SOP]: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
  [JenisPengingatWhatsApp.TTD_BA_PJ_EVALUATOR]: StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
  [JenisPengingatWhatsApp.TTD_BA_PJ_PENYUSUN]: StatusPengajuanEvaluasi.DITANDATANGANI_PJ_EVALUATOR,
  [JenisPengingatWhatsApp.TTD_SOP_KEPALA_OPD]: StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
};

export const EXPECTED_ROLE_BY_REMINDER_KIND: Readonly<
  Record<JenisPengingatWhatsApp, PeranPengguna>
> = {
  [JenisPengingatWhatsApp.EVALUASI_SOP]: PeranPengguna.EVALUATOR,
  [JenisPengingatWhatsApp.TTD_BA_PJ_EVALUATOR]: PeranPengguna.PJ_EVALUATOR,
  [JenisPengingatWhatsApp.TTD_BA_PJ_PENYUSUN]: PeranPengguna.PJ_PENYUSUN,
  [JenisPengingatWhatsApp.TTD_SOP_KEPALA_OPD]: PeranPengguna.KEPALA_OPD,
};

export function reminderIdentity(reminder: {
  pengajuanEvaluasiId: string;
  penggunaId: string;
  jenis: JenisPengingatWhatsApp;
}): string {
  return `${reminder.pengajuanEvaluasiId}:${reminder.penggunaId}:${String(reminder.jenis)}`;
}
