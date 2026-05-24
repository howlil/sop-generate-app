import { BadRequestException } from '@nestjs/common';
import { HasilEvaluasi, StatusTindakLanjut } from '../../../generated/prisma';
import { assertBolehKirimUlangSetelahRevisi } from './evaluasi-revisi.policy';

describe('evaluasi-revisi.policy', () => {
  it('should_pass_when_nilai_tidak_ada', () => {
    expect(() => assertBolehKirimUlangSetelahRevisi(null)).not.toThrow();
  });

  it('should_throw_when_status_masih_terbuka', () => {
    expect(() =>
      assertBolehKirimUlangSetelahRevisi({
        pengajuanEvaluasiId: 'p1',
        detailSopId: 'd1',
        hasil: HasilEvaluasi.PERLU_PERBAIKAN,
        statusTindakLanjut: StatusTindakLanjut.TERBUKA,
      }),
    ).toThrow(BadRequestException);
  });

  it('should_pass_when_status_selesai', () => {
    expect(() =>
      assertBolehKirimUlangSetelahRevisi({
        pengajuanEvaluasiId: 'p1',
        detailSopId: 'd1',
        hasil: HasilEvaluasi.PERLU_PERBAIKAN,
        statusTindakLanjut: StatusTindakLanjut.SELESAI,
      }),
    ).not.toThrow();
  });
});
