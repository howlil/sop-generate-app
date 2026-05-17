import { BadRequestException, Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/prisma';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { BagianSOP, PeranPengguna, StatusSOP } from '../../../generated/prisma';
import { appendOrCreateLogSession } from '../sop-collaboration/log-edit-session.helper';

export interface UpdateSopHeaderRepoInput {
  judul?: string;
  nomorSOP?: string;
  namaLembaga?: string;
  dasarHukumPeraturanIds?: string[];
  sopTerkaitDetailIds?: string[];
  lampiran?: {
    peringatan?: string[];
    kualifikasiPelaksanaan?: string[];
    peralatanPerlengkapan?: string[];
    pencatatanPendataan?: string[];
  };
}

/** Payload mentah workbench penyususun (DetailSOP + langkah + log) untuk dipetakan di service. */
export type SopWorkbenchDbPayload = Prisma.DetailSOPGetPayload<{
  include: {
    sop: {
      include: {
        opd: {
          select: {
            opdId: true;
            nama: true;
            pengguna: {
              where: { peran: 'KEPALA_OPD'; deletedAt: null };
              take: 1;
              select: { nama: true; nip: true };
            };
          };
        };
      };
    };
    dibuatOleh: { select: { penggunaId: true; nama: true } };
    terakhirDieditOleh: { select: { penggunaId: true; nama: true } };
    lampiranPeringatan: true;
    lampiranKualifikasiPelaksanaan: true;
    lampiranPeralatanPerlengkapan: true;
    lampiranPencatatanPendataan: true;
    dasarHukum: { include: { peraturan: true } };
    relasiSopKeluar: {
      include: {
        sopTerkait: { include: { sop: { select: { judul: true; sopId: true } } } };
      };
    };
    relasiSopMasuk: {
      include: {
        sop: { include: { sop: { select: { judul: true; sopId: true } } } };
      };
    };
    swimlanes: { include: { pelaksana: true } };
    nilaiEvaluasi: {
      select: { pengajuanEvaluasiId: true; detailSopId: true; hasil: true; catatan: true };
    };
    langkahSOP: { orderBy: { urutan: 'asc' }; include: { pelaksana: true } };
    logEditSop: {
      orderBy: { createdAt: 'desc' };
      take: number;
      include: {
        domainFields: true;
        pengguna: { select: { penggunaId: true; nama: true; email: true; peran: true } };
      };
    };
  };
}>;

export type SopDaftarDbRow = {
  sopId: string;
  opdId: string;
  judul: string;
  detail:
    | {
        detailSopId: string;
        nomorSOP: string;
        status: string;
        updatedAt: Date;
        pembuatNama: string | null;
        editorNama: string | null;
        peraturanId: string | null;
      }
    | undefined;
};

/** Filter daftar SOP (DetailSOP terbaru): status dan/atau rentang tanggal `updatedAt` (YYYY-MM-DD, UTC). */
export interface SopDaftarListFilters {
  readonly status?: string;
  readonly tanggalDari?: string;
  readonly tanggalSampai?: string;
}

@Injectable()
export class SopCatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  private static isoDateUtc(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  private applyDaftarFilters(rows: SopDaftarDbRow[], filters: SopDaftarListFilters): SopDaftarDbRow[] {
    const hasStatus = filters.status !== undefined && filters.status.length > 0;
    const hasDari = filters.tanggalDari !== undefined && filters.tanggalDari.length > 0;
    const hasSampai = filters.tanggalSampai !== undefined && filters.tanggalSampai.length > 0;
    if (!hasStatus && !hasDari && !hasSampai) {
      return rows;
    }
    return rows.filter((r) => {
      const d = r.detail;
      if (d === undefined) {
        return false;
      }
      if (hasStatus && d.status !== filters.status) {
        return false;
      }
      const day = SopCatalogRepository.isoDateUtc(d.updatedAt);
      if (hasDari && day < filters.tanggalDari!) {
        return false;
      }
      if (hasSampai && day > filters.tanggalSampai!) {
        return false;
      }
      return true;
    });
  }

  async findOpdIdByPenggunaId(penggunaId: string): Promise<string | null> {
    const row = await this.prisma.pengguna.findFirst({
      where: { penggunaId, deletedAt: null },
      select: { opdId: true },
    });
    return row?.opdId ?? null;
  }

  async findOpdNama(opdId: string): Promise<string | null> {
    const row = await this.prisma.oPD.findFirst({
      where: { opdId, deletedAt: null },
      select: { nama: true },
    });
    return row?.nama ?? null;
  }

  async findPenggunaNama(penggunaId: string): Promise<string | null> {
    const row = await this.prisma.pengguna.findFirst({
      where: { penggunaId, deletedAt: null },
      select: { nama: true },
    });
    return row?.nama ?? null;
  }

  /**
   * Transaksi: header SOP + DetailSOP versi 1 (status DRAFT, dibuatOlehId = pembuat).
   */
  async createSopWithInitialDetail(params: {
    judul: string;
    nomorSOP: string;
    opdId: string;
    penggunaId: string;
    namaLembaga: string;
  }): Promise<SopDaftarDbRow> {
    const created = await this.prisma.$transaction(async (tx) => {
      const sop = await tx.sOP.create({
        data: {
          judul: params.judul,
          opdId: params.opdId,
        },
      });
      const detail = await tx.detailSOP.create({
        data: {
          sopId: sop.sopId,
          nomorSOP: params.nomorSOP,
          versi: 1,
          status: StatusSOP.DRAFT,
          dibuatOlehId: params.penggunaId,
          namaLembaga: params.namaLembaga,
        },
        include: {
          dibuatOleh: { select: { nama: true } },
          terakhirDieditOleh: { select: { nama: true } },
        },
      });
      return { sop, detail };
    });
    const d = created.detail;
    return {
      sopId: created.sop.sopId,
      opdId: created.sop.opdId,
      judul: created.sop.judul,
      detail: {
        detailSopId: d.detailSopId,
        nomorSOP: d.nomorSOP,
        status: d.status,
        updatedAt: d.updatedAt,
        pembuatNama: d.dibuatOleh?.nama ?? null,
        editorNama: d.terakhirDieditOleh?.nama ?? null,
        peraturanId: null,
      },
    };
  }

  async findDaftarByOpdId(opdId: string, filters: SopDaftarListFilters = {}): Promise<SopDaftarDbRow[]> {
    const rows = await this.prisma.sOP.findMany({
      where: { opdId },
      orderBy: { updatedAt: 'desc' },
      select: {
        sopId: true,
        opdId: true,
        judul: true,
        detailSops: {
          orderBy: { versi: 'desc' },
          take: 1,
          select: {
            detailSopId: true,
            nomorSOP: true,
            status: true,
            updatedAt: true,
            dibuatOleh: { select: { nama: true } },
            terakhirDieditOleh: { select: { nama: true } },
            dasarHukum: {
              orderBy: { createdAt: 'asc' },
              take: 1,
              select: { peraturanId: true },
            },
          },
        },
      },
    });
    const mappedByOpd = rows.map((r) => {
      const d = r.detailSops[0];
      if (d === undefined) {
        return { sopId: r.sopId, opdId: r.opdId, judul: r.judul, detail: undefined };
      }
      const pembuatNama = d.dibuatOleh?.nama ?? null;
      const editorNama = d.terakhirDieditOleh?.nama ?? null;
      const peraturanId = d.dasarHukum[0]?.peraturanId ?? null;
      return {
        sopId: r.sopId,
        opdId: r.opdId,
        judul: r.judul,
        detail: {
          detailSopId: d.detailSopId,
          nomorSOP: d.nomorSOP,
          status: d.status,
          updatedAt: d.updatedAt,
          pembuatNama,
          editorNama,
          peraturanId,
        },
      };
    });
    return this.applyDaftarFilters(mappedByOpd, filters);
  }

  /** Daftar semua SOP (untuk peran evaluasi yang membutuhkan agregasi lintas OPD). */
  /**
   * Satu query DetailSOP lengkap untuk halaman workbench penyusun (tanpa duplikasi fetch).
   */
  async findWorkbenchPayload(
    detailSopId: string,
    logsLimit: number,
  ): Promise<SopWorkbenchDbPayload | null> {
    const row = await this.prisma.detailSOP.findUnique({
      where: { detailSopId },
      include: {
        sop: {
          include: {
            opd: {
              select: {
                opdId: true,
                nama: true,
                pengguna: {
                  where: { peran: PeranPengguna.KEPALA_OPD, deletedAt: null },
                  take: 1,
                  select: { nama: true, nip: true },
                },
              },
            },
          },
        },
        dibuatOleh: { select: { penggunaId: true, nama: true } },
        terakhirDieditOleh: { select: { penggunaId: true, nama: true } },
        lampiranPeringatan: true,
        lampiranKualifikasiPelaksanaan: true,
        lampiranPeralatanPerlengkapan: true,
        lampiranPencatatanPendataan: true,
        dasarHukum: { include: { peraturan: true } },
        relasiSopKeluar: {
          include: {
            sopTerkait: { include: { sop: { select: { judul: true, sopId: true } } } },
          },
        },
        relasiSopMasuk: {
          include: {
            sop: { include: { sop: { select: { judul: true, sopId: true } } } },
          },
        },
        swimlanes: { include: { pelaksana: true } },
        nilaiEvaluasi: {
          select: { pengajuanEvaluasiId: true, detailSopId: true, hasil: true, catatan: true },
        },
        langkahSOP: { orderBy: { urutan: 'asc' }, include: { pelaksana: true } },
        logEditSop: {
          orderBy: { createdAt: 'desc' },
          take: logsLimit,
          include: {
            domainFields: true,
            pengguna: { select: { penggunaId: true, nama: true, email: true, peran: true } },
          },
        },
      },
    });
    return row;
  }

  /**
   * Workbench: `id` boleh berupa `detailSopId` atau `sopId` (header).
   * UI daftar memakai `sop.id` pada rute edit; fallback ke DetailSOP versi terbaru per header.
   */
  async findWorkbenchPayloadByDetailOrSopId(
    detailOrSopId: string,
    logsLimit: number,
  ): Promise<SopWorkbenchDbPayload | null> {
    const direct = await this.findWorkbenchPayload(detailOrSopId, logsLimit);
    if (direct !== null) {
      return direct;
    }
    const header = await this.prisma.sOP.findUnique({
      where: { sopId: detailOrSopId },
      select: {
        detailSops: {
          orderBy: { versi: 'desc' },
          take: 1,
          select: { detailSopId: true },
        },
      },
    });
    const latestDetailId = header?.detailSops[0]?.detailSopId;
    if (latestDetailId === undefined) {
      return null;
    }
    return this.findWorkbenchPayload(latestDetailId, logsLimit);
  }

  /**
   * Resolve `id` (boleh detailSopId atau sopId header) menjadi pasangan (detailSopId, sopId).
   * Bila berupa sopId header, dipakai DetailSOP versi terbaru.
   */
  async findDetailIdByDetailOrSopId(
    detailOrSopId: string,
  ): Promise<{ detailSopId: string; sopId: string } | null> {
    const direct = await this.prisma.detailSOP.findUnique({
      where: { detailSopId: detailOrSopId },
      select: { detailSopId: true, sopId: true },
    });
    if (direct !== null) {
      return direct;
    }
    const header = await this.prisma.sOP.findUnique({
      where: { sopId: detailOrSopId },
      select: {
        sopId: true,
        detailSops: {
          orderBy: { versi: 'desc' },
          take: 1,
          select: { detailSopId: true },
        },
      },
    });
    const latest = header?.detailSops[0]?.detailSopId;
    if (header === null || latest === undefined) {
      return null;
    }
    return { detailSopId: latest, sopId: header.sopId };
  }

  /**
   * Status + OPD untuk DetailSOP terbaru; `detailOrSopId` boleh ID DetailSOP atau ID header SOP.
   */
  async findLatestDetailStatusContext(detailOrSopId: string): Promise<{
    detailSopId: string;
    sopId: string;
    status: StatusSOP;
    sopOpdId: string;
  } | null> {
    const resolved = await this.findDetailIdByDetailOrSopId(detailOrSopId);
    if (resolved === null) {
      return null;
    }
    const row = await this.prisma.detailSOP.findUnique({
      where: { detailSopId: resolved.detailSopId },
      select: {
        detailSopId: true,
        sopId: true,
        status: true,
        sop: { select: { opdId: true } },
      },
    });
    if (row === null) {
      return null;
    }
    return {
      detailSopId: row.detailSopId,
      sopId: row.sopId,
      status: row.status,
      sopOpdId: row.sop.opdId,
    };
  }

  async updateDetailSopStatus(params: {
    detailSopId: string;
    status: StatusSOP;
    userId: string;
  }): Promise<void> {
    const { detailSopId, status, userId } = params;
    await this.prisma.$transaction(async (tx) => {
      await tx.detailSOP.update({
        where: { detailSopId },
        data: {
          status,
          terakhirDieditOlehId: userId,
        },
      });
      await appendOrCreateLogSession({
        tx,
        detailSopId,
        penggunaId: userId,
        bagian: BagianSOP.STATUS,
        fields: ['status'],
        discrete: true,
      });
    });
  }

  /**
   * Transaksi: set SIAP_DIEVALUASI lalu DIAJUKAN_EVALUASI (kirim ulang setelah revisi evaluator).
   */
  async transitionDetailSopRevisiToDiajukanEvaluasi(params: {
    detailSopId: string;
    userId: string;
  }): Promise<void> {
    const { detailSopId, userId } = params;
    await this.prisma.$transaction(async (tx) => {
      await tx.detailSOP.update({
        where: { detailSopId },
        data: {
          status: StatusSOP.SIAP_DIEVALUASI,
          terakhirDieditOlehId: userId,
        },
      });
      await appendOrCreateLogSession({
        tx,
        detailSopId,
        penggunaId: userId,
        bagian: BagianSOP.STATUS,
        fields: ['status'],
        discrete: true,
      });
      await tx.detailSOP.update({
        where: { detailSopId },
        data: {
          status: StatusSOP.DIAJUKAN_EVALUASI,
          terakhirDieditOlehId: userId,
        },
      });
      await appendOrCreateLogSession({
        tx,
        detailSopId,
        penggunaId: userId,
        bagian: BagianSOP.STATUS,
        fields: ['status'],
        discrete: true,
      });
    });
  }

  /**
   * Partial update header SOP dalam satu transaksi (judul header, kolom DetailSOP,
   * relasi DasarHukum, SopTerkait, dan kelompok LampiranTeks per jenis).
   * Replace-all untuk array; field skalar hanya ditulis bila dikirim.
   */
  async updateSopHeaderTransaction(params: {
    detailSopId: string;
    sopId: string;
    userId: string;
    input: UpdateSopHeaderRepoInput;
    /** Daftar nama field domain yang diminta klien — dipakai untuk session log. */
    changedFields: string[];
  }): Promise<void> {
    const { detailSopId, sopId, userId, input, changedFields } = params;
    await this.prisma.$transaction(async (tx) => {
      if (input.judul !== undefined) {
        await tx.sOP.update({
          where: { sopId },
          data: { judul: input.judul.trim() },
        });
      }

      const detailData: Prisma.DetailSOPUncheckedUpdateInput = {
        terakhirDieditOlehId: userId,
      };
      if (input.nomorSOP !== undefined) {
        detailData.nomorSOP = input.nomorSOP.trim();
      }
      if (input.namaLembaga !== undefined) {
        detailData.namaLembaga = input.namaLembaga;
      }
      await tx.detailSOP.update({
        where: { detailSopId },
        data: detailData,
      });

      if (input.dasarHukumPeraturanIds !== undefined) {
        await tx.dasarHukum.deleteMany({ where: { detailSopId } });
        const uniqueIds = Array.from(new Set(input.dasarHukumPeraturanIds));
        if (uniqueIds.length > 0) {
          await tx.dasarHukum.createMany({
            data: uniqueIds.map((peraturanId) => ({ detailSopId, peraturanId })),
            skipDuplicates: true,
          });
        }
      }

      if (input.sopTerkaitDetailIds !== undefined) {
        await tx.sopTerkait.deleteMany({ where: { detailSopId } });
        const uniqueIds = Array.from(
          new Set(input.sopTerkaitDetailIds.filter((id) => id !== detailSopId)),
        );
        if (uniqueIds.length > 0) {
          const inverse = await tx.sopTerkait.findFirst({
            where: { detailSopTerkaitId: detailSopId, detailSopId: { in: uniqueIds } },
            select: { detailSopId: true },
          });
          if (inverse !== null) {
            throw new BadRequestException(
              'SOP terkait bentrok: salah satu target sudah menaut balik ke dokumen ini; hapus relasi terbalik terlebih dahulu.',
            );
          }
          await tx.sopTerkait.createMany({
            data: uniqueIds.map((detailSopTerkaitId) => ({
              detailSopId,
              detailSopTerkaitId,
            })),
            skipDuplicates: true,
          });
        }
      }

      if (input.lampiran?.peringatan !== undefined) {
        await tx.lampiranPeringatan.deleteMany({ where: { detailSopId } });
        const cleaned = input.lampiran.peringatan
          .map((it) => it.trim())
          .filter((it) => it.length > 0);
        if (cleaned.length > 0) {
          await tx.lampiranPeringatan.createMany({
            data: cleaned.map((teks) => ({ detailSopId, teks })),
          });
        }
      }

      if (input.lampiran?.kualifikasiPelaksanaan !== undefined) {
        await tx.lampiranKualifikasiPelaksanaan.deleteMany({ where: { detailSopId } });
        const cleaned = input.lampiran.kualifikasiPelaksanaan
          .map((it) => it.trim())
          .filter((it) => it.length > 0);
        if (cleaned.length > 0) {
          await tx.lampiranKualifikasiPelaksanaan.createMany({
            data: cleaned.map((teks) => ({ detailSopId, teks })),
          });
        }
      }

      if (input.lampiran?.peralatanPerlengkapan !== undefined) {
        await tx.lampiranPeralatanPerlengkapan.deleteMany({ where: { detailSopId } });
        const cleaned = input.lampiran.peralatanPerlengkapan
          .map((it) => it.trim())
          .filter((it) => it.length > 0);
        if (cleaned.length > 0) {
          await tx.lampiranPeralatanPerlengkapan.createMany({
            data: cleaned.map((teks) => ({ detailSopId, teks })),
          });
        }
      }

      if (input.lampiran?.pencatatanPendataan !== undefined) {
        await tx.lampiranPencatatanPendataan.deleteMany({ where: { detailSopId } });
        const cleaned = input.lampiran.pencatatanPendataan
          .map((it) => it.trim())
          .filter((it) => it.length > 0);
        if (cleaned.length > 0) {
          await tx.lampiranPencatatanPendataan.createMany({
            data: cleaned.map((teks) => ({ detailSopId, teks })),
          });
        }
      }

      await appendOrCreateLogSession({
        tx,
        detailSopId,
        penggunaId: userId,
        bagian: BagianSOP.HEADER,
        fields: changedFields,
      });
    });
  }

  async findDaftarAll(filters: SopDaftarListFilters = {}): Promise<SopDaftarDbRow[]> {
    const rows = await this.prisma.sOP.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        sopId: true,
        opdId: true,
        judul: true,
        detailSops: {
          orderBy: { versi: 'desc' },
          take: 1,
          select: {
            detailSopId: true,
            nomorSOP: true,
            status: true,
            updatedAt: true,
            dibuatOleh: { select: { nama: true } },
            terakhirDieditOleh: { select: { nama: true } },
            dasarHukum: {
              orderBy: { createdAt: 'asc' },
              take: 1,
              select: { peraturanId: true },
            },
          },
        },
      },
    });
    const mapped = rows.map((r) => {
      const d = r.detailSops[0];
      if (d === undefined) {
        return { sopId: r.sopId, opdId: r.opdId, judul: r.judul, detail: undefined };
      }
      const pembuatNama = d.dibuatOleh?.nama ?? null;
      const editorNama = d.terakhirDieditOleh?.nama ?? null;
      const peraturanId = d.dasarHukum[0]?.peraturanId ?? null;
      return {
        sopId: r.sopId,
        opdId: r.opdId,
        judul: r.judul,
        detail: {
          detailSopId: d.detailSopId,
          nomorSOP: d.nomorSOP,
          status: d.status,
          updatedAt: d.updatedAt,
          pembuatNama,
          editorNama,
          peraturanId,
        },
      };
    });
    return this.applyDaftarFilters(mapped, filters);
  }
}
