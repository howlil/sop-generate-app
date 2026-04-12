import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { IOpdRepository } from './opd.repository.interface';
import { OpdResponseDto } from '../dto/opd.dto';
import { StatusSOP, StatusPengajuanEvaluasi } from '../../../generated/prisma';

@Injectable()
export class OpdRepository implements IOpdRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async attachAggregates(opd: {
    id: string;
    nama: string;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): Promise<OpdResponseDto> {
    const [totalSOP, sopBerlaku, sopDraft, _count] = await Promise.all([
      this.prisma.sOP.count({ where: { opdId: opd.id } }),
      this.prisma.detailSOP.count({
        where: { sop: { opdId: opd.id }, status: StatusSOP.BERLAKU },
      }),
      this.prisma.detailSOP.count({
        where: { sop: { opdId: opd.id }, status: StatusSOP.DRAFT },
      }),
      // Get counts for all related records
      this.prisma.oPD.findUnique({
        where: { id: opd.id },
        select: {
          _count: {
            select: {
              pengguna: true,
              sop: true,
              pelaksana: true,
              anggotaTimPenyusun: true,
              pengajuanEvaluasi: true,
              peraturan: true,
            },
          },
        },
      }),
    ]);

    return {
      ...opd,
      totalSOP,
      sopBerlaku,
      sopDraft,
      _count: _count?._count,
    };
  }

  async findAll(): Promise<OpdResponseDto[]> {
    const opds = await this.prisma.oPD.findMany({
      where: { deletedAt: null },
      orderBy: { nama: 'asc' },
    });

    return Promise.all(opds.map((o) => this.attachAggregates(o)));
  }

  async findById(id: string): Promise<OpdResponseDto | null> {
    const opd = await this.prisma.oPD.findUnique({
      where: { id, deletedAt: null },
    });

    if (!opd) return null;

    return this.attachAggregates(opd);
  }

  async create(data: { nama: string }): Promise<OpdResponseDto> {
    const opd = await this.prisma.oPD.create({ data });
    return this.attachAggregates(opd);
  }

  async update(id: string, data: { nama?: string }): Promise<OpdResponseDto> {
    const opd = await this.prisma.oPD.update({ where: { id }, data });
    return this.attachAggregates(opd);
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.oPD.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async hasActivePengajuanEvaluasi(id: string): Promise<boolean> {
    const active = await this.prisma.pengajuanEvaluasi.findFirst({
      where: {
        opdId: id,
        status: {
          notIn: [StatusPengajuanEvaluasi.SELESAI],
        },
      },
      select: { id: true },
    });

    return active !== null;
  }
}
