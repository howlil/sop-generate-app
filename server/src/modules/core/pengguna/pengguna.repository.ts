import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import type { Pengguna, Prisma } from '../../../generated/prisma';
import { PeranPengguna } from '../../../generated/prisma';

@Injectable()
export class PenggunaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPjEvaluatorOrganisasiOpdId(): Promise<string | null> {
    const row = await this.prisma.oPD.findFirst({
      where: { isPjEvaluatorOrganisasi: true, deletedAt: null },
      select: { opdId: true },
    });
    return row?.opdId ?? null;
  }

  async findPjEvaluatorOrganisasiOpd(): Promise<{ opdId: string; nama: string } | null> {
    const row = await this.prisma.oPD.findFirst({
      where: { isPjEvaluatorOrganisasi: true, deletedAt: null },
      select: { opdId: true, nama: true },
    });
    return row ?? null;
  }

  /**
   * Semua pengguna peran EVALUATOR di OPD (termasuk yang sudah dinonaktifkan / soft delete).
   */
  async findEvaluatorsByOpd(opdId: string, search?: string): Promise<Pengguna[]> {
    const trimmed = search?.trim();
    return this.prisma.pengguna.findMany({
      where: {
        opdId,
        peran: PeranPengguna.EVALUATOR,
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
    });
  }

  /**
   * Evaluator di OPD berdasarkan id, termasuk yang sudah dinonaktifkan (untuk detail manajemen).
   */
  async findEvaluatorByIdInOpd(penggunaId: string, opdId: string): Promise<Pengguna | null> {
    return this.prisma.pengguna.findFirst({
      where: {
        penggunaId,
        opdId,
        peran: PeranPengguna.EVALUATOR,
      },
    });
  }

  async findEvaluatorAktifById(penggunaId: string, opdId: string): Promise<Pengguna | null> {
    return this.prisma.pengguna.findFirst({
      where: {
        penggunaId,
        opdId,
        peran: PeranPengguna.EVALUATOR,
        deletedAt: null,
      },
    });
  }

  async createEvaluator(data: Prisma.PenggunaCreateInput): Promise<Pengguna> {
    return this.prisma.pengguna.create({ data });
  }

  async updateEvaluator(penggunaId: string, data: Prisma.PenggunaUpdateInput): Promise<Pengguna> {
    return this.prisma.pengguna.update({
      where: { penggunaId },
      data,
    });
  }

  async softDeleteEvaluator(penggunaId: string): Promise<void> {
    await this.prisma.pengguna.update({
      where: { penggunaId },
      data: { deletedAt: new Date() },
    });
  }

  async existsEmailOtherThan(email: string, excludePenggunaId: string): Promise<boolean> {
    const n = await this.prisma.pengguna.count({
      where: {
        email,
        deletedAt: null,
        NOT: { penggunaId: excludePenggunaId },
      },
    });
    return n > 0;
  }

  async existsNipOtherThan(nip: string, excludePenggunaId: string): Promise<boolean> {
    const n = await this.prisma.pengguna.count({
      where: {
        nip,
        deletedAt: null,
        NOT: { penggunaId: excludePenggunaId },
      },
    });
    return n > 0;
  }
}
