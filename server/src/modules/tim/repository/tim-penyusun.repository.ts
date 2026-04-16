import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AnggotaTimPenyusunResponseDto } from '../dto/tim-penyusun.dto';
import { StatusTim } from '../../../generated/prisma';

const USER_SELECT = {
  id: true,
  nama: true,
  email: true,
  nip: true,
  jabatan: true,
  pangkat: true,
  nohp: true,
} as const;

@Injectable()
export class TimPenyusunRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async attachSOPCount(
    member: any,
  ): Promise<AnggotaTimPenyusunResponseDto> {
    const jumlahSOPDisusun = await this.prisma.detailSOP.count({
      where: {
        dibuatOlehId: member.userId,
        sop: { opdId: member.opdId },
      },
    });

    return { ...member, jumlahSOPDisusun };
  }

  async findAll(
    opdId?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: AnggotaTimPenyusunResponseDto[]; total: number }> {
    const skip = (page - 1) * limit;

    const where = opdId ? { opdId } : undefined;

    const [records, total] = await Promise.all([
      this.prisma.anggotaTimPenyusun.findMany({
        where,
        include: { user: { select: USER_SELECT } },
        orderBy: { tanggalBergabung: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.anggotaTimPenyusun.count({ where }),
    ]);

    const data = await Promise.all(records.map((r) => this.attachSOPCount(r)));

    return { data, total };
  }

  async findById(id: string): Promise<AnggotaTimPenyusunResponseDto | null> {
    const record = await this.prisma.anggotaTimPenyusun.findUnique({
      where: { id },
      include: { user: { select: USER_SELECT } },
    });

    if (!record) return null;

    return this.attachSOPCount(record);
  }

  async findByUserAndOpd(userId: string, opdId: string) {
    return this.prisma.anggotaTimPenyusun.findUnique({
      where: { userId_opdId: { userId, opdId } },
    });
  }

  async create(data: {
    userId: string;
    opdId: string;
  }): Promise<AnggotaTimPenyusunResponseDto> {
    const record = await this.prisma.anggotaTimPenyusun.create({
      data: {
        userId: data.userId,
        opdId: data.opdId,
        status: StatusTim.AKTIF,
      },
      include: { user: { select: USER_SELECT } },
    });

    return this.attachSOPCount(record);
  }

  async deactivate(id: string): Promise<AnggotaTimPenyusunResponseDto> {
    // [P1-F] Invariant: update status AND berakhirPada together
    const record = await this.prisma.anggotaTimPenyusun.update({
      where: { id },
      data: {
        status: StatusTim.NONAKTIF,
        berakhirPada: new Date(),
      },
      include: { user: { select: USER_SELECT } },
    });

    return this.attachSOPCount(record);
  }

  async transfer(
    id: string,
    opdIdBaru: string,
  ): Promise<AnggotaTimPenyusunResponseDto> {
    // [P1-F] Invariant: deactivate current + create new in transaction
    const current = await this.prisma.anggotaTimPenyusun.findUnique({
      where: { id },
    });

    const [, newMember] = await this.prisma.$transaction([
      this.prisma.anggotaTimPenyusun.update({
        where: { id },
        data: {
          status: StatusTim.NONAKTIF,
          berakhirPada: new Date(),
        },
      }),
      this.prisma.anggotaTimPenyusun.create({
        data: {
          userId: current!.userId,
          opdId: opdIdBaru,
          status: StatusTim.AKTIF,
        },
        include: { user: { select: USER_SELECT } },
      }),
    ]);

    return this.attachSOPCount(newMember);
  }
}
