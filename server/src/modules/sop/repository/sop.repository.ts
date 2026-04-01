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
    return this.prisma.sOP.findMany({
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
          select: { status: true, nomorSOP: true, versi: true },
        },
      },
      orderBy: { createdAt: 'desc' },
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
    await this.prisma.sOP.delete({ where: { id } });
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
