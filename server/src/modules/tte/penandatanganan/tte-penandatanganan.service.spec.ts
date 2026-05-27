import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  JenisDokumenTte,
  PeranPengguna,
  StatusPengajuanEvaluasi,
  StatusSOP,
} from '../../../generated/prisma';
import type { JwtAccessPayload } from '../../../common/types/jwt-access-payload.type';
import type { TteRepository } from '../shared/repository/tte.repository';
import { TtePenandatangananService } from './tte-penandatanganan.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('Pengujian TtePenandatangananService', () => {

  const evaluatorUser: JwtAccessPayload = {
    sub: 'user-eval',
    email: 'e@test.id',
    peran: PeranPengguna.PJ_EVALUATOR,
  };

  const pjPenyusunUser: JwtAccessPayload = {
    sub: 'user-pj-penyusun',
    email: 'pjp@test.id',
    peran: PeranPengguna.PJ_PENYUSUN,
  };

  const kepalaUser: JwtAccessPayload = {
    sub: 'user-kep',
    email: 'k@test.id',
    peran: PeranPengguna.KEPALA_OPD,
  };

  const invalidRoleUser: JwtAccessPayload = {
    sub: 'user-invalid',
    email: 'inv@test.id',
    peran: PeranPengguna.EVALUATOR,
  };

  const mockTtePinRow = {
    hashPin: 'hashed-pin',
    updatedAt: new Date(),
  };

  function createRepoMock(
    partial: Partial<jest.Mocked<TteRepository>>,
  ): jest.Mocked<TteRepository> {
    return {
      findPenggunaAktif: jest.fn(),
      findKredensial: jest.fn(),
      transaksiTandaTanganiBaEvaluator: jest.fn(),
      transaksiTandaTanganiBaPjPenyusun: jest.fn(),
      transaksiTandaTanganiSemuaSopPengajuan: jest.fn(),
      ...partial,
    } as unknown as jest.Mocked<TteRepository>;
  }

  function config() {
    return {
      get: jest.fn((key: string) => {
        if (key === 'PUBLIC_TTE_VERIFY_BASE_URL') {
          return 'https://verify.test';
        }
        return '';
      }),
    } as unknown as ConfigService;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Pengujian Dasar & Validasi PIN', () => {
    it('seharusnya melempar NotFoundException jika pengguna tidak ditemukan', async () => {
      const repo = createRepoMock({
        findPenggunaAktif: jest.fn().mockResolvedValue(null),
      });
      const service = new TtePenandatangananService(repo, config());

      await expect(
        service.tandaTanganiBa(evaluatorUser, 'pid-1', {
          pin: '1234',
          nomorDokumen: 'DOC',
          judulDokumen: 'Title',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('seharusnya melempar BadRequestException jika kredensial PIN belum dibuat', async () => {
      const repo = createRepoMock({
        findPenggunaAktif: jest.fn().mockResolvedValue({ peran: PeranPengguna.PJ_EVALUATOR } as any),
        findKredensial: jest.fn().mockResolvedValue(null),
      });
      const service = new TtePenandatangananService(repo, config());

      await expect(
        service.tandaTanganiBa(evaluatorUser, 'pid-1', {
          pin: '1234',
          nomorDokumen: 'DOC',
          judulDokumen: 'Title',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('seharusnya melempar ForbiddenException jika PIN tidak valid', async () => {
      const repo = createRepoMock({
        findPenggunaAktif: jest.fn().mockResolvedValue({ peran: PeranPengguna.PJ_EVALUATOR } as any),
        findKredensial: jest.fn().mockResolvedValue(mockTtePinRow),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const service = new TtePenandatangananService(repo, config());

      await expect(
        service.tandaTanganiBa(evaluatorUser, 'pid-1', {
          pin: 'wrong',
          nomorDokumen: 'DOC',
          judulDokumen: 'Title',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('tandaTanganiBa (Skenario PJ_EVALUATOR)', () => {
    let repo: jest.Mocked<TteRepository>;
    let service: TtePenandatangananService;

    beforeEach(() => {
      repo = createRepoMock({
        findPenggunaAktif: jest.fn().mockResolvedValue({ peran: PeranPengguna.PJ_EVALUATOR } as any),
        findKredensial: jest.fn().mockResolvedValue(mockTtePinRow),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      service = new TtePenandatangananService(repo, config());
    });

    it('seharusnya melempar NotFoundException ketika NOT_FOUND', async () => {
      repo.transaksiTandaTanganiBaEvaluator.mockResolvedValue({ error: 'NOT_FOUND' });
      await expect(
        service.tandaTanganiBa(evaluatorUser, 'pid-1', { pin: '1234', nomorDokumen: 'D', judulDokumen: 'J' })
      ).rejects.toThrow(NotFoundException);
    });

    it('seharusnya melempar ConflictException ketika BAD_STATUS', async () => {
      repo.transaksiTandaTanganiBaEvaluator.mockResolvedValue({ error: 'BAD_STATUS', status: StatusPengajuanEvaluasi.SELESAI });
      await expect(
        service.tandaTanganiBa(evaluatorUser, 'pid-1', { pin: '1234', nomorDokumen: 'D', judulDokumen: 'J' })
      ).rejects.toThrow(/Pengajuan tidak dapat ditandatangani pada status SELESAI/);
    });

    it('seharusnya melempar ConflictException ketika ALREADY_SIGNED', async () => {
      repo.transaksiTandaTanganiBaEvaluator.mockResolvedValue({ error: 'ALREADY_SIGNED' });
      await expect(
        service.tandaTanganiBa(evaluatorUser, 'pid-1', { pin: '1234', nomorDokumen: 'D', judulDokumen: 'J' })
      ).rejects.toThrow('Berita Acara sudah ditandatangani untuk peran ini');
    });

    it('seharusnya melempar ConflictException ketika INVALID_DOC_PARENT', async () => {
      repo.transaksiTandaTanganiBaEvaluator.mockResolvedValue({ error: 'INVALID_DOC_PARENT' });
      await expect(
        service.tandaTanganiBa(evaluatorUser, 'pid-1', { pin: '1234', nomorDokumen: 'D', judulDokumen: 'J' })
      ).rejects.toThrow('wajib tepat satu referensi parent');
    });

    it('seharusnya melempar ConflictException ketika transaksi tidak sukses (ok=false)', async () => {
      repo.transaksiTandaTanganiBaEvaluator.mockResolvedValue({ ok: false, riwayat: null } as any);
      await expect(
        service.tandaTanganiBa(evaluatorUser, 'pid-1', { pin: '1234', nomorDokumen: 'D', judulDokumen: 'J' })
      ).rejects.toThrow('Gagal menyelesaikan penandatanganan');
    });
  });

  describe('tandaTanganiBa (Skenario PJ_PENYUSUN)', () => {
    let repo: jest.Mocked<TteRepository>;
    let service: TtePenandatangananService;

    beforeEach(() => {
      repo = createRepoMock({
        findPenggunaAktif: jest.fn().mockResolvedValue({ peran: PeranPengguna.PJ_PENYUSUN, opdId: 'opd-1' } as any),
        findKredensial: jest.fn().mockResolvedValue(mockTtePinRow),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      service = new TtePenandatangananService(repo, config());
    });

    it('seharusnya melempar ForbiddenException ketika FORBIDDEN_OPD', async () => {
      repo.transaksiTandaTanganiBaPjPenyusun.mockResolvedValue({ error: 'FORBIDDEN_OPD' });
      await expect(
        service.tandaTanganiBa(pjPenyusunUser, 'pid-1', { pin: '1234', nomorDokumen: 'D', judulDokumen: 'J' })
      ).rejects.toThrow(ForbiddenException);
    });

    it('seharusnya melempar ConflictException ketika DOC_MISMATCH', async () => {
      repo.transaksiTandaTanganiBaPjPenyusun.mockResolvedValue({ error: 'DOC_MISMATCH' });
      await expect(
        service.tandaTanganiBa(pjPenyusunUser, 'pid-1', { pin: '1234', nomorDokumen: 'D', judulDokumen: 'J' })
      ).rejects.toThrow('Dokumen TTE tidak cocok dengan pengajuan evaluasi');
    });

    it('seharusnya melempar ConflictException ketika SOP_STATUS_DRIFT', async () => {
      repo.transaksiTandaTanganiBaPjPenyusun.mockResolvedValue({ error: 'SOP_STATUS_DRIFT', updatedCount: 1, expectedCount: 2 });
      await expect(
        service.tandaTanganiBa(pjPenyusunUser, 'pid-1', { pin: '1234', nomorDokumen: 'D', judulDokumen: 'J' })
      ).rejects.toThrow('Status sebagian SOP sudah berubah (1/2)');
    });

    it('seharusnya mengembalikan riwayat jika transaksi PJ Penyusun berhasil', async () => {
      const ditandatanganiPada = new Date();
      repo.transaksiTandaTanganiBaPjPenyusun.mockResolvedValue({
        ok: true,
        riwayat: {
          userId: pjPenyusunUser.sub,
          dokumenTteId: 'doc-1',
          peran: PeranPengguna.PJ_PENYUSUN,
          ditandatanganiPada,
          dokumenTte: {
            dokumenTteId: 'doc-1',
            nomorDokumen: 'BA-1',
            judulDokumen: 'J',
            hashDokumen: 'abc',
            jenisDokumen: JenisDokumenTte.BERITA_ACARA_EVALUASI,
            detailSopId: null,
            pengajuanEvaluasiId: 'pid-1',
          },
          user: { penggunaId: pjPenyusunUser.sub, nama: 'Penyusun', nip: '1' },
        }
      } as any);
      const actual = await service.tandaTanganiBa(pjPenyusunUser, 'pid-1', { pin: '1234', nomorDokumen: 'D', judulDokumen: 'J' });
      expect(actual.id).toBe('doc-1:user-pj-penyusun');
      expect(actual.peran).toBe('PJ_PENYUSUN');
    });
  });

  describe('tandaTanganiBa (Skenario Role Invalid)', () => {
    it('seharusnya melempar ForbiddenException jika peran bukan PJ_EVALUATOR atau PJ_PENYUSUN', async () => {
      const repo = createRepoMock({
        findPenggunaAktif: jest.fn().mockResolvedValue({ peran: PeranPengguna.EVALUATOR } as any),
        findKredensial: jest.fn().mockResolvedValue(mockTtePinRow),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const service = new TtePenandatangananService(repo, config());

      await expect(
        service.tandaTanganiBa(invalidRoleUser, 'pid-1', { pin: '1234', nomorDokumen: 'D', judulDokumen: 'J' })
      ).rejects.toThrow('Hanya PJ Evaluator atau PJ Penyusun yang dapat menandatangani');
    });
  });

  describe('tandaTanganiSemuaSopPengajuan', () => {
    let repo: jest.Mocked<TteRepository>;
    let service: TtePenandatangananService;

    beforeEach(() => {
      repo = createRepoMock({
        findPenggunaAktif: jest.fn().mockResolvedValue({ peran: PeranPengguna.KEPALA_OPD, opdId: 'opd-1' } as any),
        findKredensial: jest.fn().mockResolvedValue(mockTtePinRow),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      service = new TtePenandatangananService(repo, config());
    });

    it('seharusnya melempar ForbiddenException jika peran bukan Kepala OPD', async () => {
      repo.findPenggunaAktif.mockResolvedValue({ peran: PeranPengguna.PJ_PENYUSUN } as any);
      await expect(
        service.tandaTanganiSemuaSopPengajuan(pjPenyusunUser, 'pid-1', { pin: '1234', nomorDokumen: 'D', judulDokumen: 'J' })
      ).rejects.toThrow('Hanya Kepala OPD yang dapat menandatangani');
    });

    it('seharusnya menerjemahkan error BAD_PENGAJUAN_STATUS', async () => {
      repo.transaksiTandaTanganiSemuaSopPengajuan.mockResolvedValue({ error: 'BAD_PENGAJUAN_STATUS', status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI } as any);
      await expect(
        service.tandaTanganiSemuaSopPengajuan(kepalaUser, 'pid-1', { pin: '1234', nomorDokumen: 'D', judulDokumen: 'J' })
      ).rejects.toThrow(/Pengajuan tidak dapat ditandatangani pada status SEDANG_DIEVALUASI/);
    });

    it('seharusnya menerjemahkan error EMPTY_SOP', async () => {
      repo.transaksiTandaTanganiSemuaSopPengajuan.mockResolvedValue({ error: 'EMPTY_SOP' });
      await expect(
        service.tandaTanganiSemuaSopPengajuan(kepalaUser, 'pid-1', { pin: '1234', nomorDokumen: 'D', judulDokumen: 'J' })
      ).rejects.toThrow(BadRequestException);
    });

    it('seharusnya menerjemahkan error BAD_SOP_STATUS', async () => {
      repo.transaksiTandaTanganiSemuaSopPengajuan.mockResolvedValue({ error: 'BAD_SOP_STATUS', nomorSOP: '123', status: StatusSOP.DRAFT } as any);
      await expect(
        service.tandaTanganiSemuaSopPengajuan(kepalaUser, 'pid-1', { pin: '1234', nomorDokumen: 'D', judulDokumen: 'J' })
      ).rejects.toThrow(/tidak dapat ditandatangani dari status DRAFT/);
    });

    it('seharusnya menerjemahkan error ALREADY_SIGNED', async () => {
      repo.transaksiTandaTanganiSemuaSopPengajuan.mockResolvedValue({ error: 'ALREADY_SIGNED', detailSopId: 'ds-1' });
      await expect(
        service.tandaTanganiSemuaSopPengajuan(kepalaUser, 'pid-1', { pin: '1234', nomorDokumen: 'D', judulDokumen: 'J' })
      ).rejects.toThrow('SOP ds-1 sudah ditandatangani');
    });

    it('seharusnya menerjemahkan error INVALID_DOC_PARENT', async () => {
      repo.transaksiTandaTanganiSemuaSopPengajuan.mockResolvedValue({ error: 'INVALID_DOC_PARENT', detailSopId: 'ds-1' });
      await expect(
        service.tandaTanganiSemuaSopPengajuan(kepalaUser, 'pid-1', { pin: '1234', nomorDokumen: 'D', judulDokumen: 'J' })
      ).rejects.toThrow('wajib tepat satu referensi parent');
    });

    it('seharusnya melempar ConflictException ketika ok=false (Gagal sistem)', async () => {
      repo.transaksiTandaTanganiSemuaSopPengajuan.mockResolvedValue({ ok: false } as any);
      await expect(
        service.tandaTanganiSemuaSopPengajuan(kepalaUser, 'pid-1', { pin: '1234', nomorDokumen: 'D', judulDokumen: 'J' })
      ).rejects.toThrow('Gagal menandatangani seluruh SOP');
    });

    it('seharusnya mengembalikan response batch berhasil ketika transaksi OK', async () => {
      repo.transaksiTandaTanganiSemuaSopPengajuan.mockResolvedValue({ ok: true, totalSopDitandatangani: 5 } as any);
      const actual = await service.tandaTanganiSemuaSopPengajuan(kepalaUser, 'pid-1', { pin: '1234', nomorDokumen: 'D', judulDokumen: 'J' });
      expect(actual.totalSopDitandatangani).toBe(5);
      expect(actual.pengajuanEvaluasiId).toBe('pid-1');
      expect(actual.ditandatanganiPada).toBeDefined();
    });
  });
});
