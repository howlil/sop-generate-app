import { BagianSOP } from '../../../generated/prisma';
import {
  appendOrCreateLogSession,
  buildLogSummary,
  DEFAULT_LOG_SESSION_IDLE_MS,
  translateField,
  type LogEditSessionMeta,
} from './log-edit-session.helper';

interface FakeDomainRow {
  detailSopId: string;
  penggunaId: string;
  logCreatedAt: Date;
  domainField: string;
}

interface FakeLogRow {
  detailSopId: string;
  penggunaId: string;
  createdAt: Date;
  bagian: BagianSOP;
  targetEntityId: string | null;
  keterangan: string | null;
  sesiChangeCount: number;
  closedAt: Date | null;
  updatedAt: Date;
  domainFields: FakeDomainRow[];
}

interface CapturedTx {
  rows: FakeLogRow[];
  domainRows: FakeDomainRow[];
  findFirst: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  updateMany: jest.Mock;
  domainDeleteMany: jest.Mock;
  domainCreateMany: jest.Mock;
  setClock: (now: Date) => void;
}

function makeTx(): {
  tx: { logEditSOP: CapturedTx; logEditSopDomainField: Pick<CapturedTx, 'domainDeleteMany' | 'domainCreateMany'> };
  capture: CapturedTx;
} {
  const rows: FakeLogRow[] = [];
  const domainRows: FakeDomainRow[] = [];
  let clock: Date = new Date();
  const capture: CapturedTx = {
    rows,
    domainRows,
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    domainDeleteMany: jest.fn(),
    domainCreateMany: jest.fn(),
    setClock: (next) => {
      clock = next;
    },
  };

  capture.findFirst.mockImplementation(async (args: { where: Record<string, unknown>; include?: unknown }) => {
    const w = args.where;
    const cutoff = (w.updatedAt as { gt: Date } | undefined)?.gt;
    const candidates = rows.filter(
      (r) =>
        r.detailSopId === w.detailSopId &&
        r.penggunaId === w.penggunaId &&
        r.bagian === w.bagian &&
        r.targetEntityId === (w.targetEntityId as string | null) &&
        r.closedAt === null &&
        (cutoff === undefined || r.updatedAt > cutoff),
    );
    candidates.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    const hit = candidates[0] ?? null;
    if (hit === null) {
      return null;
    }
    if (args.include !== undefined && typeof args.include === 'object' && 'domainFields' in (args.include as object)) {
      return {
        ...hit,
        domainFields: hit.domainFields.map((df) => ({ domainField: df.domainField })),
      };
    }
    return hit;
  });

  capture.create.mockImplementation(async (args: { data: Record<string, unknown> }) => {
    const d = args.data;
    const createdAt = d.createdAt as Date;
    const detailSopId = d.detailSopId as string;
    const penggunaId = d.penggunaId as string;
    const nested = d.domainFields as { create: { domainField: string }[] } | undefined;
    const creates = nested?.create ?? [];
    const domainFields: FakeDomainRow[] = creates.map((c) => ({
      detailSopId,
      penggunaId,
      logCreatedAt: createdAt,
      domainField: c.domainField,
    }));
    domainRows.push(...domainFields);
    const row: FakeLogRow = {
      detailSopId,
      penggunaId,
      createdAt,
      bagian: d.bagian as BagianSOP,
      targetEntityId: (d.targetEntityId as string | null | undefined) ?? null,
      keterangan: (d.keterangan as string | null | undefined) ?? null,
      sesiChangeCount: (d.sesiChangeCount as number | undefined) ?? 1,
      closedAt: (d.closedAt as Date | null | undefined) ?? null,
      updatedAt: clock,
      domainFields,
    };
    rows.push(row);
    return row;
  });

  capture.update.mockImplementation(
    async (args: {
      where: { detailSopId_penggunaId_createdAt: { detailSopId: string; penggunaId: string; createdAt: Date } };
      data: Record<string, unknown>;
    }) => {
      const k = args.where.detailSopId_penggunaId_createdAt;
      const idx = rows.findIndex(
        (r) =>
          r.detailSopId === k.detailSopId &&
          r.penggunaId === k.penggunaId &&
          r.createdAt.getTime() === k.createdAt.getTime(),
      );
      if (idx === -1) {
        throw new Error('row not found');
      }
      const target = rows[idx]!;
      const updated: FakeLogRow = {
        ...target,
        sesiChangeCount:
          'sesiChangeCount' in args.data ? (args.data.sesiChangeCount as number) : target.sesiChangeCount,
        keterangan:
          'keterangan' in args.data ? (args.data.keterangan as string | null) : target.keterangan,
        closedAt: 'closedAt' in args.data ? (args.data.closedAt as Date | null) : target.closedAt,
        updatedAt: clock,
        domainFields: target.domainFields,
      };
      rows[idx] = updated;
      return updated;
    },
  );

  capture.updateMany.mockImplementation(
    async (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
      const w = args.where;
      let count = 0;
      for (let i = 0; i < rows.length; i += 1) {
        const r = rows[i]!;
        if (
          r.detailSopId === w.detailSopId &&
          r.penggunaId === w.penggunaId &&
          r.bagian === w.bagian &&
          r.targetEntityId === (w.targetEntityId as string | null) &&
          (w.closedAt === null ? r.closedAt === null : true)
        ) {
          rows[i] = {
            ...r,
            closedAt: (args.data.closedAt as Date | null) ?? r.closedAt,
            updatedAt: clock,
          };
          count += 1;
        }
      }
      return { count };
    },
  );

  capture.domainDeleteMany.mockImplementation(async (args: { where: Record<string, unknown> }) => {
    const w = args.where;
    let n = 0;
    for (let i = domainRows.length - 1; i >= 0; i -= 1) {
      const d = domainRows[i]!;
      if (
        d.detailSopId === w.detailSopId &&
        d.penggunaId === w.penggunaId &&
        d.logCreatedAt.getTime() === (w.logCreatedAt as Date).getTime()
      ) {
        domainRows.splice(i, 1);
        n += 1;
      }
    }
    for (const r of rows) {
      if (
        r.detailSopId === w.detailSopId &&
        r.penggunaId === w.penggunaId &&
        r.createdAt.getTime() === (w.logCreatedAt as Date).getTime()
      ) {
        r.domainFields = [];
      }
    }
    return { count: n };
  });

  capture.domainCreateMany.mockImplementation(async (args: { data: FakeDomainRow[] }) => {
    for (const d of args.data) {
      domainRows.push(d);
      const parent = rows.find(
        (r) =>
          r.detailSopId === d.detailSopId &&
          r.penggunaId === d.penggunaId &&
          r.createdAt.getTime() === d.logCreatedAt.getTime(),
      );
      if (parent !== undefined) {
        parent.domainFields.push(d);
      }
    }
    return { count: args.data.length };
  });

  return {
    tx: {
      logEditSOP: capture,
      logEditSopDomainField: {
        domainDeleteMany: capture.domainDeleteMany,
        domainCreateMany: capture.domainCreateMany,
      },
    },
    capture,
  };
}

/** Mock tx: hanya delegate log + domain field (sisanya tidak dipakai helper). */
function asAppendTx(raw: ReturnType<typeof makeTx>['tx']): Parameters<typeof appendOrCreateLogSession>[0]['tx'] {
  return {
    logEditSOP: raw.logEditSOP,
    logEditSopDomainField: {
      deleteMany: raw.logEditSopDomainField.domainDeleteMany,
      createMany: raw.logEditSopDomainField.domainCreateMany,
    },
  } as unknown as Parameters<typeof appendOrCreateLogSession>[0]['tx'];
}

async function appendAt(
  capture: CapturedTx,
  now: Date,
  fn: () => Promise<void>,
): Promise<void> {
  capture.setClock(now);
  await fn();
}

describe('log-edit-session.helper', () => {
  describe('translateField', () => {
    it('should_return_indonesian_label_for_known_field', () => {
      expect(translateField('judul')).toBe('Judul SOP');
      expect(translateField('peringatan')).toBe('Peringatan');
    });
    it('should_passthrough_unknown_field', () => {
      expect(translateField('xyz')).toBe('xyz');
    });
  });

  describe('buildLogSummary', () => {
    it('should_format_with_count_more_than_one', () => {
      const meta: LogEditSessionMeta = { fields: ['peringatan', 'judul'], count: 5 };
      expect(buildLogSummary(BagianSOP.HEADER, meta)).toBe(
        'Header SOP: Peringatan, Judul SOP (5 perubahan)',
      );
    });
    it('should_format_singular_without_count_suffix', () => {
      const meta: LogEditSessionMeta = { fields: ['nomorSOP'], count: 1 };
      expect(buildLogSummary(BagianSOP.HEADER, meta)).toBe('Header SOP: Nomor SOP');
    });
    it('should_handle_empty_fields_with_only_bagian_label', () => {
      const meta: LogEditSessionMeta = { fields: [], count: 1 };
      expect(buildLogSummary(BagianSOP.STATUS, meta)).toBe('Status SOP');
    });
  });

  describe('appendOrCreateLogSession', () => {
    const detailSopId = 'detail-1';
    const penggunaId = 'user-1';

    it('should_create_new_session_when_no_open_session_exists', async () => {
      const { tx, capture } = makeTx();
      const now = new Date('2026-05-04T10:00:00Z');
      await appendAt(capture, now, () =>
        appendOrCreateLogSession({
          tx: asAppendTx(tx),
          detailSopId,
          penggunaId,
          bagian: BagianSOP.HEADER,
          fields: ['peringatan'],
          now,
        }),
      );
      expect(capture.findFirst).toHaveBeenCalledTimes(1);
      expect(capture.create).toHaveBeenCalledTimes(1);
      expect(capture.rows[0]).toMatchObject({
        bagian: BagianSOP.HEADER,
        closedAt: null,
        keterangan: 'Header SOP: Peringatan',
      });
    });

    it('should_merge_into_open_session_within_idle_window', async () => {
      const { tx, capture } = makeTx();
      const t1 = new Date('2026-05-04T10:00:00Z');
      const t2 = new Date(t1.getTime() + 5 * 60 * 1000);
      await appendAt(capture, t1, () =>
        appendOrCreateLogSession({
          tx: asAppendTx(tx),
          detailSopId,
          penggunaId,
          bagian: BagianSOP.HEADER,
          fields: ['peringatan'],
          now: t1,
        }),
      );
      await appendAt(capture, t2, () =>
        appendOrCreateLogSession({
          tx: asAppendTx(tx),
          detailSopId,
          penggunaId,
          bagian: BagianSOP.HEADER,
          fields: ['nomorSOP'],
          now: t2,
        }),
      );
      expect(capture.create).toHaveBeenCalledTimes(1);
      expect(capture.update).toHaveBeenCalledTimes(1);
      expect(capture.domainDeleteMany).toHaveBeenCalled();
      expect(capture.domainCreateMany).toHaveBeenCalled();
      expect(capture.rows.length).toBe(1);
      expect(capture.rows[0]!.sesiChangeCount).toBe(2);
      const keys = capture.rows[0]!.domainFields.map((x) => x.domainField).sort();
      expect(keys).toEqual(['nomorSOP', 'peringatan'].sort());
      expect(capture.rows[0]!.keterangan).toContain('Header SOP');
      expect(capture.rows[0]!.keterangan).toContain('(2 perubahan)');
    });

    it('should_create_second_session_after_idle_window_expires', async () => {
      const { tx, capture } = makeTx();
      const t1 = new Date('2026-05-04T10:00:00Z');
      const t2 = new Date(t1.getTime() + DEFAULT_LOG_SESSION_IDLE_MS + 60 * 1000);
      await appendAt(capture, t1, () =>
        appendOrCreateLogSession({
          tx: asAppendTx(tx),
          detailSopId,
          penggunaId,
          bagian: BagianSOP.HEADER,
          fields: ['peringatan'],
          now: t1,
        }),
      );
      await appendAt(capture, t2, () =>
        appendOrCreateLogSession({
          tx: asAppendTx(tx),
          detailSopId,
          penggunaId,
          bagian: BagianSOP.HEADER,
          fields: ['judul'],
          now: t2,
        }),
      );
      expect(capture.create).toHaveBeenCalledTimes(2);
      expect(capture.rows[0]!.closedAt).not.toBeNull();
      expect(capture.rows[1]!.closedAt).toBeNull();
    });

    it('should_bypass_session_merge_when_discrete_true', async () => {
      const { tx, capture } = makeTx();
      const t1 = new Date('2026-05-04T10:00:00Z');
      const t2 = new Date(t1.getTime() + 60 * 1000);
      await appendAt(capture, t1, () =>
        appendOrCreateLogSession({
          tx: asAppendTx(tx),
          detailSopId,
          penggunaId,
          bagian: BagianSOP.UMPAN_BALIK,
          fields: ['create'],
          discrete: true,
          now: t1,
        }),
      );
      await appendAt(capture, t2, () =>
        appendOrCreateLogSession({
          tx: asAppendTx(tx),
          detailSopId,
          penggunaId,
          bagian: BagianSOP.UMPAN_BALIK,
          fields: ['create'],
          discrete: true,
          now: t2,
        }),
      );
      expect(capture.create).toHaveBeenCalledTimes(2);
      expect(capture.findFirst).not.toHaveBeenCalled();
      expect(capture.rows[0]!.closedAt).toEqual(t1);
      expect(capture.rows[1]!.closedAt).toEqual(t2);
    });

    it('should_separate_sessions_by_targetEntityId', async () => {
      const { tx, capture } = makeTx();
      const t1 = new Date('2026-05-04T10:00:00Z');
      const t2 = new Date(t1.getTime() + 60 * 1000);
      await appendAt(capture, t1, () =>
        appendOrCreateLogSession({
          tx: asAppendTx(tx),
          detailSopId,
          penggunaId,
          bagian: BagianSOP.LANGKAH,
          targetEntityId: 'lang-A',
          fields: ['kegiatan'],
          now: t1,
        }),
      );
      await appendAt(capture, t2, () =>
        appendOrCreateLogSession({
          tx: asAppendTx(tx),
          detailSopId,
          penggunaId,
          bagian: BagianSOP.LANGKAH,
          targetEntityId: 'lang-B',
          fields: ['kegiatan'],
          now: t2,
        }),
      );
      expect(capture.create).toHaveBeenCalledTimes(2);
      expect(capture.rows.length).toBe(2);
    });
  });
});
