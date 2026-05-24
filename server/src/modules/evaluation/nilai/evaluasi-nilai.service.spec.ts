import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import type { JwtAccessPayload } from '../../../common';
import {
  HasilEvaluasi,
  JenisPengajuanEvaluasi,
  StatusKomentar,
  StatusPengajuanEvaluasi,
  StatusSOP,
} from '../../../generated/prisma';
import type { EvaluasiNilaiRepository } from './evaluasi-nilai.repository';
import type { PengajuanEvaluasiRepository } from '../pengajuan/pengajuan-evaluasi.repository';
import { EvaluasiNilaiService } from './evaluasi-nilai.service';

describe('EvaluasiNilaiService', () => {
  const user: JwtAccessPayload = {
    sub: 'evaluator-1',
    email: 'ev@test',
    peran: 'EVALUATOR' as JwtAccessPayload['peran'],
  };

  const penyusunUser: JwtAccessPayload = {
    sub: 'penyusun-1',
    email: 'p@test',
    peran: 'PENYUSUN' as JwtAccessPayload['peran'],
  };

  const noopPengajuanRepo = {
    findOpdIdPengguna: jest.fn().mockResolvedValue('opd-1'),
  } as unknown as PengajuanEvaluasiRepository;

  describe('isiNilai', () => {
    it('should_reject_perlu_perbaikan_when_catatan_kosong', async () => {
      const runTransaction = jest.fn();
      const repo = { runTransaction } as unknown as EvaluasiNilaiRepository;
      const service = new EvaluasiNilaiService(repo, noopPengajuanRepo);
      await expect(
        service.isiNilai(user, 'p1', 'd1', {
          hasil: HasilEvaluasi.PERLU_PERBAIKAN,
          version: 0,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(runTransaction).not.toHaveBeenCalled();
    });

    it('should_throw_not_found_when_pengajuan_not_sedang_dievaluasi', async () => {
      const mockTx = {
        pengajuanEvaluasi: {
          findUnique: jest.fn().mockResolvedValue({
            status: StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
          }),
        },
      };
      const runTransaction = jest.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx));
      const repo = { runTransaction } as unknown as EvaluasiNilaiRepository;
      const service = new EvaluasiNilaiService(repo, noopPengajuanRepo);
      await expect(
        service.isiNilai(user, 'p1', 'd1', {
          hasil: HasilEvaluasi.SESUAI,
          version: 0,
        }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should_throw_conflict_when_version_mismatch', async () => {
      const mockTx = {
        pengajuanEvaluasi: {
          findUnique: jest.fn().mockResolvedValue({
            status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
          }),
        },
        nilaiEvaluasi: {
          findUnique: jest.fn().mockResolvedValue({
            version: 1, // Mismatch with expected version 0
          }),
        },
      };
      const runTransaction = jest.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx));
      const repo = { runTransaction } as unknown as EvaluasiNilaiRepository;
      const service = new EvaluasiNilaiService(repo, noopPengajuanRepo);
      await expect(
        service.isiNilai(user, 'p1', 'd1', {
          hasil: HasilEvaluasi.SESUAI,
          version: 0,
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('should_set_status_tindak_lanjut_terbuka_when_perlu_perbaikan', async () => {
      const mockTx = {
        pengajuanEvaluasi: {
          findUnique: jest.fn().mockResolvedValue({
            status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
          }),
        },
        nilaiEvaluasi: {
          findUnique: jest.fn().mockResolvedValue({
            pengajuanEvaluasiId: 'p1',
            detailSopId: 'd1',
            hasil: null,
            catatan: null,
            version: 0,
          }),
          update: jest.fn().mockResolvedValue({
            pengajuanEvaluasiId: 'p1',
            detailSopId: 'd1',
            hasil: HasilEvaluasi.PERLU_PERBAIKAN,
            catatan: 'Perbaiki lampiran',
            statusTindakLanjut: StatusKomentar.TERBUKA,
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
      const service = new EvaluasiNilaiService(repo, noopPengajuanRepo);
      await service.isiNilai(user, 'p1', 'd1', {
        hasil: HasilEvaluasi.PERLU_PERBAIKAN,
        catatan: 'Perbaiki lampiran',
        version: 0,
      });
      expect(mockTx.nilaiEvaluasi.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            statusTindakLanjut: StatusKomentar.TERBUKA,
            ditindaklanjutiPada: null,
            ditindaklanjutiOlehId: null,
          }),
        }),
      );
      expect(mockTx.detailSOP.updateMany).toHaveBeenCalled();
    });

    it('should_clear_status_tindak_lanjut_when_sesuai', async () => {
      const mockTx = {
        pengajuanEvaluasi: {
          findUnique: jest.fn().mockResolvedValue({
            status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
          }),
        },
        nilaiEvaluasi: {
          findUnique: jest.fn().mockResolvedValue({
            pengajuanEvaluasiId: 'p1',
            detailSopId: 'd1',
            hasil: HasilEvaluasi.PERLU_PERBAIKAN,
            catatan: 'lama',
            version: 1,
          }),
          update: jest.fn().mockResolvedValue({
            pengajuanEvaluasiId: 'p1',
            detailSopId: 'd1',
            hasil: HasilEvaluasi.SESUAI,
            catatan: null,
            statusTindakLanjut: null,
            version: 2,
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
      const service = new EvaluasiNilaiService(repo, noopPengajuanRepo);
      await service.isiNilai(user, 'p1', 'd1', {
        hasil: HasilEvaluasi.SESUAI,
        version: 1,
      });
      expect(mockTx.nilaiEvaluasi.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            statusTindakLanjut: null,
          }),
        }),
      );
    });
  });

  describe('tandaiTindakLanjutSelesai', () => {
    it('should_mark_selesai_when_revisi_and_terbuka', async () => {
      const mockTx = {
        pengajuanEvaluasi: {
          findUnique: jest.fn().mockResolvedValue({
            status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
            opdId: 'opd-1',
          }),
        },
        detailSOP: {
          findFirst: jest.fn().mockResolvedValue({
            status: StatusSOP.REVISI_DARI_EVALUATOR,
          }),
        },
        nilaiEvaluasi: {
          findUnique: jest.fn().mockResolvedValue({
            hasil: HasilEvaluasi.PERLU_PERBAIKAN,
            statusTindakLanjut: StatusKomentar.TERBUKA,
          }),
          update: jest.fn().mockResolvedValue({
            pengajuanEvaluasiId: 'p1',
            detailSopId: 'd1',
            hasil: HasilEvaluasi.PERLU_PERBAIKAN,
            catatan: 'catatan',
            statusTindakLanjut: StatusKomentar.SELESAI,
            ditindaklanjutiPada: new Date('2026-05-06T10:00:00.000Z'),
            version: 2,
            dinilaiOlehId: 'evaluator-1',
            createdAt: new Date('2026-05-05T10:00:00.000Z'),
            updatedAt: new Date('2026-05-06T10:00:00.000Z'),
          }),
        },
      };
      const runTransaction = jest.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) =>
        fn(mockTx),
      );
      const repo = { runTransaction } as unknown as EvaluasiNilaiRepository;
      const service = new EvaluasiNilaiService(repo, noopPengajuanRepo);
      const out = await service.tandaiTindakLanjutSelesai(penyusunUser, 'p1', 'd1');
      expect(out.statusTindakLanjut).toBe(StatusKomentar.SELESAI);
    });
  });

  describe('assertBolehKirimUlangSetelahRevisi', () => {
    it('should_throw_when_status_masih_terbuka', async () => {
      const repo = {
        findNilaiRevisiAktifForDetail: jest.fn().mockResolvedValue({
          pengajuanEvaluasiId: 'p1',
          detailSopId: 'd1',
          hasil: HasilEvaluasi.PERLU_PERBAIKAN,
          statusTindakLanjut: StatusKomentar.TERBUKA,
        }),
      } as unknown as EvaluasiNilaiRepository;
      const service = new EvaluasiNilaiService(repo, noopPengajuanRepo);
      await expect(service.assertBolehKirimUlangSetelahRevisi('d1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('should_pass_when_status_selesai', async () => {
      const repo = {
        findNilaiRevisiAktifForDetail: jest.fn().mockResolvedValue({
          statusTindakLanjut: StatusKomentar.SELESAI,
        }),
      } as unknown as EvaluasiNilaiRepository;
      const service = new EvaluasiNilaiService(repo, noopPengajuanRepo);
      await expect(service.assertBolehKirimUlangSetelahRevisi('d1')).resolves.toBeUndefined();
    });
  });

  describe('selesai', () => {
    it('should_reject_when_belum_semua_SESUAI', async () => {
      const mockTx = {
        pengajuanEvaluasi: {
          findUnique: jest.fn().mockResolvedValue({
            pengajuanEvaluasiId: 'p1',
            status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
            jenis: JenisPengajuanEvaluasi.TERJADWAL,
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
      const service = new EvaluasiNilaiService(repo, noopPengajuanRepo);
      await expect(service.selesai(user, 'p1', { nilaiOPD: 5 })).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('should_throw_bad_request_when_selesai_but_status_not_sedang_dievaluasi', async () => {
      const mockTx = {
        pengajuanEvaluasi: {
          findUnique: jest.fn().mockResolvedValue({
            status: StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
          }),
        },
      };
      const runTransaction = jest.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx));
      const repo = { runTransaction } as unknown as EvaluasiNilaiRepository;
      const service = new EvaluasiNilaiService(repo, noopPengajuanRepo);
      await expect(service.selesai(user, 'p1', { nilaiOPD: 5 })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should_throw_bad_request_when_selesai_mandiri_with_nilaiOPD', async () => {
      const mockTx = {
        pengajuanEvaluasi: {
          findUnique: jest.fn().mockResolvedValue({
            status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
            jenis: JenisPengajuanEvaluasi.MANDIRI,
          }),
        },
      };
      const runTransaction = jest.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx));
      const repo = { runTransaction } as unknown as EvaluasiNilaiRepository;
      const service = new EvaluasiNilaiService(repo, noopPengajuanRepo);
      await expect(service.selesai(user, 'p1', { nilaiOPD: 5 })).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should_throw_bad_request_when_selesai_terjadwal_without_valid_nilaiOPD', async () => {
      const mockTx = {
        pengajuanEvaluasi: {
          findUnique: jest.fn().mockResolvedValue({
            status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
            jenis: JenisPengajuanEvaluasi.TERJADWAL,
          }),
        },
      };
      const runTransaction = jest.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx));
      const repo = { runTransaction } as unknown as EvaluasiNilaiRepository;
      const service = new EvaluasiNilaiService(repo, noopPengajuanRepo);
      await expect(service.selesai(user, 'p1', {})).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
