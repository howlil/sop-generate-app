import { BadRequestException } from '@nestjs/common';
import type { JwtAccessPayload } from '../../common';
import { HasilEvaluasi, StatusPengajuanEvaluasi } from '../../generated/prisma';
import type { SopCommentRepository } from '../sop/sop-comment/sop-comment.repository';
import type { EvaluasiNilaiRepository } from './evaluasi-nilai.repository';
import { EvaluasiNilaiService } from './evaluasi-nilai.service';

describe('EvaluasiNilaiService', () => {
  const user: JwtAccessPayload = {
    sub: 'evaluator-1',
    email: 'ev@test',
    peran: 'EVALUATOR' as JwtAccessPayload['peran'],
  };

  const noopSopRepo = {
    createKomentarWithLogTx: jest.fn(),
  } as unknown as SopCommentRepository;

  describe('isiNilai', () => {
    it('should_reject_perlu_perbaikan_when_catatan_kosong', async () => {
      const runTransaction = jest.fn();
      const repo = { runTransaction } as unknown as EvaluasiNilaiRepository;
      const service = new EvaluasiNilaiService(repo, noopSopRepo);
      await expect(
        service.isiNilai(user, 'p1', 'd1', {
          hasil: HasilEvaluasi.PERLU_PERBAIKAN,
          version: 0,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(runTransaction).not.toHaveBeenCalled();
    });

    it('should_promote_menunggu_ke_sedang_saat_isi_nilai_pertama', async () => {
      const updatePengajuan = jest.fn().mockResolvedValue({});
      const mockTx = {
        pengajuanEvaluasi: {
          findUnique: jest.fn().mockResolvedValue({
            status: StatusPengajuanEvaluasi.MENUNGGU_EVALUASI,
          }),
          update: updatePengajuan,
        },
        nilaiEvaluasi: {
          findUnique: jest.fn().mockResolvedValue({
            nilaiEvaluasiId: 'n1',
            pengajuanEvaluasiId: 'p1',
            detailSopId: 'd1',
            hasil: null,
            catatan: null,
            version: 0,
          }),
          update: jest.fn().mockResolvedValue({
            nilaiEvaluasiId: 'n1',
            pengajuanEvaluasiId: 'p1',
            detailSopId: 'd1',
            hasil: HasilEvaluasi.SESUAI,
            catatan: null,
            version: 1,
            dinilaiOlehId: user.sub,
            createdAt: new Date('2026-05-05T10:00:00.000Z'),
            updatedAt: new Date('2026-05-05T10:00:00.000Z'),
          }),
        },
        logNilaiEvaluasi: { create: jest.fn().mockResolvedValue({}) },
        detailSOP: { updateMany: jest.fn() },
      };
      const runTransaction = jest.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) =>
        fn(mockTx),
      );
      const repo = { runTransaction } as unknown as EvaluasiNilaiRepository;
      const service = new EvaluasiNilaiService(repo, noopSopRepo);
      await service.isiNilai(user, 'p1', 'd1', {
        hasil: HasilEvaluasi.SESUAI,
        version: 0,
      });
      expect(updatePengajuan).toHaveBeenCalledWith({
        where: { pengajuanEvaluasiId: 'p1' },
        data: expect.objectContaining({
          status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
        }),
      });
    });

    it('should_call_createKomentarWithLogTx_when_perlu_perbaikan_dengan_catatan', async () => {
      const mockTx = {
        pengajuanEvaluasi: {
          findUnique: jest.fn().mockResolvedValue({
            status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
          }),
        },
        nilaiEvaluasi: {
          findUnique: jest.fn().mockResolvedValue({
            nilaiEvaluasiId: 'n1',
            pengajuanEvaluasiId: 'p1',
            detailSopId: 'd1',
            hasil: null,
            catatan: null,
            version: 0,
          }),
          update: jest.fn().mockResolvedValue({
            nilaiEvaluasiId: 'n1',
            pengajuanEvaluasiId: 'p1',
            detailSopId: 'd1',
            hasil: HasilEvaluasi.PERLU_PERBAIKAN,
            catatan: 'Perbaiki lampiran',
            version: 1,
            dinilaiOlehId: user.sub,
            createdAt: new Date('2026-05-05T10:00:00.000Z'),
            updatedAt: new Date('2026-05-05T10:00:00.000Z'),
          }),
        },
        logNilaiEvaluasi: { create: jest.fn().mockResolvedValue({}) },
        detailSOP: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      };
      const runTransaction = jest.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) =>
        fn(mockTx),
      );
      const repo = { runTransaction } as unknown as EvaluasiNilaiRepository;
      const createKomentarWithLogTx = jest.fn().mockResolvedValue(undefined);
      const sopRepo = { createKomentarWithLogTx } as unknown as SopCommentRepository;
      const service = new EvaluasiNilaiService(repo, sopRepo);
      await service.isiNilai(user, 'p1', 'd1', {
        hasil: HasilEvaluasi.PERLU_PERBAIKAN,
        catatan: 'Perbaiki lampiran',
        version: 0,
      });
      expect(createKomentarWithLogTx).toHaveBeenCalledTimes(1);
      expect(createKomentarWithLogTx).toHaveBeenCalledWith(mockTx, {
        detailSopId: 'd1',
        userId: user.sub,
        isi: '[Evaluasi] Perbaiki lampiran',
      });
      expect(mockTx.detailSOP.updateMany).toHaveBeenCalled();
    });
  });

  describe('selesai', () => {
    it('should_reject_when_belum_semua_SESUAI', async () => {
      const mockTx = {
        pengajuanEvaluasi: {
          findUnique: jest.fn().mockResolvedValue({
            pengajuanEvaluasiId: 'p1',
            status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
            tanggalEvaluasi: null,
            nilaiEvaluasi: [
              { detailSopId: 'a', hasil: HasilEvaluasi.SESUAI },
              { detailSopId: 'b', hasil: HasilEvaluasi.PERLU_PERBAIKAN },
            ],
          }),
        },
      };
      const runTransaction = jest.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) =>
        fn(mockTx),
      );
      const repo = { runTransaction } as unknown as EvaluasiNilaiRepository;
      const service = new EvaluasiNilaiService(repo, noopSopRepo);
      await expect(service.selesai(user, 'p1', { nilaiOPD: 5 })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
});
