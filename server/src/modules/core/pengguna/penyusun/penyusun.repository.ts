import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import type { Pengguna } from '../../../../generated/prisma';
import { PeranPengguna } from '../../../../generated/prisma';

@Injectable()
export class PenyusunRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOpdsWithPenyusun(search?: string): Promise<
    Array<{ opdId: string; nama: string; pengguna: Pengguna[] }>
  > {
    const trimmed = search?.trim();
    const rows = await this.prisma.oPD.findMany({
      where: { deletedAt: null },
      orderBy: { nama: 'asc' },
      select: {
        opdId: true,
        nama: true,
        pengguna: {
          where: {
            peran: { in: [PeranPengguna.PENYUSUN, PeranPengguna.PJ_PENYUSUN] },
            ...(trimmed
              ? {
                  OR: [
                    { nama: { contains: trimmed } },
                    { nip: { contains: trimmed } },
                    { email: { contains: trimmed } },
                  ],
                }
              : {}),
          },
          orderBy: [{ deletedAt: 'asc' }, { nama: 'asc' }],
        },
      },
    });
    return rows;
  }

  async findPenyusunById(penggunaId: string): Promise<Pengguna | null> {
    return this.prisma.pengguna.findFirst({
      where: {
        penggunaId,
        peran: { in: [PeranPengguna.PENYUSUN, PeranPengguna.PJ_PENYUSUN] },
      },
    });
  }

  async findPenyusunAktifById(penggunaId: string): Promise<Pengguna | null> {
    return this.prisma.pengguna.findFirst({
      where: {
        penggunaId,
        peran: { in: [PeranPengguna.PENYUSUN, PeranPengguna.PJ_PENYUSUN] },
        deletedAt: null,
      },
    });
  }

  async findOpdById(opdId: string): Promise<{ opdId: string; nama: string } | null> {
    const row = await this.prisma.oPD.findFirst({
      where: { opdId, deletedAt: null },
      select: { opdId: true, nama: true },
    });
    return row;
  }

  /**
   * Riwayat OPD untuk satu penyusun: semua pasangan (pengguna, OPD) yang pernah tercatat,
   * diurutkan dari pembaruan terbaru.
   */
  async findRiwayatOpdByPenggunaId(penggunaId: string): Promise<
    Array<{
      opdId: string;
      namaOpd: string;
      pertamaDicatat: Date;
      terakhirDiperbarui: Date;
      isAktif: boolean;
    }>
  > {
    const rows = await this.prisma.riwayatOpdPengguna.findMany({
      where: { penggunaId },
      include: { opd: { select: { nama: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map((r) => ({
      opdId: r.opdId,
      namaOpd: r.opd.nama,
      pertamaDicatat: r.createdAt,
      terakhirDiperbarui: r.updatedAt,
      isAktif: r.isAktif,
    }));
  }
}
