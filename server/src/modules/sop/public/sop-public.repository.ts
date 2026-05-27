import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { StatusSOP } from '../../../generated/prisma';

export type PublicOpdDbRow = {
  readonly opdId: string;
  readonly nama: string;
  readonly jumlahSopBerlaku: number;
};

export type PublicSopDbRow = {
  readonly detailSopId: string;
  readonly sopId: string;
  readonly opdId: string;
  readonly judul: string;
  readonly nomorSOP: string;
  readonly versi: number;
  readonly tanggalEfektif: Date | null;
  readonly opdNama: string;
};

@Injectable()
export class SopPublicRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOpdAktifById(opdId: string): Promise<{ opdId: string; nama: string } | null> {
    return this.prisma.oPD.findFirst({
      where: { opdId, deletedAt: null },
      select: { opdId: true, nama: true },
    });
  }

  async countOpdWithBerlakuSop(search?: string): Promise<number> {
    return this.prisma.oPD.count({
      where: this.buildOpdWhere(search),
    });
  }

  async findOpdWithBerlakuSop(params: {
    search?: string;
    skip: number;
    take: number;
  }): Promise<PublicOpdDbRow[]> {
    const rows = await this.prisma.oPD.findMany({
      where: this.buildOpdWhere(params.search),
      select: {
        opdId: true,
        nama: true,
        _count: {
          select: {
            sop: {
              where: {
                detailSops: { some: { status: StatusSOP.BERLAKU } },
              },
            },
          },
        },
      },
      orderBy: { nama: 'asc' },
      skip: params.skip,
      take: params.take,
    });
    return rows.map((row) => ({
      opdId: row.opdId,
      nama: row.nama,
      jumlahSopBerlaku: row._count.sop,
    }));
  }

  async countBerlakuSopByOpd(opdId: string, search?: string): Promise<number> {
    return this.prisma.detailSOP.count({
      where: this.buildBerlakuSopWhere(opdId, search),
    });
  }

  async findBerlakuSopByOpd(params: {
    opdId: string;
    search?: string;
    skip: number;
    take: number;
  }): Promise<PublicSopDbRow[]> {
    const rows = await this.prisma.detailSOP.findMany({
      where: this.buildBerlakuSopWhere(params.opdId, params.search),
      select: {
        detailSopId: true,
        sopId: true,
        nomorSOP: true,
        versi: true,
        tanggalEfektif: true,
        sop: {
          select: {
            judul: true,
            opdId: true,
            opd: { select: { nama: true } },
          },
        },
      },
      orderBy: { sop: { judul: 'asc' } },
      skip: params.skip,
      take: params.take,
    });
    return rows.map((row) => this.mapSopRow(row));
  }

  async countBerlakuSopGlobal(search?: string): Promise<number> {
    return this.prisma.detailSOP.count({
      where: this.buildBerlakuSopGlobalWhere(search),
    });
  }

  async findBerlakuSopGlobal(params: {
    search?: string;
    skip: number;
    take: number;
  }): Promise<PublicSopDbRow[]> {
    const rows = await this.prisma.detailSOP.findMany({
      where: this.buildBerlakuSopGlobalWhere(params.search),
      select: {
        detailSopId: true,
        sopId: true,
        nomorSOP: true,
        versi: true,
        tanggalEfektif: true,
        sop: {
          select: {
            judul: true,
            opdId: true,
            opd: { select: { nama: true } },
          },
        },
      },
      orderBy: { sop: { judul: 'asc' } },
      skip: params.skip,
      take: params.take,
    });
    return rows.map((row) => this.mapSopRow(row));
  }

  private mapSopRow(row: {
    detailSopId: string;
    sopId: string;
    nomorSOP: string;
    versi: number;
    tanggalEfektif: Date | null;
    sop: { judul: string; opdId: string; opd: { nama: string } };
  }): PublicSopDbRow {
    return {
      detailSopId: row.detailSopId,
      sopId: row.sopId,
      opdId: row.sop.opdId,
      judul: row.sop.judul,
      nomorSOP: row.nomorSOP,
      versi: row.versi,
      tanggalEfektif: row.tanggalEfektif,
      opdNama: row.sop.opd.nama,
    };
  }

  private buildOpdWhere(search?: string) {
    return {
      deletedAt: null,
      sop: {
        some: {
          detailSops: { some: { status: StatusSOP.BERLAKU } },
        },
      },
      ...(search
        ? {
            nama: { contains: search },
          }
        : {}),
    };
  }

  private buildBerlakuSopWhere(opdId: string, search?: string) {
    const searchFilter =
      search !== undefined
        ? {
            OR: [{ nomorSOP: { contains: search } }, { sop: { judul: { contains: search } } }],
          }
        : {};
    return {
      status: StatusSOP.BERLAKU,
      sop: {
        opdId,
        opd: { deletedAt: null },
      },
      ...searchFilter,
    };
  }

  private buildBerlakuSopGlobalWhere(search?: string) {
    const base = {
      status: StatusSOP.BERLAKU,
      sop: {
        opd: { deletedAt: null },
      },
    };
    if (search === undefined) {
      return base;
    }
    return {
      ...base,
      OR: [
        { nomorSOP: { contains: search } },
        { sop: { judul: { contains: search } } },
        { sop: { opd: { nama: { contains: search } } } },
      ],
    };
  }
}
