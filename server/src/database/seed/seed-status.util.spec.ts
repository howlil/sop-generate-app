import { StatusPengajuanEvaluasi, StatusSOP } from '../../generated/prisma';
import { mapStatusSopUntukPengajuan } from './seed-status.util';

describe('mapStatusSopUntukPengajuan', () => {
  it('should_map_sedang_dievaluasi_to_sedang_dievaluasi', () => {
    expect(mapStatusSopUntukPengajuan(StatusPengajuanEvaluasi.SEDANG_DIEVALUASI)).toBe(
      StatusSOP.SEDANG_DIEVALUASI,
    );
  });

  it('should_map_selesai_dievaluasi_to_siap_diverifikasi', () => {
    expect(mapStatusSopUntukPengajuan(StatusPengajuanEvaluasi.SELESAI_DIEVALUASI)).toBe(
      StatusSOP.SIAP_DIVERIFIKASI,
    );
  });

  it('should_map_diverifikasi_pj_evaluator_to_siap_diverifikasi', () => {
    expect(mapStatusSopUntukPengajuan(StatusPengajuanEvaluasi.DIVERIFIKASI_PJ_EVALUATOR)).toBe(
      StatusSOP.SIAP_DIVERIFIKASI,
    );
  });

  it('should_map_ditandatangani_pj_penyusun_to_diverifikasi_pj_evaluator_organisasi', () => {
    expect(mapStatusSopUntukPengajuan(StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN)).toBe(
      StatusSOP.DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI,
    );
  });

  it('should_map_selesai_to_berlaku', () => {
    expect(mapStatusSopUntukPengajuan(StatusPengajuanEvaluasi.SELESAI)).toBe(StatusSOP.BERLAKU);
  });
});
