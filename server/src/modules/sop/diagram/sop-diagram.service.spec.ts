import { BadRequestException, NotFoundException } from '@nestjs/common';
import { JenisDiagram, PeranPengguna } from '../../../generated/prisma';
import { SopDiagramService } from './sop-diagram.service';

describe('SopDiagramService', () => {
  const user = {
    sub: 'user-1',
    peran: PeranPengguna.PENYUSUN,
    email: 'a@b.c',
  } as never;

  function createService(overrides?: {
    resolved?: { detailSopId: string; sopOpdId: string } | null;
    status?: string | null;
  }) {
    const defaultResolved = { detailSopId: 'det-1', sopOpdId: 'opd-1' };
    const resolved =
      overrides !== undefined && 'resolved' in overrides
        ? overrides.resolved
        : defaultResolved;
    const sopDiagramRepository = {
      findDetailIdByDetailOrSopId: jest.fn().mockResolvedValue(resolved),
      findDetailStatus: jest.fn().mockResolvedValue(
        overrides !== undefined && 'status' in overrides ? overrides.status : 'DRAFT',
      ),
      upsertConfig: jest.fn().mockResolvedValue({}),
    };
    const sopCatalogService = {
      getPenyusunWorkbench: jest.fn().mockResolvedValue({ detail: { id: 'det-1' }, langkah: [], logEdit: [] }),
    };
    const userOpdAccessService = {
      assertSameOpd: jest.fn().mockResolvedValue(undefined),
    };
    const service = new SopDiagramService(
      sopDiagramRepository as never,
      sopCatalogService as never,
      userOpdAccessService as never,
    );
    return { service, sopDiagramRepository, sopCatalogService };
  }

  it('should_throw_not_found_when_detail_missing', async () => {
    const { service } = createService({ resolved: null });
    await expect(
      service.updateDiagram(user, 'missing', { jenis: JenisDiagram.FLOWCHART, layoutSeed: 1 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should_upsert_config_and_return_workbench', async () => {
    const { service, sopDiagramRepository, sopCatalogService } = createService();
    const actual = await service.updateDiagram(user, 'det-1', {
      jenis: JenisDiagram.FLOWCHART,
      layoutSeed: 2,
      pathOverrides: { edges: {} },
    });
    expect(sopDiagramRepository.upsertConfig).toHaveBeenCalled();
    expect(sopCatalogService.getPenyusunWorkbench).toHaveBeenCalled();
    expect(actual.detail.id).toBe('det-1');
  });

  it('should_reject_invalid_path_overrides', async () => {
    const { service } = createService();
    await expect(
      service.updateDiagram(user, 'det-1', {
        jenis: JenisDiagram.BPMN,
        pathOverrides: { edges: { bad: { sSide: 'invalid' } as never } },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
