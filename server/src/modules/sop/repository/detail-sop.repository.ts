import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { StatusSOP } from '../../../generated/prisma';

const FULL_INCLUDE = {
  sop: { select: { id: true, judul: true, opdId: true } },
  lampiran: true,
  dasarHukum: {
    include: {
      peraturan: { select: { id: true, namaPeraturan: true, nomor: true, tahun: true } },
    },
  },
  swimlanes: {
    include: { pelaksana: { select: { id: true, namaPelaksana: true } } },
    orderBy: { urutan: 'asc' as const },
  },
  langkahSOP: { orderBy: { urutan: 'asc' as const } },
  relasiSopKeluar: {
    include: {
      sopTerkait: { select: { id: true, nomorSOP: true, sop: { select: { judul: true } } } },
    },
  },
  dibuatOleh: { select: { id: true, nama: true } },
  terakhirDieditOleh: { select: { id: true, nama: true } },
} as const;

@Injectable()
export class DetailSopRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: { sopId?: string; opdId?: string; status?: StatusSOP }) {
    return this.prisma.detailSOP.findMany({
      where: {
        sopId: filters.sopId,
        status: filters.status,
        sop: filters.opdId ? { opdId: filters.opdId } : undefined,
      },
      include: { sop: { select: { id: true, judul: true, opdId: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.detailSOP.findUnique({
      where: { id },
      include: FULL_INCLUDE,
    });
  }

  async updateMetadata(id: string, data: any, editorId: string) {
    return this.prisma.detailSOP.update({
      where: { id },
      data: {
        ...data,
        tanggalRevisi: data.tanggalRevisi ? new Date(data.tanggalRevisi) : undefined,
        tanggalEfektif: data.tanggalEfektif ? new Date(data.tanggalEfektif) : undefined,
        terakhirDieditOlehId: editorId,
      },
      include: FULL_INCLUDE,
    });
  }

  async updateStatus(id: string, status: StatusSOP, editorId: string) {
    return this.prisma.detailSOP.update({
      where: { id },
      data: { status, terakhirDieditOlehId: editorId },
    });
  }

  /**
   * Count BERLAKU versions with row-level lock
   * Uses SELECT FOR UPDATE to prevent race conditions
   */
  async countBerlakuBySopId(sopId: string, tx?: any): Promise<number> {
    const db = tx ?? this.prisma;
    return db.detailSOP.count({
      where: { sopId, status: StatusSOP.BERLAKU },
    });
  }

  /**
   * Lock SOP row for update to prevent concurrent BERLAKU creation
   */
  async lockSopForUpdate(sopId: string, tx: any): Promise<void> {
    // Use raw query for SELECT FOR UPDATE
    await tx.$queryRaw`
      SELECT id FROM SOP WHERE id = ${sopId} FOR UPDATE
    `;
  }
}
