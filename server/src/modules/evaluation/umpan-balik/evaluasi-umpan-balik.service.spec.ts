import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { HasilEvaluasi, PeranPengguna } from '../../../generated/prisma';
import type { JwtAccessPayload } from '../../../common';
import { EvaluasiNilaiService } from '../nilai/evaluasi-nilai.service';
import { PengajuanEvaluasiRepository } from '../pengajuan/pengajuan-evaluasi.repository';
import { EvaluasiUmpanBalikService } from './evaluasi-umpan-balik.service';

describe('EvaluasiUmpanBalikService', () => {
  let service: EvaluasiUmpanBalikService;

  const nilaiServiceMock = {
    findOpdIdByDetailSopId: jest.fn(),
    findUmpanBalikForDetail: jest.fn(),
  };

  const pengajuanRepoMock = {
    findOpdIdPengguna: jest.fn(),
  };

  const penyusunUser: JwtAccessPayload = {
    sub: 'penyusun-1',
    email: 'p@x.id',
    peran: PeranPengguna.PENYUSUN,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EvaluasiUmpanBalikService(
      nilaiServiceMock as unknown as EvaluasiNilaiService,
      pengajuanRepoMock as unknown as PengajuanEvaluasiRepository,
    );
    pengajuanRepoMock.findOpdIdPengguna.mockResolvedValue('opd-1');
    nilaiServiceMock.findOpdIdByDetailSopId.mockResolvedValue('opd-1');
  });

  it('should_forbid_when_peran_evaluator', async () => {
    const user: JwtAccessPayload = {
      sub: 'ev-1',
      email: 'e@x.id',
      peran: PeranPengguna.EVALUATOR,
    };
    await expect(service.getUmpanBalikForDetail(user, 'detail-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(pengajuanRepoMock.findOpdIdPengguna).not.toHaveBeenCalled();
  });

  it('should_forbid_when_opd_mismatch', async () => {
    nilaiServiceMock.findOpdIdByDetailSopId.mockResolvedValueOnce('opd-lain');
    await expect(
      service.getUmpanBalikForDetail(penyusunUser, 'detail-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should_throw_not_found_when_detail_missing', async () => {
    nilaiServiceMock.findOpdIdByDetailSopId.mockResolvedValueOnce(null);
    await expect(
      service.getUmpanBalikForDetail(penyusunUser, 'detail-x'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should_return_mapped_umpan_balik_when_found', async () => {
    nilaiServiceMock.findUmpanBalikForDetail.mockResolvedValueOnce({
      pengajuanEvaluasiId: 'pj-1',
      detailSopId: 'detail-1',
      hasil: HasilEvaluasi.PERLU_PERBAIKAN,
      catatan: 'Perbaiki prosedur',
      statusTindakLanjut: null,
      ditindaklanjutiPada: null,
      version: 1,
      dinilaiOleh: { penggunaId: 'ev-1', nama: 'Evaluator' },
      ditindaklanjutiOleh: null,
    });
    const actual = await service.getUmpanBalikForDetail(penyusunUser, 'detail-1');
    expect(actual).not.toBeNull();
    expect(actual?.detailSopId).toBe('detail-1');
    expect(actual?.catatan).toBe('Perbaiki prosedur');
    expect(actual?.hasilLabel).toBeTruthy();
  });

  it('should_return_null_when_no_umpan_balik_row', async () => {
    nilaiServiceMock.findUmpanBalikForDetail.mockResolvedValueOnce(null);
    const actual = await service.getUmpanBalikForDetail(penyusunUser, 'detail-1');
    expect(actual).toBeNull();
  });
});
