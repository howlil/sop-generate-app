import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { JwtAccessPayload } from '../../../common';
import {
  JenisLangkahProsedur,
  PeranPengguna,
  SatuanWaktu,
  StatusSOP,
} from '../../../generated/prisma';
import { UserOpdAccessService } from '../../core/opd/user-opd-access.service';
import { SopCatalogService } from '../catalog/sop-catalog.service';
import type { PenyusunWorkbenchDataDto } from '../catalog/dto/penyusun-workbench-data.dto';
import { SopProsedurRepository } from './sop-prosedur.repository';
import { SopProsedurService } from './sop-prosedur.service';

describe('SopProsedurService', () => {
  let service: SopProsedurService;

  const repoMock: jest.Mocked<
    Pick<
      SopProsedurRepository,
      | 'findDetailIdByDetailOrSopId'
      | 'findOpdIdByPenggunaId'
      | 'findPelaksanaIdsByOpd'
      | 'findExistingSwimlanePelaksanaIds'
      | 'findDetailStatus'
      | 'updateProsedurTransaction'
    >
  > = {
    findDetailIdByDetailOrSopId: jest.fn(),
    findOpdIdByPenggunaId: jest.fn(),
    findPelaksanaIdsByOpd: jest.fn(),
    findExistingSwimlanePelaksanaIds: jest.fn(),
    findDetailStatus: jest.fn(),
    updateProsedurTransaction: jest.fn(),
  };

  const catalogMock = {
    getPenyusunWorkbench: jest.fn(),
  };
  const userOpdAccessMock = {
    assertSameOpd: jest.fn().mockResolvedValue(undefined),
  };

  const makeUser = (peran: PeranPengguna, sub = 'user-1'): JwtAccessPayload =>
    ({ sub, email: 'a@b.c', peran }) as JwtAccessPayload;

  const fakeWorkbench = {
    detail: { id: 'det-1' },
  } as unknown as PenyusunWorkbenchDataDto;

  beforeEach(async () => {
    jest.resetAllMocks();
    repoMock.findDetailStatus.mockResolvedValue(StatusSOP.SEDANG_DISUSUN);
    catalogMock.getPenyusunWorkbench.mockResolvedValue(fakeWorkbench);
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        SopProsedurService,
        { provide: SopProsedurRepository, useValue: repoMock as unknown as SopProsedurRepository },
        { provide: SopCatalogService, useValue: catalogMock as unknown as SopCatalogService },
        { provide: UserOpdAccessService, useValue: userOpdAccessMock },
      ],
    }).compile();
    service = moduleRef.get(SopProsedurService);
  });

  describe('updateProsedur', () => {
    it('should_throw_not_found_when_id_unresolvable', async () => {
      repoMock.findDetailIdByDetailOrSopId.mockResolvedValueOnce(null);
      await expect(
        service.updateProsedur(makeUser(PeranPengguna.PENYUSUN), 'unknown', {}),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should_throw_forbidden_when_role_not_penyusun', async () => {
      repoMock.findDetailIdByDetailOrSopId.mockResolvedValueOnce({
        detailSopId: 'det-1',
        sopOpdId: 'opd-1',
      });
      await expect(
        service.updateProsedur(makeUser(PeranPengguna.EVALUATOR), 'det-1', {}),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should_throw_forbidden_when_penyusun_opd_mismatch', async () => {
      repoMock.findDetailIdByDetailOrSopId.mockResolvedValueOnce({
        detailSopId: 'det-1',
        sopOpdId: 'opd-1',
      });
      userOpdAccessMock.assertSameOpd.mockRejectedValueOnce(
        new ForbiddenException('Akses ditolak untuk DetailSOP ini'),
      );
      await expect(
        service.updateProsedur(makeUser(PeranPengguna.PENYUSUN), 'det-1', {}),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should_return_workbench_without_calling_repo_when_dto_empty', async () => {
      repoMock.findDetailIdByDetailOrSopId.mockResolvedValueOnce({
        detailSopId: 'det-1',
        sopOpdId: 'opd-1',
      });
      repoMock.findOpdIdByPenggunaId.mockResolvedValueOnce('opd-1');
      const out = await service.updateProsedur(
        makeUser(PeranPengguna.PENYUSUN),
        'det-1',
        {},
      );
      expect(repoMock.updateProsedurTransaction).not.toHaveBeenCalled();
      expect(out).toBe(fakeWorkbench);
    });

    it('should_throw_conflict_when_detail_berlaku', async () => {
      repoMock.findDetailIdByDetailOrSopId.mockResolvedValueOnce({
        detailSopId: 'det-1',
        sopOpdId: 'opd-1',
      });
      repoMock.findOpdIdByPenggunaId.mockResolvedValueOnce('opd-1');
      repoMock.findDetailStatus.mockResolvedValueOnce(StatusSOP.BERLAKU);
      await expect(
        service.updateProsedur(makeUser(PeranPengguna.PENYUSUN), 'det-1', {
          pelaksana: [{ pelaksanaId: 'p-1' }],
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(repoMock.updateProsedurTransaction).not.toHaveBeenCalled();
    });

    it('should_throw_bad_request_when_pelaksana_duplicate_in_dto', async () => {
      repoMock.findDetailIdByDetailOrSopId.mockResolvedValueOnce({
        detailSopId: 'det-1',
        sopOpdId: 'opd-1',
      });
      repoMock.findOpdIdByPenggunaId.mockResolvedValueOnce('opd-1');
      await expect(
        service.updateProsedur(makeUser(PeranPengguna.PENYUSUN), 'det-1', {
          pelaksana: [{ pelaksanaId: 'p-1' }, { pelaksanaId: 'p-1' }],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should_throw_bad_request_when_pelaksana_not_in_opd', async () => {
      repoMock.findDetailIdByDetailOrSopId.mockResolvedValueOnce({
        detailSopId: 'det-1',
        sopOpdId: 'opd-1',
      });
      repoMock.findOpdIdByPenggunaId.mockResolvedValueOnce('opd-1');
      repoMock.findPelaksanaIdsByOpd.mockResolvedValueOnce(new Set<string>());
      await expect(
        service.updateProsedur(makeUser(PeranPengguna.PENYUSUN), 'det-1', {
          pelaksana: [{ pelaksanaId: 'p-1' }],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should_throw_bad_request_when_tempId_duplicate', async () => {
      repoMock.findDetailIdByDetailOrSopId.mockResolvedValueOnce({
        detailSopId: 'det-1',
        sopOpdId: 'opd-1',
      });
      repoMock.findOpdIdByPenggunaId.mockResolvedValueOnce('opd-1');
      repoMock.findExistingSwimlanePelaksanaIds.mockResolvedValueOnce(['p-1']);
      const baseLangkah = {
        jenis: JenisLangkahProsedur.KEGIATAN,
        kegiatan: 'a',
        pelaksanaId: 'p-1',
      };
      await expect(
        service.updateProsedur(makeUser(PeranPengguna.PENYUSUN), 'det-1', {
          langkah: [
            { tempId: 't-1', ...baseLangkah },
            { tempId: 't-1', ...baseLangkah },
          ],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should_throw_bad_request_when_branch_refs_unknown_tempId', async () => {
      repoMock.findDetailIdByDetailOrSopId.mockResolvedValueOnce({
        detailSopId: 'det-1',
        sopOpdId: 'opd-1',
      });
      repoMock.findOpdIdByPenggunaId.mockResolvedValueOnce('opd-1');
      repoMock.findExistingSwimlanePelaksanaIds.mockResolvedValueOnce(['p-1']);
      await expect(
        service.updateProsedur(makeUser(PeranPengguna.PENYUSUN), 'det-1', {
          langkah: [
            {
              tempId: 't-1',
              jenis: JenisLangkahProsedur.KEPUTUSAN,
              kegiatan: 'cabang',
              pelaksanaId: 'p-1',
              langkahSelanjutnyaYaTempId: 'NOPE',
            },
          ],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should_throw_bad_request_when_langkah_pelaksana_not_in_swimlane_payload', async () => {
      repoMock.findDetailIdByDetailOrSopId.mockResolvedValueOnce({
        detailSopId: 'det-1',
        sopOpdId: 'opd-1',
      });
      repoMock.findOpdIdByPenggunaId.mockResolvedValueOnce('opd-1');
      repoMock.findPelaksanaIdsByOpd.mockResolvedValueOnce(new Set(['p-1']));
      await expect(
        service.updateProsedur(makeUser(PeranPengguna.PENYUSUN), 'det-1', {
          pelaksana: [{ pelaksanaId: 'p-1' }],
          langkah: [
            {
              tempId: 't-1',
              jenis: JenisLangkahProsedur.KEGIATAN,
              kegiatan: 'pakai p-2',
              pelaksanaId: 'p-2',
            },
          ],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should_call_repo_with_changedFields_pelaksana_only', async () => {
      repoMock.findDetailIdByDetailOrSopId.mockResolvedValueOnce({
        detailSopId: 'det-1',
        sopOpdId: 'opd-1',
      });
      repoMock.findOpdIdByPenggunaId.mockResolvedValueOnce('opd-1');
      repoMock.findPelaksanaIdsByOpd.mockResolvedValueOnce(new Set(['p-1']));
      const user = makeUser(PeranPengguna.PENYUSUN);
      await service.updateProsedur(user, 'det-1', {
        pelaksana: [{ pelaksanaId: 'p-1' }],
      });
      expect(repoMock.updateProsedurTransaction).toHaveBeenCalledTimes(1);
      const args = repoMock.updateProsedurTransaction.mock.calls[0][0];
      expect(args.detailSopId).toBe('det-1');
      expect(args.userId).toBe(user.sub);
      expect(args.changedFields).toEqual(['pelaksana']);
      expect(args.input.pelaksana).toEqual([{ pelaksanaId: 'p-1' }]);
      expect(args.input.langkah).toBeUndefined();
    });

    it('should_call_repo_with_changedFields_langkah_only_validating_against_existing_swimlane', async () => {
      repoMock.findDetailIdByDetailOrSopId.mockResolvedValueOnce({
        detailSopId: 'det-1',
        sopOpdId: 'opd-1',
      });
      repoMock.findOpdIdByPenggunaId.mockResolvedValueOnce('opd-1');
      repoMock.findExistingSwimlanePelaksanaIds.mockResolvedValueOnce(['p-9']);
      await service.updateProsedur(makeUser(PeranPengguna.PENYUSUN), 'det-1', {
        langkah: [
          {
            tempId: 't-1',
            jenis: JenisLangkahProsedur.KEGIATAN,
            kegiatan: 'a',
            pelaksanaId: 'p-9',
          },
        ],
      });
      const args = repoMock.updateProsedurTransaction.mock.calls[0][0];
      expect(args.changedFields).toEqual(['langkah']);
      expect(args.input.langkah).toHaveLength(1);
      expect(args.input.langkah?.[0].pelaksanaId).toBe('p-9');
    });

    it('should_call_repo_with_both_changedFields_and_relink_branches', async () => {
      repoMock.findDetailIdByDetailOrSopId.mockResolvedValueOnce({
        detailSopId: 'det-1',
        sopOpdId: 'opd-1',
      });
      repoMock.findOpdIdByPenggunaId.mockResolvedValueOnce('opd-1');
      repoMock.findPelaksanaIdsByOpd.mockResolvedValueOnce(new Set(['p-1']));
      await service.updateProsedur(makeUser(PeranPengguna.PENYUSUN), 'det-1', {
        pelaksana: [{ pelaksanaId: 'p-1' }],
        langkah: [
          {
            tempId: 't-1',
            jenis: JenisLangkahProsedur.KEPUTUSAN,
            kegiatan: 'cek',
            pelaksanaId: 'p-1',
            langkahSelanjutnyaYaTempId: 't-2',
          },
          {
            tempId: 't-2',
            jenis: JenisLangkahProsedur.KEGIATAN,
            kegiatan: 'lanjut',
            pelaksanaId: 'p-1',
            satuanWaktu: SatuanWaktu.h,
            waktu: 1,
          },
        ],
      });
      const args = repoMock.updateProsedurTransaction.mock.calls[0][0];
      expect(args.changedFields).toEqual(['pelaksana', 'langkah']);
      expect(args.input.langkah?.[0].langkahSelanjutnyaYaTempId).toBe('t-2');
      expect(args.input.langkah?.[1].langkahSelanjutnyaYaTempId).toBeNull();
    });
  });
});
