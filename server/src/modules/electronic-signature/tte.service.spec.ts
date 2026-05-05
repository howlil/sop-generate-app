import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  JenisDokumenTte,
  PeranPengguna,
  StatusPengajuanEvaluasi,
} from '../../generated/prisma';
import type { JwtAccessPayload } from '../../common/types/jwt-access-payload.type';
import type { TteRepository } from './tte.repository';
import { TteService } from './tte.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-pin'),
  compare: jest.fn(),
}));

describe('TteService', () => {
  const evaluatorUser: JwtAccessPayload = {
    sub: 'user-eval',
    email: 'e@test.id',
    peran: PeranPengguna.PJ_EVALUATOR,
  };

  const penyusunUser: JwtAccessPayload = {
    sub: 'user-pj',
    email: 'p@test.id',
    peran: PeranPengguna.PJ_PENYUSUN,
  };

  const kepalaUser: JwtAccessPayload = {
    sub: 'user-kep',
    email: 'k@test.id',
    peran: PeranPengguna.KEPALA_OPD,
  };

  function createRepoMock(partial: Partial<jest.Mocked<TteRepository>>): jest.Mocked<TteRepository> {
    return {
      findPenggunaAktif: jest.fn(),
      findKredensial: jest.fn(),
      upsertKredensialPin: jest.fn(),
      findRiwayatUser: jest.fn(),
      assertRiwayatBelumAda: jest.fn(),
      transaksiTandaTanganiBaEvaluator: jest.fn(),
      transaksiTandaTanganiBaKoordinator: jest.fn(),
      transaksiTandaTanganiSop: jest.fn(),
      ...partial,
    } as jest.Mocked<TteRepository>;
  }

  function config(secret = 'unit-test-secret-key-min16') {
    return {
      get: jest.fn((key: string, def?: string) => {
        if (key === 'TTE_SIGNING_SECRET') {
          return secret;
        }
        if (key === 'NODE_ENV') {
          return 'test';
        }
        return def ?? '';
      }),
    } as unknown as ConfigService;
  }

  it('should_throw_when_evaluator_signs_ba_with_wrong_status', async () => {
    const repo = createRepoMock({
      findPenggunaAktif: jest.fn().mockResolvedValue({
        penggunaId: evaluatorUser.sub,
        email: evaluatorUser.email,
        nama: 'Eva',
        nip: '1',
        jabatan: 'PJ',
        pangkat: 'A',
        peran: PeranPengguna.PJ_EVALUATOR,
        opdId: 'opd-1',
      }),
      findKredensial: jest.fn().mockResolvedValue({ hashPin: 'x' }),
      transaksiTandaTanganiBaEvaluator: jest.fn().mockResolvedValue({
        error: 'BAD_STATUS',
        status: StatusPengajuanEvaluasi.MENUNGGU_EVALUASI,
      }),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const service = new TteService(repo, config());
    await expect(
      service.tandaTanganiBa(evaluatorUser, 'pid-1', {
        pin: '1234',
        nomorDokumen: 'BA-1',
        judulDokumen: 'Judul',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('should_throw_when_pin_invalid', async () => {
    const repo = createRepoMock({
      findPenggunaAktif: jest.fn().mockResolvedValue({
        penggunaId: evaluatorUser.sub,
        email: evaluatorUser.email,
        nama: 'Eva',
        nip: '1',
        jabatan: 'PJ',
        pangkat: 'A',
        peran: PeranPengguna.PJ_EVALUATOR,
        opdId: 'opd-1',
      }),
      findKredensial: jest.fn().mockResolvedValue({ hashPin: 'x' }),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const service = new TteService(repo, config());
    await expect(
      service.tandaTanganiBa(evaluatorUser, 'pid-1', {
        pin: '9999',
        nomorDokumen: 'BA-1',
        judulDokumen: 'Judul',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should_return_riwayat_when_evaluator_ba_ok', async () => {
    const ditandatanganiPada = new Date('2026-01-01T00:00:00.000Z');
    const riwayatRow = {
      riwayatTandaTanganId: 'rw-1',
      userId: evaluatorUser.sub,
      peran: PeranPengguna.PJ_EVALUATOR,
      ditandatanganiPada,
      dokumenTte: {
        nomorDokumen: 'BA-1',
        judulDokumen: 'J',
        hashDokumen: 'abc',
        jenisDokumen: JenisDokumenTte.BERITA_ACARA_EVALUASI,
        detailSopId: null,
        pengajuanEvaluasiId: 'pid-1',
      },
      user: { penggunaId: evaluatorUser.sub, nama: 'Eva', nip: '1' },
    };
    const repo = createRepoMock({
      findPenggunaAktif: jest.fn().mockResolvedValue({
        penggunaId: evaluatorUser.sub,
        email: evaluatorUser.email,
        nama: 'Eva',
        nip: '1',
        jabatan: 'PJ',
        pangkat: 'A',
        peran: PeranPengguna.PJ_EVALUATOR,
        opdId: 'opd-1',
      }),
      findKredensial: jest.fn().mockResolvedValue({ hashPin: 'x' }),
      transaksiTandaTanganiBaEvaluator: jest.fn().mockResolvedValue({
        ok: true,
        riwayat: riwayatRow,
      }),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const service = new TteService(repo, config());
    const actual = await service.tandaTanganiBa(evaluatorUser, 'pid-1', {
      pin: '1234',
      nomorDokumen: 'BA-1',
      judulDokumen: 'J',
    });
    expect(actual.id).toBe('rw-1');
    expect(actual.peran).toBe('PJ_EVALUATOR');
    expect(actual.nomorDokumen).toBe('BA-1');
  });

  it('should_forbid_penyusun_on_sop_sign', async () => {
    const repo = createRepoMock({
      findPenggunaAktif: jest.fn().mockResolvedValue({
        penggunaId: penyusunUser.sub,
        email: penyusunUser.email,
        nama: 'P',
        nip: '2',
        jabatan: 'PJ',
        pangkat: 'B',
        peran: PeranPengguna.PJ_PENYUSUN,
        opdId: 'opd-1',
      }),
      findKredensial: jest.fn().mockResolvedValue({ hashPin: 'x' }),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const service = new TteService(repo, config());
    await expect(
      service.tandaTanganiSop(penyusunUser, 'det-1', {
        pin: '1234',
        nomorDokumen: 'SOP-1',
        judulDokumen: 'Judul',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should_throw_when_mint_token_without_credential', async () => {
    const repo = createRepoMock({
      findKredensial: jest.fn().mockResolvedValue(null),
    });
    const service = new TteService(repo, config());
    await expect(service.mintTokenVerifikasi(kepalaUser)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should_throw_not_found_for_unknown_user_on_profil', async () => {
    const repo = createRepoMock({
      findPenggunaAktif: jest.fn().mockResolvedValue(null),
    });
    const service = new TteService(repo, config());
    await expect(service.getProfil(kepalaUser)).rejects.toBeInstanceOf(NotFoundException);
  });
});
