import {
  BagianSOP,
  JenisLangkahProsedur,
  SatuanWaktu,
} from '../../../generated/prisma';
import type { PrismaService } from '../../../common/prisma/prisma.service';
import { SopProsedurRepository } from './sop-prosedur.repository';

interface CallLog {
  table: string;
  op: string;
  args: unknown;
}

function makeTx(existingLangkahIds: string[]): {
  tx: any;
  calls: CallLog[];
} {
  const calls: CallLog[] = [];
  const record = (table: string, op: string) =>
    jest.fn(async (args: unknown) => {
      calls.push({ table, op, args });
      if (table === 'langkahSOP' && op === 'findMany') {
        return existingLangkahIds.map((id) => ({ langkahSopId: id }));
      }
      if (table === 'langkahSOP' && op === 'create') {
        const data = (args as { data: { langkahSopId: string } }).data;
        return { langkahSopId: data.langkahSopId };
      }
      if (table === 'logEditSOP' && op === 'findFirst') {
        return null;
      }
      return { count: 0 };
    });

  const tx = {
    detailSOPPelaksana: { deleteMany: record('detailSOPPelaksana', 'deleteMany'), createMany: record('detailSOPPelaksana', 'createMany') },
    titikSisiDiagram: { deleteMany: record('titikSisiDiagram', 'deleteMany') },
    sisiDiagram: { deleteMany: record('sisiDiagram', 'deleteMany') },
    posisiNodeDiagram: { deleteMany: record('posisiNodeDiagram', 'deleteMany') },
    langkahSOP: {
      findMany: record('langkahSOP', 'findMany'),
      updateMany: record('langkahSOP', 'updateMany'),
      deleteMany: record('langkahSOP', 'deleteMany'),
      create: record('langkahSOP', 'create'),
      update: record('langkahSOP', 'update'),
    },
    detailSOP: { update: record('detailSOP', 'update') },
    logEditSOP: {
      findFirst: record('logEditSOP', 'findFirst'),
      create: record('logEditSOP', 'create'),
      update: record('logEditSOP', 'update'),
      updateMany: record('logEditSOP', 'updateMany'),
    },
  };
  return { tx, calls };
}

describe('SopProsedurRepository.updateProsedurTransaction', () => {
  function makeRepo(existingLangkahIds: string[]): {
    repo: SopProsedurRepository;
    calls: CallLog[];
  } {
    const { tx, calls } = makeTx(existingLangkahIds);
    const prismaMock = {
      $transaction: jest.fn(async (cb: (tx: unknown) => Promise<void>) => cb(tx)),
    } as unknown as PrismaService;
    const repo = new SopProsedurRepository(prismaMock);
    return { repo, calls };
  }

  it('should_replace_pelaksana_only_when_only_pelaksana_provided', async () => {
    const { repo, calls } = makeRepo([]);
    await repo.updateProsedurTransaction({
      detailSopId: 'det-1',
      userId: 'u-1',
      input: { pelaksana: [{ pelaksanaId: 'p-1' }, { pelaksanaId: 'p-2' }] },
      changedFields: ['pelaksana'],
    });
    const swimlaneOps = calls.filter((c) => c.table === 'detailSOPPelaksana');
    expect(swimlaneOps.map((c) => c.op)).toEqual(['deleteMany', 'createMany']);
    expect(calls.some((c) => c.table === 'langkahSOP' && c.op === 'deleteMany')).toBe(false);
    expect(calls.some((c) => c.table === 'detailSOP' && c.op === 'update')).toBe(true);
    expect(calls.some((c) => c.table === 'logEditSOP')).toBe(true);
  });

  it('should_clear_diagram_refs_then_break_self_fk_then_delete_then_insert_then_relink', async () => {
    const { repo, calls } = makeRepo(['L-1', 'L-2']);
    await repo.updateProsedurTransaction({
      detailSopId: 'det-1',
      userId: 'u-1',
      input: {
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
        defaultPelaksanaId: 'p-1',
      },
      changedFields: ['langkah'],
    });

    const opsOrder = calls
      .filter((c) =>
        [
          'titikSisiDiagram',
          'sisiDiagram',
          'posisiNodeDiagram',
          'langkahSOP',
          'detailSOP',
          'logEditSOP',
        ].includes(c.table),
      )
      .map((c) => `${c.table}.${c.op}`);

    const idxFindMany = opsOrder.indexOf('langkahSOP.findMany');
    const idxTitikDelete = opsOrder.indexOf('titikSisiDiagram.deleteMany');
    const idxSisiDelete = opsOrder.indexOf('sisiDiagram.deleteMany');
    const idxPosisiDelete = opsOrder.indexOf('posisiNodeDiagram.deleteMany');
    const idxUpdateMany = opsOrder.indexOf('langkahSOP.updateMany');
    const idxLangkahDelete = opsOrder.indexOf('langkahSOP.deleteMany');
    const idxFirstCreate = opsOrder.indexOf('langkahSOP.create');
    const idxBranchUpdate = opsOrder.indexOf('langkahSOP.update');
    const idxDetailUpdate = opsOrder.indexOf('detailSOP.update');
    const idxLogCreate = opsOrder.lastIndexOf('logEditSOP.create');

    expect(idxFindMany).toBeGreaterThanOrEqual(0);
    expect(idxTitikDelete).toBeGreaterThan(idxFindMany);
    expect(idxSisiDelete).toBeGreaterThan(idxTitikDelete);
    expect(idxPosisiDelete).toBeGreaterThan(idxSisiDelete);
    expect(idxUpdateMany).toBeGreaterThan(idxPosisiDelete);
    expect(idxLangkahDelete).toBeGreaterThan(idxUpdateMany);
    expect(idxFirstCreate).toBeGreaterThan(idxLangkahDelete);
    expect(idxBranchUpdate).toBeGreaterThan(idxFirstCreate);
    expect(idxDetailUpdate).toBeGreaterThan(idxBranchUpdate);
    expect(idxLogCreate).toBeGreaterThan(idxDetailUpdate);

    /* Branch update hanya untuk langkah yang punya cabang. */
    const branchUpdates = calls.filter(
      (c) => c.table === 'langkahSOP' && c.op === 'update',
    );
    expect(branchUpdates).toHaveLength(1);
  });

  it('should_skip_diagram_cleanup_when_no_existing_langkah', async () => {
    const { repo, calls } = makeRepo([]);
    await repo.updateProsedurTransaction({
      detailSopId: 'det-1',
      userId: 'u-1',
      input: {
        langkah: [
          {
            tempId: 't-1',
            jenis: JenisLangkahProsedur.KEGIATAN,
            kegiatan: 'baru',
            pelaksanaId: 'p-1',
          },
        ],
        defaultPelaksanaId: 'p-1',
      },
      changedFields: ['langkah'],
    });
    expect(calls.some((c) => c.table === 'titikSisiDiagram')).toBe(false);
    expect(calls.some((c) => c.table === 'sisiDiagram')).toBe(false);
    expect(calls.some((c) => c.table === 'posisiNodeDiagram')).toBe(false);
    expect(calls.some((c) => c.table === 'langkahSOP' && c.op === 'create')).toBe(true);
  });

  it('should_call_log_helper_with_bagian_LANGKAH_and_changed_fields', async () => {
    const { repo, calls } = makeRepo([]);
    await repo.updateProsedurTransaction({
      detailSopId: 'det-1',
      userId: 'u-1',
      input: { pelaksana: [] },
      changedFields: ['pelaksana'],
    });
    const logCreate = calls.find((c) => c.table === 'logEditSOP' && c.op === 'create');
    expect(logCreate).toBeDefined();
    const data = (logCreate!.args as { data: { bagian: BagianSOP; meta: unknown } }).data;
    expect(data.bagian).toBe(BagianSOP.LANGKAH);
    expect(data.meta).toMatchObject({ fields: ['pelaksana'], count: 1 });
  });
});
