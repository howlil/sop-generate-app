import { BagianSOP } from '../../../generated/prisma';
import {
  appendOrCreateLogSession,
  buildLogSummary,
  DEFAULT_LOG_SESSION_IDLE_MS,
  translateField,
  type LogEditSessionMeta,
} from './log-edit-session.helper';

interface FakeRow {
  logEditSopId: string;
  detailSopId: string;
  userId: string;
  bagian: BagianSOP;
  targetEntityId: string | null;
  meta: unknown;
  keterangan: string | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CapturedTx {
  rows: FakeRow[];
  findFirst: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  updateMany: jest.Mock;
  /** Synthetic clock dipakai sebagai sumber `updatedAt` baris baru/diubah. */
  setClock: (now: Date) => void;
}

function makeTx(): { tx: { logEditSOP: CapturedTx }; capture: CapturedTx } {
  const rows: FakeRow[] = [];
  let clock: Date = new Date();
  const capture: CapturedTx = {
    rows,
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    setClock: (next) => {
      clock = next;
    },
  };

  capture.findFirst.mockImplementation(async (args: { where: Record<string, unknown> }) => {
    const w = args.where;
    const cutoff = (w.updatedAt as { gt: Date } | undefined)?.gt;
    const candidates = rows.filter(
      (r) =>
        r.detailSopId === w.detailSopId &&
        r.userId === w.userId &&
        r.bagian === w.bagian &&
        r.targetEntityId === (w.targetEntityId as string | null) &&
        r.closedAt === null &&
        (cutoff === undefined || r.updatedAt > cutoff),
    );
    candidates.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return candidates[0] ?? null;
  });

  capture.create.mockImplementation(async (args: { data: Record<string, unknown> }) => {
    const d = args.data;
    const row: FakeRow = {
      logEditSopId: `row-${rows.length + 1}`,
      detailSopId: d.detailSopId as string,
      userId: d.userId as string,
      bagian: d.bagian as BagianSOP,
      targetEntityId: (d.targetEntityId as string | null | undefined) ?? null,
      meta: d.meta,
      keterangan: (d.keterangan as string | null | undefined) ?? null,
      closedAt: (d.closedAt as Date | null | undefined) ?? null,
      createdAt: clock,
      updatedAt: clock,
    };
    rows.push(row);
    return row;
  });

  capture.update.mockImplementation(
    async (args: { where: { logEditSopId: string }; data: Record<string, unknown> }) => {
      const idx = rows.findIndex((r) => r.logEditSopId === args.where.logEditSopId);
      if (idx === -1) throw new Error('row not found');
      const target = rows[idx]!;
      const updated: FakeRow = {
        ...target,
        meta: 'meta' in args.data ? args.data.meta : target.meta,
        keterangan:
          'keterangan' in args.data ? (args.data.keterangan as string | null) : target.keterangan,
        closedAt:
          'closedAt' in args.data ? (args.data.closedAt as Date | null) : target.closedAt,
        updatedAt: clock,
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
          r.userId === w.userId &&
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

  return {
    tx: { logEditSOP: capture },
    capture,
  };
}

/** Helper kecil untuk sinkronisasi clock fake dengan `now` yang dikirim ke helper. */
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
    const userId = 'user-1';

    it('should_create_new_session_when_no_open_session_exists', async () => {
      const { tx, capture } = makeTx();
      const now = new Date('2026-05-04T10:00:00Z');
      await appendAt(capture, now, () =>
        appendOrCreateLogSession({
          tx: tx as never,
          detailSopId,
          userId,
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
          tx: tx as never,
          detailSopId,
          userId,
          bagian: BagianSOP.HEADER,
          fields: ['peringatan'],
          now: t1,
        }),
      );
      await appendAt(capture, t2, () =>
        appendOrCreateLogSession({
          tx: tx as never,
          detailSopId,
          userId,
          bagian: BagianSOP.HEADER,
          fields: ['nomorSOP'],
          now: t2,
        }),
      );
      expect(capture.create).toHaveBeenCalledTimes(1);
      expect(capture.update).toHaveBeenCalledTimes(1);
      expect(capture.rows.length).toBe(1);
      const meta = capture.rows[0]!.meta as LogEditSessionMeta;
      expect(meta.count).toBe(2);
      expect(meta.fields.sort()).toEqual(['nomorSOP', 'peringatan'].sort());
      expect(capture.rows[0]!.keterangan).toContain('Header SOP');
      expect(capture.rows[0]!.keterangan).toContain('(2 perubahan)');
    });

    it('should_create_second_session_after_idle_window_expires', async () => {
      const { tx, capture } = makeTx();
      const t1 = new Date('2026-05-04T10:00:00Z');
      const t2 = new Date(t1.getTime() + DEFAULT_LOG_SESSION_IDLE_MS + 60 * 1000);
      await appendAt(capture, t1, () =>
        appendOrCreateLogSession({
          tx: tx as never,
          detailSopId,
          userId,
          bagian: BagianSOP.HEADER,
          fields: ['peringatan'],
          now: t1,
        }),
      );
      await appendAt(capture, t2, () =>
        appendOrCreateLogSession({
          tx: tx as never,
          detailSopId,
          userId,
          bagian: BagianSOP.HEADER,
          fields: ['judul'],
          now: t2,
        }),
      );
      expect(capture.create).toHaveBeenCalledTimes(2);
      /* Sesi lama harus ditutup oleh updateMany, sehingga rows[0].closedAt non-null. */
      expect(capture.rows[0]!.closedAt).not.toBeNull();
      expect(capture.rows[1]!.closedAt).toBeNull();
    });

    it('should_bypass_session_merge_when_discrete_true', async () => {
      const { tx, capture } = makeTx();
      const t1 = new Date('2026-05-04T10:00:00Z');
      const t2 = new Date(t1.getTime() + 60 * 1000);
      await appendAt(capture, t1, () =>
        appendOrCreateLogSession({
          tx: tx as never,
          detailSopId,
          userId,
          bagian: BagianSOP.KOMENTAR,
          fields: ['create'],
          discrete: true,
          now: t1,
        }),
      );
      await appendAt(capture, t2, () =>
        appendOrCreateLogSession({
          tx: tx as never,
          detailSopId,
          userId,
          bagian: BagianSOP.KOMENTAR,
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
          tx: tx as never,
          detailSopId,
          userId,
          bagian: BagianSOP.LANGKAH,
          targetEntityId: 'lang-A',
          fields: ['kegiatan'],
          now: t1,
        }),
      );
      await appendAt(capture, t2, () =>
        appendOrCreateLogSession({
          tx: tx as never,
          detailSopId,
          userId,
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
