import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

function kodeOpd(namaOpd: string): string {
  return namaOpd
    .split(/\s+/)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 4);
}

@Injectable()
export class SopRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: { opdId?: string; status?: string }) {
    const rows = await this.prisma.sOP.findMany({
      where: {
        opdId: filters.opdId,
        detailSops: filters.status
          ? { some: { status: filters.status as any } }
          : undefined,
      },
      include: {
        _count: { select: { detailSops: true } },
        detailSops: {
          orderBy: { versi: 'desc' },
          take: 1,
          select: {
            id: true,
            status: true,
            nomorSOP: true,
            versi: true,
            dibuatOleh: { select: { nama: true } },
            terakhirDieditOleh: { select: { nama: true } },
            updatedAt: true,
            tanggalPembuatan: true,
            dasarHukum: {
              select: { peraturanId: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Flatten detailSops[0] fields onto the parent SOP for client compatibility
    return rows.map((row: any) => {
      const detail = row.detailSops?.[0];
      return {
        ...row,
        status: detail?.status ?? null,
        nomorSOP: detail?.nomorSOP ?? null,
        versi: detail?.versi ?? 0,
        author: detail?.dibuatOleh?.nama ?? null,
        lastEditedBy: detail?.terakhirDieditOleh?.nama ?? null,
        lastEditedAt: detail?.updatedAt?.toISOString() ?? null,
        terakhirDiperbarui: detail?.updatedAt ? new Date(detail.updatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null,
        tanggal: detail?.tanggalPembuatan ? new Date(detail.tanggalPembuatan).toLocaleDateString('id-ID') : null,
        detailSopId: detail?.id ?? null,
        peraturanId: detail?.dasarHukum?.[0]?.peraturanId ?? null,
      };
    });
  }

  async findById(id: string) {
    return this.prisma.sOP.findUnique({
      where: { id },
      include: {
        _count: { select: { detailSops: true } },
        detailSops: {
          orderBy: { versi: 'desc' },
          select: { id: true, nomorSOP: true, status: true, versi: true },
        },
      },
    });
  }

  async create(data: {
    opdId: string;
    judul: string;
    logoInstansi: string;
    namaLembaga: string;
    dibuatOlehId: string;
  }) {
    const opd = await this.prisma.oPD.findUniqueOrThrow({
      where: { id: data.opdId },
      select: { nama: true },
    });

    const tahun = new Date().getFullYear();
    const count = await this.prisma.detailSOP.count({
      where: { sop: { opdId: data.opdId } },
    });
    const nomorSOP = `SOP/${kodeOpd(opd.nama)}/${tahun}/${String(count + 1).padStart(3, '0')}`;

    return this.prisma.sOP.create({
      data: {
        judul: data.judul,
        opdId: data.opdId,
        detailSops: {
          create: {
            nomorSOP,
            logoInstansi: data.logoInstansi,
            namaLembaga: data.namaLembaga,
            dibuatOlehId: data.dibuatOlehId,
          },
        },
      },
      include: {
        detailSops: true,
      },
    });
  }

  async update(id: string, data: { judul?: string }) {
    return this.prisma.sOP.update({ where: { id }, data });
  }

  async delete(id: string) {
    // [P0-A]: explicit delete ordering to prevent multi-path cascade deadlock
    // DiagramEdge has onDelete:Restrict from LangkahSOP — must clear before cascade
    await this.prisma.$transaction(async (tx) => {
      const detailSops = await tx.detailSOP.findMany({
        where: { sopId: id },
        select: { id: true },
      });
      const detailSopIds = detailSops.map((d) => d.id);

      if (detailSopIds.length > 0) {
        await tx.diagramEdgePoint.deleteMany({
          where: { diagramEdge: { diagramLayout: { sopDetailId: { in: detailSopIds } } } },
        });
        await tx.diagramEdge.deleteMany({
          where: { diagramLayout: { sopDetailId: { in: detailSopIds } } },
        });
        await tx.diagramNodePosition.deleteMany({
          where: { diagramLayout: { sopDetailId: { in: detailSopIds } } },
        });
      }

      await tx.sOP.delete({ where: { id } });
    });
  }

  async hasSignaturesOrEvaluations(id: string): Promise<boolean> {
    // SOP-16: block delete if any DetailSOP has signatures or evaluations
    const count = await this.prisma.detailSOP.count({
      where: {
        sopId: id,
        OR: [
          { tandaTanganSop: { some: {} } },
          { nilaiEvaluasi: { some: {} } },
        ],
      },
    });
    return count > 0;
  }
}
