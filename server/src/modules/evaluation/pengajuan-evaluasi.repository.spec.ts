import { StatusPengajuanEvaluasi } from '../../generated/prisma';
import { PengajuanEvaluasiRepository } from './pengajuan-evaluasi.repository';

describe('PengajuanEvaluasiRepository.buildWhereFromQuery', () => {
  const repo = new PengajuanEvaluasiRepository(null as never);

  it('should_use_statusIn_when_non_empty_and_ignore_single_status', () => {
    const actual = repo.buildWhereFromQuery({
      status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
      statusIn: [StatusPengajuanEvaluasi.DIVERIFIKASI_PJ_EVALUATOR, StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN],
    });
    expect(actual).toEqual({
      AND: [
        {
          status: {
            in: [StatusPengajuanEvaluasi.DIVERIFIKASI_PJ_EVALUATOR, StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN],
          },
        },
      ],
    });
  });

  it('should_fall_back_to_single_status_when_statusIn_empty', () => {
    const actual = repo.buildWhereFromQuery({
      statusIn: [],
      status: StatusPengajuanEvaluasi.DIVERIFIKASI_PJ_EVALUATOR,
    });
    expect(actual).toEqual({ AND: [{ status: StatusPengajuanEvaluasi.DIVERIFIKASI_PJ_EVALUATOR }] });
  });
});
