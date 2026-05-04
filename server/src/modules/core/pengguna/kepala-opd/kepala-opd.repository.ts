import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import type { OPD, Pengguna } from '../../../../generated/prisma';
import { PeranPengguna } from '../../../../generated/prisma';

export type KepalaOpdWithCounts = Pengguna & {
  opd: OPD;
  _count: { detailSopDibuat: number };
};

@Injectable()
export class KepalaOpdRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOpdAktifById(opdId: string): Promise<OPD | null> {
    return this.prisma.oPD.findFirst({
      where: { opdId, deletedAt: null },
    });
  }

  async findKepalaById(penggunaId: string): Promise<KepalaOpdWithCounts | null> {
    const row = await this.prisma.pengguna.findFirst({
      where: { penggunaId, peran: PeranPengguna.KEPALA_OPD },
      include: {
        opd: true,
        _count: { select: { detailSopDibuat: true } },
      },
    });
    return row as KepalaOpdWithCounts | null;
  }

  async findManyKepala(search?: string): Promise<KepalaOpdWithCounts[]> {
    const trimmed = search?.trim();
    const rows = await this.prisma.pengguna.findMany({
      where: {
        peran: PeranPengguna.KEPALA_OPD,
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
      include: {
        opd: true,
        _count: { select: { detailSopDibuat: true } },
      },
      orderBy: [{ deletedAt: 'asc' }, { nama: 'asc' }],
    });
    return rows as KepalaOpdWithCounts[];
  }

  async findRiwayatRowsForPengguna(penggunaId: string): Promise<
    {
      opdId: string;
      createdAt: Date;
      updatedAt: Date;
      opd: { nama: string };
    }[]
  > {
    return this.prisma.riwayatOpdPengguna.findMany({
      where: { penggunaId },
      include: { opd: { select: { nama: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }
}
