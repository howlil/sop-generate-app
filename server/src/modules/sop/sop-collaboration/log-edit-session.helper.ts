import type { Prisma } from '../../../generated/prisma';
import { BagianSOP } from '../../../generated/prisma';

/**
 * Window default antara dua edit yang masih dianggap satu sesi (idle gap < 10 menit).
 * Mengikuti gaya Google Docs: edit beruntun digabung; jika idle melewati window,
 * sesi ditutup dan edit berikutnya membuat sesi baru.
 */
export const DEFAULT_LOG_SESSION_IDLE_MS = 10 * 60 * 1000;

/** Bentuk meta yang disimpan di kolom `meta` JSON pada `LogEditSOP`. */
export interface LogEditSessionMeta {
  /** Daftar field domain yang berubah selama sesi (union string set). */
  fields: string[];
  /** Berapa kali append terjadi pada sesi ini. */
  count: number;
}

export interface AppendLogParams {
  /** Prisma transaction client. Helper dimaksudkan dijalankan dalam transaksi. */
  tx: Prisma.TransactionClient;
  detailSopId: string;
  userId: string;
  bagian: BagianSOP;
  /** Pointer longgar ke entitas yang diaudit (mis. komentarId); bukan FK. */
  targetEntityId?: string | null;
  /** Daftar field domain yang baru saja berubah pada satu request. */
  fields: string[];
  /** Force selalu buat entry baru (untuk event diskrit, mis. KOMENTAR/STATUS). */
  discrete?: boolean;
  /** Override idle window. Default {@link DEFAULT_LOG_SESSION_IDLE_MS}. */
  idleWindowMs?: number;
  /** Sumber waktu — diparameterkan untuk memudahkan unit test. */
  now?: Date;
}

const FIELD_LABEL_ID: Record<string, string> = {
  judul: 'Judul SOP',
  nomorSOP: 'Nomor SOP',
  namaLembaga: 'Nama Lembaga',
  peringatan: 'Peringatan',
  dasarHukumPeraturanIds: 'Dasar Hukum',
  sopTerkaitDetailIds: 'Keterkaitan SOP',
  kualifikasiPelaksanaan: 'Kualifikasi Pelaksanaan',
  peralatanPerlengkapan: 'Peralatan/Perlengkapan',
  pencatatanPendataan: 'Pencatatan dan Pendataan',
  pelaksana: 'Aktor Pelaksana',
  langkah: 'Daftar Langkah',
  status: 'Status SOP',
  isi: 'Isi Komentar',
  resolve: 'Tandai Selesai',
  create: 'Membuat',
  delete: 'Menghapus',
};

const BAGIAN_LABEL_ID: Record<BagianSOP, string> = {
  HEADER: 'Header SOP',
  LANGKAH: 'Langkah Prosedur',
  STATUS: 'Status SOP',
  KOMENTAR: 'Komentar',
  EVALUASI: 'Evaluasi',
};

/** Konversi nama field domain ke label Bahasa Indonesia. Field tak dikenal dipakai apa adanya. */
export function translateField(field: string): string {
  return FIELD_LABEL_ID[field] ?? field;
}

/** Bangun ringkasan keterangan untuk ditampilkan di tab Aktivitas. */
export function buildLogSummary(bagian: BagianSOP, meta: LogEditSessionMeta): string {
  const labels = meta.fields.map(translateField);
  const fieldsText = labels.length > 0 ? `: ${labels.join(', ')}` : '';
  const countText = meta.count > 1 ? ` (${meta.count} perubahan)` : '';
  return `${BAGIAN_LABEL_ID[bagian]}${fieldsText}${countText}`;
}

function unionFields(prev: string[], next: string[]): string[] {
  const set = new Set<string>();
  for (const v of prev) {
    if (typeof v === 'string' && v.length > 0) set.add(v);
  }
  for (const v of next) {
    if (typeof v === 'string' && v.length > 0) set.add(v);
  }
  return Array.from(set);
}

function asMeta(raw: unknown): LogEditSessionMeta {
  if (raw === null || typeof raw !== 'object') {
    return { fields: [], count: 0 };
  }
  const obj = raw as Record<string, unknown>;
  const fieldsRaw = obj.fields;
  const fields = Array.isArray(fieldsRaw)
    ? fieldsRaw.filter((v): v is string => typeof v === 'string')
    : [];
  const count = typeof obj.count === 'number' && Number.isFinite(obj.count) ? obj.count : 0;
  return { fields, count };
}

/**
 * Append-or-create entry log untuk satu (detailSop, user, bagian, targetEntityId).
 *
 * - `discrete=true` selalu buat entry baru `closedAt = now`.
 * - Bila ada sesi terbuka same triple dan `updatedAt > now - idleWindowMs` -> merge.
 * - Bila tidak: tutup sesi terbuka basi (`closedAt = now`) lalu buat sesi baru (`closedAt = null`).
 */
export async function appendOrCreateLogSession(p: AppendLogParams): Promise<void> {
  const now = p.now ?? new Date();
  const window = p.idleWindowMs ?? DEFAULT_LOG_SESSION_IDLE_MS;
  const fields = p.fields.filter((f) => typeof f === 'string' && f.length > 0);
  const targetEntityId = p.targetEntityId ?? null;

  if (p.discrete === true) {
    const meta: LogEditSessionMeta = { fields, count: 1 };
    await p.tx.logEditSOP.create({
      data: {
        detailSopId: p.detailSopId,
        userId: p.userId,
        bagian: p.bagian,
        targetEntityId,
        meta: meta as unknown as Prisma.InputJsonValue,
        keterangan: buildLogSummary(p.bagian, meta),
        closedAt: now,
      },
    });
    return;
  }

  const cutoff = new Date(now.getTime() - window);
  const open = await p.tx.logEditSOP.findFirst({
    where: {
      detailSopId: p.detailSopId,
      userId: p.userId,
      bagian: p.bagian,
      targetEntityId,
      closedAt: null,
      updatedAt: { gt: cutoff },
    },
    orderBy: { updatedAt: 'desc' },
  });

  if (open !== null) {
    const prevMeta = asMeta(open.meta);
    const merged: LogEditSessionMeta = {
      fields: unionFields(prevMeta.fields, fields),
      count: prevMeta.count + 1,
    };
    await p.tx.logEditSOP.update({
      where: { logEditSopId: open.logEditSopId },
      data: {
        meta: merged as unknown as Prisma.InputJsonValue,
        keterangan: buildLogSummary(p.bagian, merged),
      },
    });
    return;
  }

  /* Tutup sesi terbuka basi same triple agar tidak ada dua sesi terbuka paralel. */
  await p.tx.logEditSOP.updateMany({
    where: {
      detailSopId: p.detailSopId,
      userId: p.userId,
      bagian: p.bagian,
      targetEntityId,
      closedAt: null,
    },
    data: { closedAt: now },
  });

  const fresh: LogEditSessionMeta = { fields, count: 1 };
  await p.tx.logEditSOP.create({
    data: {
      detailSopId: p.detailSopId,
      userId: p.userId,
      bagian: p.bagian,
      targetEntityId,
      meta: fresh as unknown as Prisma.InputJsonValue,
      keterangan: buildLogSummary(p.bagian, fresh),
      closedAt: null,
    },
  });
}
