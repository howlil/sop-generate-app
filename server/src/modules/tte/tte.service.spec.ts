import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  JenisDokumenTte,
  PeranPengguna,
  StatusPengajuanEvaluasi,
  StatusSOP,
} from '../../generated/prisma';
import type { JwtAccessPayload } from '../../common/types/jwt-access-payload.type';
import type { TteRepository } from './tte.repository';
import { TtePenandatangananService } from './tte-penandatanganan.service';
import { TteProfilService } from './tte-profil.service';
import { TteService } from './tte.service';
import { TteVerifikasiService } from './tte-verifikasi.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-pin'),
  compare: jest.fn(),
}));

describe('TteService', () => {
  const mockTtePinRow = {
    hashPin: 'x',
    ttePinSetAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  };

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
      createKredensialPin: jest.fn(),
      updateKredensialPinHash: jest.fn(),
      findRiwayatPengesahanByUserAndDokumen: jest.fn(),
      assertRiwayatBelumAda: jest.fn(),
      transaksiTandaTanganiBaEvaluator: jest.fn(),
      transaksiTandaTanganiBaKoordinator: jest.fn(),
      transaksiTandaTanganiSemuaSopPengajuan: jest.fn(),
      ...partial,
    } as unknown as jest.Mocked<TteRepository>;
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

  function buildTteService(repo: jest.Mocked<TteRepository>, cfg: ConfigService): TteService {
    const profilService = new TteProfilService(repo);
    const penandatangananService = new TtePenandatangananService(repo, cfg);
    const verifikasiService = new TteVerifikasiService(repo, cfg);
    return new TteService(profilService, penandatangananService, verifikasiService);
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
      findKredensial: jest.fn().mockResolvedValue(mockTtePinRow),
      transaksiTandaTanganiBaEvaluator: jest.fn().mockResolvedValue({
        error: 'BAD_STATUS',
        status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
      }),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const service = buildTteService(repo, config());
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
      findKredensial: jest.fn().mockResolvedValue(mockTtePinRow),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const service = buildTteService(repo, config());
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
      userId: evaluatorUser.sub,
      dokumenTteId: 'doc-1',
      peran: PeranPengguna.PJ_EVALUATOR,
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
      findKredensial: jest.fn().mockResolvedValue(mockTtePinRow),
      transaksiTandaTanganiBaEvaluator: jest.fn().mockResolvedValue({
        ok: true,
        riwayat: riwayatRow,
      }),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const service = buildTteService(repo, config());
    const actual = await service.tandaTanganiBa(evaluatorUser, 'pid-1', {
      pin: '1234',
      nomorDokumen: 'BA-1',
      judulDokumen: 'J',
    });
    expect(actual.id).toBe('doc-1:user-eval');
    expect(actual.peran).toBe('PJ_EVALUATOR');
    expect(actual.nomorDokumen).toBe('BA-1');
  });

  it('should_throw_when_mint_token_without_credential', async () => {
    const repo = createRepoMock({
      findKredensial: jest.fn().mockResolvedValue(null),
    });
    const service = buildTteService(repo, config());
    await expect(service.mintTokenVerifikasi(kepalaUser)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should_throw_not_found_for_unknown_user_on_profil', async () => {
    const repo = createRepoMock({
      findPenggunaAktif: jest.fn().mockResolvedValue(null),
    });
    const service = buildTteService(repo, config());
    await expect(service.getProfil(kepalaUser)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should_throw_not_found_when_getPengesahanPublic_unknown_riwayat', async () => {
    const repo = createRepoMock({
      findRiwayatPengesahanByUserAndDokumen: jest.fn().mockResolvedValue(null),
    });
    const service = buildTteService(repo, config());
    await expect(
      service.getPengesahanPublic(
        '00000000-0000-4000-8000-000000000001',
        '00000000-0000-4000-8000-000000000002',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should_return_pengesahan_public_when_riwayat_exists', async () => {
    const ditandatanganiPada = new Date('2026-02-01T12:00:00.000Z');
    const dokumenTteId = '00000000-0000-4000-8000-0000000000bb';
    const userId = '00000000-0000-4000-8000-0000000000aa';
    const repo = createRepoMock({
      findRiwayatPengesahanByUserAndDokumen: jest.fn().mockResolvedValue({
        userId,
        dokumenTteId,
        peran: PeranPengguna.PJ_EVALUATOR,
        ditandatanganiPada,
        dokumenTte: {
          dokumenTteId,
          nomorDokumen: 'BA-99',
          judulDokumen: 'Berita Acara',
          hashDokumen: 'deadbeef',
          jenisDokumen: JenisDokumenTte.BERITA_ACARA_EVALUASI,
          detailSopId: null,
          pengajuanEvaluasiId: 'pe-1',
        },
        user: {
          penggunaId: userId,
          nama: 'Evaluator',
          nip: '198001011234567890',
          jabatan: 'PJ Evaluator',
        },
      }),
    });
    const service = buildTteService(repo, config());
    const actual = await service.getPengesahanPublic(dokumenTteId, userId);
    expect(actual.userId).toBe(userId);
    expect(actual.dokumenTteId).toBe(dokumenTteId);
    expect(actual.peran).toBe('PJ_EVALUATOR');
    expect(actual.penandatangan.nama).toBe('Evaluator');
    expect(actual.dokumen.nomorDokumen).toBe('BA-99');
    expect(actual.dokumen.pengajuanEvaluasiId).toBe('pe-1');
    expect(actual.qrVerificationUrl).toBeNull();
    expect(JSON.parse(actual.qrPayload)).toEqual({
      t: 'tte-verify-v1',
      dokumenTteId,
      hashDokumen: 'deadbeef',
    });
  });

  const mockPengguna = {
    penggunaId: evaluatorUser.sub,
    email: evaluatorUser.email,
    nama: 'Eva',
    nip: '1',
    jabatan: 'PJ',
    pangkat: 'A',
    peran: PeranPengguna.PJ_EVALUATOR,
    opdId: 'opd-1',
  };

  it('should_create_pin_when_registerProfil_and_none_exists', async () => {
    const repo = createRepoMock({
      findPenggunaAktif: jest.fn().mockResolvedValue(mockPengguna),
      findKredensial: jest.fn().mockResolvedValue(null),
      createKredensialPin: jest.fn().mockResolvedValue(mockTtePinRow),
    });
    const service = buildTteService(repo, config());
    const actual = await service.registerProfil(evaluatorUser, { pin: '1234' });
    expect(actual.userId).toBe(evaluatorUser.sub);
    expect(repo.createKredensialPin).toHaveBeenCalled();
  });

  it('should_throw_conflict_when_registerProfil_but_pin_already_exists', async () => {
    const repo = createRepoMock({
      findPenggunaAktif: jest.fn().mockResolvedValue(mockPengguna),
      findKredensial: jest.fn().mockResolvedValue(mockTtePinRow),
    });
    const service = buildTteService(repo, config());
    await expect(service.registerProfil(evaluatorUser, { pin: '1234' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('should_update_pin_when_pin_lama_valid', async () => {
    const repo = createRepoMock({
      findPenggunaAktif: jest.fn().mockResolvedValue(mockPengguna),
      findKredensial: jest.fn().mockResolvedValue(mockTtePinRow),
      updateKredensialPinHash: jest.fn().mockResolvedValue(mockTtePinRow),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const service = buildTteService(repo, config());
    const actual = await service.updateProfilPin(evaluatorUser, {
      pinLama: '1234',
      pinBaru: '5678',
    });
    expect(actual.userId).toBe(evaluatorUser.sub);
    expect(repo.updateKredensialPinHash).toHaveBeenCalled();
  });

  it('should_throw_unauthorized_when_updateProfilPin_with_wrong_pin_lama', async () => {
    const repo = createRepoMock({
      findPenggunaAktif: jest.fn().mockResolvedValue(mockPengguna),
      findKredensial: jest.fn().mockResolvedValue(mockTtePinRow),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const service = buildTteService(repo, config());
    await expect(
      service.updateProfilPin(evaluatorUser, { pinLama: 'wrong', pinBaru: '5678' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should_show_detail_status_context_when_batch_sign_has_non_eligible_sop', async () => {
    const repo = createRepoMock({
      findPenggunaAktif: jest.fn().mockResolvedValue({
        penggunaId: kepalaUser.sub,
        email: kepalaUser.email,
        nama: 'Kepala',
        nip: '3',
        jabatan: 'Kepala OPD',
        pangkat: 'A',
        peran: PeranPengguna.KEPALA_OPD,
        opdId: 'opd-1',
      }),
      findKredensial: jest.fn().mockResolvedValue(mockTtePinRow),
      transaksiTandaTanganiSemuaSopPengajuan: jest.fn().mockResolvedValue({
        error: 'BAD_SOP_STATUS',
        detailSopId: 'detail-1',
        nomorSOP: 'SOP-DINKES-001-V1',
        judulSOP: 'Pelayanan Surat Keterangan Sehat',
        status: StatusSOP.BERLAKU,
        expectedStatus: StatusSOP.DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI,
      }),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const service = buildTteService(repo, config());
    await expect(
      service.tandaTanganiSemuaSopPengajuan(kepalaUser, 'peng-1', {
        pin: '1234',
        nomorDokumen: 'DOC-1',
        judulDokumen: 'Judul Dokumen',
      }),
    ).rejects.toThrow(
      'SOP SOP-DINKES-001-V1 (Pelayanan Surat Keterangan Sehat) tidak dapat ditandatangani dari status BERLAKU. Status yang diwajibkan: DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI.',
    );
  });
});
