import { BagianSOP, StatusSOP } from '../../../generated/prisma';
import type { PrismaService } from '../../../common/prisma/prisma.service';
import { SopCatalogRepository } from './sop-catalog.repository';

interface CallLog {
  table: string;
  op: string;
  args: unknown;
}

function makeStatusTx(): { tx: Record<string, unknown>; calls: CallLog[] } {
  const calls: CallLog[] = [];
  const record = (table: string, op: string) =>
    jest.fn(async (args: unknown) => {
      calls.push({ table, op, args });
      if (table === 'logEditSOP' && op === 'findFirst') {
        return null;
      }
      return { count: 0 };
    });
  const tx = {
    detailSOP: { update: record('detailSOP', 'update') },
    logEditSOP: {
      findFirst: record('logEditSOP', 'findFirst'),
      create: record('logEditSOP', 'create'),
      update: record('logEditSOP', 'update'),
      updateMany: record('logEditSOP', 'updateMany'),
    },
    logEditSopDomainField: {
      deleteMany: record('logEditSopDomainField', 'deleteMany'),
      createMany: record('logEditSopDomainField', 'createMany'),
    },
  };
  return { tx, calls };
}

describe('SopCatalogRepository status logging', () => {
  function makeRepo(): { repo: SopCatalogRepository; calls: CallLog[] } {
    const { tx, calls } = makeStatusTx();
    const prismaMock = {
      $transaction: jest.fn(async (cb: (inner: unknown) => Promise<void>) => cb(tx)),
    } as unknown as PrismaService;
    return { repo: new SopCatalogRepository(prismaMock), calls };
  }

  it('should_write_discrete_status_log_when_updateDetailSopStatus', async () => {
    const { repo, calls } = makeRepo();
    await repo.updateDetailSopStatus({
      detailSopId: 'det-1',
      status: StatusSOP.SIAP_DIEVALUASI,
      userId: 'u-1',
    });
    expect(calls.some((c) => c.table === 'detailSOP' && c.op === 'update')).toBe(true);
    const logCreate = calls.find((c) => c.table === 'logEditSOP' && c.op === 'create');
    expect(logCreate).toBeDefined();
    const data = (logCreate!.args as { data: { bagian: BagianSOP; discrete?: boolean } }).data;
    expect(data.bagian).toBe(BagianSOP.STATUS);
    expect(
      (logCreate!.args as { data: { domainFields: { create: Array<{ domainField: string }> } } }).data
        .domainFields.create,
    ).toEqual(expect.arrayContaining([{ domainField: 'status' }]));
  });

  it('should_write_two_discrete_status_logs_on_revisi_to_diajukan_evaluasi', async () => {
    const { repo, calls } = makeRepo();
    await repo.transitionDetailSopRevisiToDiajukanEvaluasi({
      detailSopId: 'det-revisi',
      userId: 'u-penyusun',
    });
    const detailUpdates = calls.filter((c) => c.table === 'detailSOP' && c.op === 'update');
    expect(detailUpdates).toHaveLength(2);
    const logCreates = calls.filter((c) => c.table === 'logEditSOP' && c.op === 'create');
    expect(logCreates).toHaveLength(2);
    for (const entry of logCreates) {
      const data = (entry.args as { data: { bagian: BagianSOP } }).data;
      expect(data.bagian).toBe(BagianSOP.STATUS);
    }
  });
});
