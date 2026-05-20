import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { JwtAccessPayload } from '../../../common';
import {
  HasilEvaluasi,
  JenisPengajuanEvaluasi,
  PeranPengguna,
  StatusPengajuanEvaluasi,
  StatusSOP,
} from '../../../generated/prisma';
import { encodeLogNilaiEvaluasiClientId } from '../nilai/log-nilai-evaluasi-client-id';
import type { SopCatalogService } from '../../sop/catalog/sop-catalog.service';
import type { PengajuanEvaluasiDetailRepository } from './pengajuan-evaluasi-detail.repository';
import { PengajuanEvaluasiDetailService } from './pengajuan-evaluasi-detail.service';
import type { PengajuanEvaluasiDetailRow } from '../pengajuan/pengajuan-evaluasi.repository';
import type { PengajuanEvaluasiRepository } from '../pengajuan/pengajuan-evaluasi.repository';
import type { PengajuanEvaluasiService } from '../pengajuan/pengajuan-evaluasi.service';

describe('PengajuanEvaluasiDetailService', () => {
  const userPj: JwtAccessPayload = {
    sub: 'pj-1',
    email: 'pj@test',
    peran: PeranPengguna.PJ_EVALUATOR,
  };

  const pengajuanId = '11111111-1111-4111-8111-111111111111';
  const detailSopA = '22222222-2222-4222-8222-222222222221';
  const detailSopB = '22222222-2222-4222-8222-222222222222';

  function buildMinimalRow(extra?: Partial<PengajuanEvaluasiDetailRow>): PengajuanEvaluasiDetailRow {
    const createdAt = new Date('2026-05-05T08:00:00.000Z');
    const updatedAt = new Date('2026-05-06T09:00:00.000Z');
    const baseNilaiFirst = [
      {
        pengajuanEvaluasiId: pengajuanId,
        detailSopId: detailSopA,
        hasil: HasilEvaluasi.SESUAI,
        catatan: 'Baik',
        version: 0,
        dinilaiOlehId: 'evo-1',
        createdAt,
        updatedAt,
        dinilaiOleh: { penggunaId: 'evo-1', nama: 'Eva Luna' },
        detailSop: {
          detailSopId: detailSopA,
          nomorSOP: 'SOP 2',
          status: StatusSOP.SEDANG_DIEVALUASI,
          sop: { sopId: 's-op-1', judul: 'SOP Pertama' },
        },
      },
      {
        pengajuanEvaluasiId: pengajuanId,
        detailSopId: detailSopB,
        hasil: null,
        catatan: null,
        version: 0,
        dinilaiOlehId: null,
        createdAt,
        updatedAt,
        dinilaiOleh: null,
        detailSop: {
          detailSopId: detailSopB,
          nomorSOP: 'SOP 10',
          status: StatusSOP.SEDANG_DIEVALUASI,
          sop: { sopId: 's-op-2', judul: 'SOP Kedua' },
        },
      },
    ];
    return {
      pengajuanEvaluasiId: pengajuanId,
      opdId: '33333333-3333-4333-8333-333333333333',
      jenis: JenisPengajuanEvaluasi.TERJADWAL,
      status: StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
      nomorBA: 'BA-001',
      tanggalPermintaan: createdAt,
      tanggalEvaluasi: createdAt,
      nilaiOPD: 4,
      diverifikasiOlehUserId: null,
      ditandatanganiOlehPjPenyusunUserId: null,
      tanggalTTDBaPjPenyusun: null,
      diselesaikanOlehId: 'evo-1',
      tanggalDiselesaikan: updatedAt,
      version: 1,
      createdAt,
      updatedAt,
      opd: { opdId: '33333333-3333-4333-8333-333333333333', nama: 'Dinas Test' },
      nilaiEvaluasi: baseNilaiFirst,
      diselesaikanOleh: { penggunaId: 'evo-1', nama: 'Penanggung jawab' },
      diverifikasiOlehUser: null,
      ditandatanganiOlehPjPenyusunUser: null,
      dokumenTte: [{ nomorDokumen: 'BA-TTE-FALLBACK' }],
      logNilaiEvaluasi: [
        {
          pengajuanEvaluasiId: pengajuanId,
          detailSopId: detailSopA,
          penggunaId: 'evo-1',
          hasilSebelum: null,
          hasilSesudah: HasilEvaluasi.SESUAI,
          catatanSebelum: null,
          catatanSesudah: null,
          createdAt,
          pengguna: { nama: 'Eva Luna' },
        },
      ],
      ...(extra ?? {}),
    } as PengajuanEvaluasiDetailRow;
  }

  it('should_throw_not_found_shell_when_tidak_ada_pengajuan', async () => {
    const repo = { findByIdFull: jest.fn().mockResolvedValue(null) } as unknown as PengajuanEvaluasiRepository;
    const detailRepo = {} as unknown as PengajuanEvaluasiDetailRepository;
    const pengSvc = {
      assertUserCanAccessPengajuan: jest.fn(),
    } as unknown as PengajuanEvaluasiService;
    const sop = {} as unknown as SopCatalogService;
    const service = new PengajuanEvaluasiDetailService(repo, detailRepo, pengSvc, sop);
    await expect(service.getShell(userPj, pengajuanId)).rejects.toBeInstanceOf(NotFoundException);
    expect(pengSvc.assertUserCanAccessPengajuan).not.toHaveBeenCalled();
  });

  it('should_throw_forbidden_arsip_when_pengajuan_belum_selesai', async () => {
    const row = buildMinimalRow({
      status: StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
    });
    const repo = { findByIdFull: jest.fn().mockResolvedValue(row) } as unknown as PengajuanEvaluasiRepository;
    const detailRepo = {
      existsNilaiUntukDetail: jest.fn(),
      findDokumenBeritaAcara: jest.fn(),
    } as unknown as PengajuanEvaluasiDetailRepository;
    const pengSvc = {
      assertUserCanAccessPengajuan: jest.fn().mockResolvedValue(undefined),
    } as unknown as PengajuanEvaluasiService;
    const sop = { getPenyusunWorkbenchForEvaluasiContext: jest.fn() } as unknown as SopCatalogService;
    const service = new PengajuanEvaluasiDetailService(repo, detailRepo, pengSvc, sop);
    await expect(
      service.getSopDokumen(userPj, pengajuanId, detailSopA, 100, true),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.getBeritaAcaraView(userPj, pengajuanId, true)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(sop.getPenyusunWorkbenchForEvaluasiContext).not.toHaveBeenCalled();
  });

  it('should_throw_forbidden_sop_when_detail_bukan_anggota_pengajuan', async () => {
    const row = buildMinimalRow();
    const luarPengajuan = '99999999-9999-4999-8999-999999999999';
    const repo = { findByIdFull: jest.fn().mockResolvedValue(row) } as unknown as PengajuanEvaluasiRepository;
    const detailRepo = {
      existsNilaiUntukDetail: jest.fn().mockResolvedValue(false),
      findDokumenBeritaAcara: jest.fn(),
    } as unknown as PengajuanEvaluasiDetailRepository;
    const pengSvc = {
      assertUserCanAccessPengajuan: jest.fn().mockResolvedValue(undefined),
    } as unknown as PengajuanEvaluasiService;
    const sop = { getPenyusunWorkbenchForEvaluasiContext: jest.fn() } as unknown as SopCatalogService;
    const service = new PengajuanEvaluasiDetailService(repo, detailRepo, pengSvc, sop);
    await expect(service.getSopDokumen(userPj, pengajuanId, luarPengajuan)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(sop.getPenyusunWorkbenchForEvaluasiContext).not.toHaveBeenCalled();
  });

  it('should_return_workbench_when_detail_anggota_pengajuan', async () => {
    const row = buildMinimalRow();
    const repo = { findByIdFull: jest.fn().mockResolvedValue(row) } as unknown as PengajuanEvaluasiRepository;
    const detailRepo = {
      existsNilaiUntukDetail: jest.fn().mockResolvedValue(true),
      findDokumenBeritaAcara: jest.fn(),
      findDokumenSopBerlaku: jest.fn().mockResolvedValue(null),
    } as unknown as PengajuanEvaluasiDetailRepository;
    const pengSvc = {
      assertUserCanAccessPengajuan: jest.fn().mockResolvedValue(undefined),
    } as unknown as PengajuanEvaluasiService;
    const workbenchDummy = {
      detail: { id: detailSopA },
      langkah: [],
      logEdit: [],
    };
    const sop = {
      getPenyusunWorkbenchForEvaluasiContext: jest.fn().mockResolvedValue(workbenchDummy),
    } as unknown as SopCatalogService;
    const service = new PengajuanEvaluasiDetailService(repo, detailRepo, pengSvc, sop);
    const actual = await service.getSopDokumen(userPj, pengajuanId, detailSopA, 50);
    expect(actual.detailSopId).toBe(detailSopA);
    expect(actual.workbench).toEqual(workbenchDummy);
    expect(actual.tteSignaturePayloadKepalaOpd).toBeUndefined();
    expect(sop.getPenyusunWorkbenchForEvaluasiContext).toHaveBeenCalledWith(detailSopA, 50);
    expect(detailRepo.findDokumenSopBerlaku).toHaveBeenCalledWith(detailSopA);
  });

  it('should_include_tte_payload_kepala_opd_when_sop_sudah_ditandatangani', async () => {
    const row = buildMinimalRow();
    const repo = { findByIdFull: jest.fn().mockResolvedValue(row) } as unknown as PengajuanEvaluasiRepository;
    const signedAt = new Date('2026-05-19T10:00:00.000Z');
    const dokumenTteId = '33333333-3333-4333-8333-333333333331';
    const kepalaUserId = '44444444-4444-4444-8444-444444444441';
    const detailRepo = {
      existsNilaiUntukDetail: jest.fn().mockResolvedValue(true),
      findDokumenBeritaAcara: jest.fn(),
      findDokumenSopBerlaku: jest.fn().mockResolvedValue({
        dokumenTteId,
        riwayatTandaTangan: [
          {
            peran: PeranPengguna.KEPALA_OPD,
            userId: kepalaUserId,
            dokumenTteId,
            ditandatanganiPada: signedAt,
            user: { nama: 'Dr. Kepala', nip: '198001012010011001', jabatan: 'Kepala Dinkes' },
          },
        ],
      }),
    } as unknown as PengajuanEvaluasiDetailRepository;
    const pengSvc = {
      assertUserCanAccessPengajuan: jest.fn().mockResolvedValue(undefined),
    } as unknown as PengajuanEvaluasiService;
    const workbenchDummy = { detail: { id: detailSopA }, langkah: [], logEdit: [] };
    const sop = {
      getPenyusunWorkbenchForEvaluasiContext: jest.fn().mockResolvedValue(workbenchDummy),
    } as unknown as SopCatalogService;
    const service = new PengajuanEvaluasiDetailService(repo, detailRepo, pengSvc, sop);
    const actual = await service.getSopDokumen(userPj, pengajuanId, detailSopA);
    expect(actual.tteSignaturePayloadKepalaOpd).toEqual({
      id: `${dokumenTteId}:${kepalaUserId}`,
      dokumenTteId,
      userId: kepalaUserId,
      nip: '198001012010011001',
      namaLengkap: 'Dr. Kepala',
      jabatan: 'Kepala Dinkes',
      signedAt: signedAt.toISOString(),
    });
  });

  it('shell_should_have_sopItems_timelineNilai_dan_preserves_nilai_evaluasi', async () => {
    const row = buildMinimalRow();
    const repo = { findByIdFull: jest.fn().mockResolvedValue(row) } as unknown as PengajuanEvaluasiRepository;
    const detailRepo = {} as unknown as PengajuanEvaluasiDetailRepository;
    const pengSvc = {
      assertUserCanAccessPengajuan: jest.fn().mockResolvedValue(undefined),
    } as unknown as PengajuanEvaluasiService;
    const sop = {} as unknown as SopCatalogService;
    const service = new PengajuanEvaluasiDetailService(repo, detailRepo, pengSvc, sop);
    const shell = await service.getShell(userPj, pengajuanId);
    const logCreatedAt = new Date('2026-05-05T08:00:00.000Z');
    expect(shell.id).toBe(pengajuanId);
    expect(shell.sopItems).toHaveLength(2);
    expect(shell.timelineNilai).toHaveLength(1);
    expect(shell.nilaiEvaluasi).toHaveLength(2);
    expect(shell.sopItems[0]?.detailSopId).toBe(detailSopA);
    expect(shell.sopItems[0]?.hasilEvaluasi).toBe('SESUAI');
    expect(shell.nilaiEvaluasi[0]?.id).toBe(`${pengajuanId}:${detailSopA}`);
    expect(shell.timelineNilai[0]?.id).toBe(
      encodeLogNilaiEvaluasiClientId(pengajuanId, detailSopA, 'evo-1', logCreatedAt),
    );
  });

  it('ba_view_should_sort_hasil_per_sop_nomor_numerically', async () => {
    const row = buildMinimalRow();
    const repo = { findByIdFull: jest.fn().mockResolvedValue(row) } as unknown as PengajuanEvaluasiRepository;
    const detailRepo = {
      findDokumenBeritaAcara: jest.fn().mockResolvedValue({
        dokumenTteId: 'dte-1',
        hashDokumen: 'h1',
        versiDokumen: 1,
        riwayatTandaTangan: [{ peran: PeranPengguna.PJ_EVALUATOR }],
      }),
    } as unknown as PengajuanEvaluasiDetailRepository;
    const pengSvc = {
      assertUserCanAccessPengajuan: jest.fn().mockResolvedValue(undefined),
    } as unknown as PengajuanEvaluasiService;
    const sop = {} as unknown as SopCatalogService;
    const service = new PengajuanEvaluasiDetailService(repo, detailRepo, pengSvc, sop);
    const actual = await service.getBeritaAcaraView(userPj, pengajuanId);
    expect(actual.hasilPerSop.map((h) => h.nomorSOP)).toEqual(['SOP 2', 'SOP 10']);
    expect(actual.timEvaluasi.evaluatorNamaUnik).toContain('Eva Luna');
    expect(actual.nilaiKeseluruhanOpd).toBe(4);
    expect(actual.tteBeritaAcara?.adaRiwayatTandaTanganPerPeran?.PJ_EVALUATOR).toBe(true);
  });

  it('shell_should_have_tanggalVerifikasi_bila_status_diverifikasi_pj_evaluator', async () => {
    const row = buildMinimalRow({
      status: StatusPengajuanEvaluasi.DIVERIFIKASI_PJ_EVALUATOR,
      updatedAt: new Date('2026-06-01T12:00:00.000Z'),
    });
    const repo = { findByIdFull: jest.fn().mockResolvedValue(row) } as unknown as PengajuanEvaluasiRepository;
    const detailRepo = {} as unknown as PengajuanEvaluasiDetailRepository;
    const pengSvc = {
      assertUserCanAccessPengajuan: jest.fn().mockResolvedValue(undefined),
    } as unknown as PengajuanEvaluasiService;
    const sop = {} as unknown as SopCatalogService;
    const service = new PengajuanEvaluasiDetailService(repo, detailRepo, pengSvc, sop);
    const shell = await service.getShell(userPj, pengajuanId);
    expect(shell.tanggalVerifikasi).toBe('2026-06-01T12:00:00.000Z');
  });
});
