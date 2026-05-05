import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { JwtAccessPayload } from '../../../common';
import { PeranPengguna, StatusKomentar } from '../../../generated/prisma';
import type { KomentarWithUser } from './sop-comment.repository';
import { SopCommentRepository } from './sop-comment.repository';
import { SopCommentService } from './sop-comment.service';

describe('SopCommentService', () => {
  let service: SopCommentService;
  const repoMock: jest.Mocked<
    Pick<
      SopCommentRepository,
      | 'findDetailIdByDetailOrSopId'
      | 'findKomentarById'
      | 'listByDetail'
      | 'resolveKomentarWithLog'
      | 'deleteKomentarWithLog'
      | 'findOpdIdByPenggunaId'
    >
  > = {
    findDetailIdByDetailOrSopId: jest.fn(),
    findKomentarById: jest.fn(),
    listByDetail: jest.fn(),
    resolveKomentarWithLog: jest.fn(),
    deleteKomentarWithLog: jest.fn(),
    findOpdIdByPenggunaId: jest.fn(),
  };

  const makeUser = (peran: PeranPengguna, sub = 'user-1'): JwtAccessPayload => ({
    sub,
    email: 'a@b.c',
    peran,
  });

  const t = new Date('2026-05-04T10:00:00.000Z');

  const fakeKomentar = (override?: Partial<KomentarWithUser>): KomentarWithUser =>
    ({
      komentarId: 'kom-1',
      detailSopId: 'det-1',
      userId: 'evaluator-1',
      isi: 'isi komentar',
      status: StatusKomentar.TERBUKA,
      createdAt: t,
      updatedAt: t,
      user: {
        penggunaId: 'evaluator-1',
        nama: 'Eva',
        email: 'eva@x',
        peran: PeranPengguna.EVALUATOR,
      },
      ...override,
    }) as KomentarWithUser;

  beforeEach(async () => {
    jest.resetAllMocks();
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        SopCommentService,
        { provide: SopCommentRepository, useValue: repoMock as unknown as SopCommentRepository },
      ],
    }).compile();
    service = moduleRef.get(SopCommentService);
  });

  describe('listForDetailSop', () => {
    it('should_throw_not_found_when_id_unresolvable', async () => {
      repoMock.findDetailIdByDetailOrSopId.mockResolvedValueOnce(null);
      await expect(
        service.listForDetailSop(makeUser(PeranPengguna.PENYUSUN), 'unknown'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should_throw_forbidden_when_role_not_in_allowlist', async () => {
      repoMock.findDetailIdByDetailOrSopId.mockResolvedValueOnce({
        detailSopId: 'det-1',
        sopOpdId: 'opd-1',
      });
      const user = makeUser('SUPER_ADMIN' as unknown as PeranPengguna);
      await expect(service.listForDetailSop(user, 'det-1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('should_throw_forbidden_when_penyusun_opd_mismatch', async () => {
      repoMock.findDetailIdByDetailOrSopId.mockResolvedValueOnce({
        detailSopId: 'det-1',
        sopOpdId: 'opd-1',
      });
      repoMock.findOpdIdByPenggunaId.mockResolvedValueOnce('opd-2');
      await expect(
        service.listForDetailSop(makeUser(PeranPengguna.PENYUSUN), 'det-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should_return_mapped_list_when_penyusun_opd_matches', async () => {
      repoMock.findDetailIdByDetailOrSopId.mockResolvedValueOnce({
        detailSopId: 'det-1',
        sopOpdId: 'opd-1',
      });
      repoMock.findOpdIdByPenggunaId.mockResolvedValueOnce('opd-1');
      repoMock.listByDetail.mockResolvedValueOnce([fakeKomentar()]);
      const result = await service.listForDetailSop(makeUser(PeranPengguna.PENYUSUN), 'det-1');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'kom-1',
        sopDetailId: 'det-1',
        status: StatusKomentar.TERBUKA,
      });
    });

    it('should_bypass_opd_check_for_evaluator', async () => {
      repoMock.findDetailIdByDetailOrSopId.mockResolvedValueOnce({
        detailSopId: 'det-1',
        sopOpdId: 'opd-x',
      });
      repoMock.listByDetail.mockResolvedValueOnce([]);
      await service.listForDetailSop(makeUser(PeranPengguna.EVALUATOR), 'det-1');
      expect(repoMock.findOpdIdByPenggunaId).not.toHaveBeenCalled();
    });
  });

  describe('resolveKomentar', () => {
    it('should_throw_not_found_when_komentar_missing', async () => {
      repoMock.findKomentarById.mockResolvedValueOnce(null);
      await expect(
        service.resolveKomentar(makeUser(PeranPengguna.PENYUSUN), 'kom-x'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should_throw_conflict_when_already_selesai', async () => {
      repoMock.findKomentarById.mockResolvedValueOnce({
        ...fakeKomentar({ status: StatusKomentar.SELESAI }),
        detailSop: { sop: { opdId: 'opd-1' } },
      } as never);
      await expect(
        service.resolveKomentar(makeUser(PeranPengguna.PENYUSUN), 'kom-1'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('should_throw_forbidden_when_role_not_penyusun', async () => {
      repoMock.findKomentarById.mockResolvedValueOnce({
        ...fakeKomentar(),
        detailSop: { sop: { opdId: 'opd-1' } },
      } as never);
      await expect(
        service.resolveKomentar(makeUser(PeranPengguna.EVALUATOR), 'kom-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should_throw_forbidden_when_opd_mismatch', async () => {
      repoMock.findKomentarById.mockResolvedValueOnce({
        ...fakeKomentar(),
        detailSop: { sop: { opdId: 'opd-1' } },
      } as never);
      repoMock.findOpdIdByPenggunaId.mockResolvedValueOnce('opd-2');
      await expect(
        service.resolveKomentar(makeUser(PeranPengguna.PENYUSUN), 'kom-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should_resolve_and_return_response_when_penyusun_owner', async () => {
      repoMock.findKomentarById.mockResolvedValueOnce({
        ...fakeKomentar(),
        detailSop: { sop: { opdId: 'opd-1' } },
      } as never);
      repoMock.findOpdIdByPenggunaId.mockResolvedValueOnce('opd-1');
      repoMock.resolveKomentarWithLog.mockResolvedValueOnce(
        fakeKomentar({ status: StatusKomentar.SELESAI }),
      );
      const result = await service.resolveKomentar(
        makeUser(PeranPengguna.PENYUSUN, 'pen-1'),
        'kom-1',
      );
      expect(repoMock.resolveKomentarWithLog).toHaveBeenCalledWith({
        komentarId: 'kom-1',
        detailSopId: 'det-1',
        actorUserId: 'pen-1',
      });
      expect(result.status).toBe(StatusKomentar.SELESAI);
    });
  });

  describe('deleteKomentar', () => {
    it('should_throw_forbidden_when_role_not_evaluator', async () => {
      repoMock.findKomentarById.mockResolvedValueOnce({
        ...fakeKomentar(),
        detailSop: { sop: { opdId: 'opd-1' } },
      } as never);
      await expect(
        service.deleteKomentar(makeUser(PeranPengguna.PENYUSUN), 'kom-1'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should_throw_forbidden_when_evaluator_not_author', async () => {
      repoMock.findKomentarById.mockResolvedValueOnce({
        ...fakeKomentar({ userId: 'evaluator-2' }),
        detailSop: { sop: { opdId: 'opd-1' } },
      } as never);
      await expect(
        service.deleteKomentar(
          makeUser(PeranPengguna.EVALUATOR, 'evaluator-1'),
          'kom-1',
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should_call_repo_when_evaluator_is_author', async () => {
      repoMock.findKomentarById.mockResolvedValueOnce({
        ...fakeKomentar({ userId: 'evaluator-1' }),
        detailSop: { sop: { opdId: 'opd-1' } },
      } as never);
      await service.deleteKomentar(
        makeUser(PeranPengguna.EVALUATOR, 'evaluator-1'),
        'kom-1',
      );
      expect(repoMock.deleteKomentarWithLog).toHaveBeenCalledWith({
        komentarId: 'kom-1',
        detailSopId: 'det-1',
        actorUserId: 'evaluator-1',
      });
    });
  });
});
