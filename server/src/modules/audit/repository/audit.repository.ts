import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { BagianSOP, PeranPengguna } from '../../../generated/prisma';

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  // AUD-03: per-DetailSOP log (any authenticated user with access to that SOP)
  async findBySopDetail(
    sopDetailId: string,
    bagian?: BagianSOP,
    skip = 0,
    take = 50,
  ) {
    return this.prisma.logEditSOP.findMany({
      where: {
        sopDetailId,
        ...(bagian && { bagian }),
      },
      include: {
        user: { select: { id: true, nama: true, peran: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  // AUD-04: all logs (BIRO_ORGANISASI only)
  async findAll(bagian?: BagianSOP, skip = 0, take = 50) {
    return this.prisma.logEditSOP.findMany({
      where: { ...(bagian && { bagian }) },
      include: {
        user: { select: { id: true, nama: true, peran: true } },
        sopDetail: {
          select: {
            id: true,
            nomorSOP: true,
            sop: { select: { judul: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  // AUD-01/02: write an immutable log entry — called by service layer on every DetailSOP mutation
  async log(data: {
    sopDetailId: string;
    userId: string;
    bagian: BagianSOP;
    entityId?: string;
    keterangan?: string;
  }) {
    return this.prisma.logEditSOP.create({ data });
  }
}
