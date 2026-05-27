import { StatusPengajuanEvaluasi } from '../../../generated/prisma';
import { PengajuanEvaluasiRepository } from './pengajuan-evaluasi.repository';

describe('Pengujian PengajuanEvaluasiRepository.buildWhere dari query', () => {
  const repo = new PengajuanEvaluasiRepository(null as never);

  it('seharusnya menggunakan status In ketika non kosong dan mengabaikan tunggal status', () => {
    const actual = repo.buildWhereFromQuery({
      status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
      statusIn: [
        StatusPengajuanEvaluasi.DIVERIFIKASI_PJ_EVALUATOR,
        StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
      ],
    });
    expect(actual).toEqual({
      AND: [
        {
          status: {
            in: [
              StatusPengajuanEvaluasi.DIVERIFIKASI_PJ_EVALUATOR,
              StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
            ],
          },
        },
      ],
    });
  });

  it('seharusnya memakai status tunggal ketika daftar status kosong', () => {
    const actual = repo.buildWhereFromQuery({
      statusIn: [],
      status: StatusPengajuanEvaluasi.DIVERIFIKASI_PJ_EVALUATOR,
    });
    expect(actual).toEqual({
      AND: [{ status: StatusPengajuanEvaluasi.DIVERIFIKASI_PJ_EVALUATOR }],
    });
  });
});
