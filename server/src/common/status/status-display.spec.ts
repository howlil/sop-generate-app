import {
  HasilEvaluasi,
  StatusPengajuanEvaluasi,
  StatusSOP,
} from '../../generated/prisma';
import {
  displayHasilEvaluasi,
  displayStatusPengajuan,
  displayStatusSop,
  displayTampilanAlur,
  HASIL_EVALUASI_BELUM_DINILAI,
} from './status-display';

describe('displayStatusSop', () => {
  it('should_provide_label_for_every_StatusSOP_enum', () => {
    for (const status of Object.values(StatusSOP)) {
      const actual = displayStatusSop(status);
      expect(actual.value).toBe(status);
      expect(actual.label.length).toBeGreaterThan(0);
    }
  });
});

describe('displayStatusPengajuan', () => {
  it('should_provide_label_for_every_StatusPengajuanEvaluasi_enum', () => {
    for (const status of Object.values(StatusPengajuanEvaluasi)) {
      const actual = displayStatusPengajuan(status);
      expect(actual.value).toBe(status);
      expect(actual.label.length).toBeGreaterThan(0);
    }
  });

  it('should_map_DIVERIFIKASI_PJ_EVALUATOR_to_BA_diverifikasi_biro', () => {
    expect(displayStatusPengajuan(StatusPengajuanEvaluasi.DIVERIFIKASI_PJ_EVALUATOR).label).toBe(
      'BA diverifikasi biro',
    );
  });
});

describe('displayHasilEvaluasi', () => {
  it('should_return_BELUM_DINILAI_when_hasil_null', () => {
    const actual = displayHasilEvaluasi(null);
    expect(actual.value).toBe(HASIL_EVALUASI_BELUM_DINILAI);
    expect(actual.label).toBe('Belum dinilai');
  });

  it('should_map_SESUAI_and_PERLU_PERBAIKAN', () => {
    expect(displayHasilEvaluasi(HasilEvaluasi.SESUAI).label).toBe('Sesuai');
    expect(displayHasilEvaluasi(HasilEvaluasi.PERLU_PERBAIKAN).label).toBe('Perlu perbaikan');
  });
});

describe('displayTampilanAlur', () => {
  it('should_provide_labels_for_all_alur_values', () => {
    const values = ['perlu_evaluasi', 'sedang_dievaluasi', 'selesai_pengajuan_ini'] as const;
    for (const alur of values) {
      const actual = displayTampilanAlur(alur);
      expect(actual.value).toBe(alur);
      expect(actual.label.length).toBeGreaterThan(0);
    }
  });
});
