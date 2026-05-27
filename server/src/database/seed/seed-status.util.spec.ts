import { StatusPengajuanEvaluasi, StatusSOP } from '../../generated/prisma';
import { mapStatusSopUntukPengajuan } from './seed-status.util';

describe('Pengujian mapStatusSopUntukPengajuan', () => {
  it('seharusnya memetakan SEDANG_DIEVALUASI tetap menjadi SEDANG_DIEVALUASI', () => {
    expect(mapStatusSopUntukPengajuan(StatusPengajuanEvaluasi.SEDANG_DIEVALUASI)).toBe(
      StatusSOP.SEDANG_DIEVALUASI,
    );
  });

  it('seharusnya memetakan SELESAI_DIEVALUASI menjadi SIAP_DIVERIFIKASI', () => {
    expect(mapStatusSopUntukPengajuan(StatusPengajuanEvaluasi.SELESAI_DIEVALUASI)).toBe(
      StatusSOP.SIAP_DIVERIFIKASI,
    );
  });

  it('seharusnya memetakan DIVERIFIKASI_PJ_EVALUATOR menjadi SIAP_DIVERIFIKASI', () => {
    expect(mapStatusSopUntukPengajuan(StatusPengajuanEvaluasi.DIVERIFIKASI_PJ_EVALUATOR)).toBe(
      StatusSOP.SIAP_DIVERIFIKASI,
    );
  });

  it('seharusnya memetakan DITANDATANGANI_PJ_PENYUSUN menjadi DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI', () => {
    expect(mapStatusSopUntukPengajuan(StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN)).toBe(
      StatusSOP.DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI,
    );
  });

  it('seharusnya memetakan SELESAI menjadi BERLAKU', () => {
    expect(mapStatusSopUntukPengajuan(StatusPengajuanEvaluasi.SELESAI)).toBe(StatusSOP.BERLAKU);
  });
});
