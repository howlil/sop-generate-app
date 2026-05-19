import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import type { Pengguna, Prisma } from '../../../generated/prisma';
import { PeranPengguna } from '../../../generated/prisma';

const BIRO_BELUM_DIKONFIGURASI_MESSAGE =
  'OPD PJ Evaluator Organisasi belum dikonfigurasi. Hubungi administrator sistem.' as const;
const EVALUATOR_HARUS_DARI_BIRO_MESSAGE =
  'Evaluator hanya boleh ditambahkan pada OPD Biro Organisasi' as const;

@Injectable()
export class PenggunaRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * OPD "biro" = `opdId` dari pengguna aktif berperan PJ_EVALUATOR (invariant di layanan).
   */
  async findPjEvaluatorOrganisasiOpdId(): Promise<string | null> {
    const row = await this.prisma.pengguna.findFirst({
      where: { peran: PeranPengguna.PJ_EVALUATOR, deletedAt: null },
      select: { opdId: true },
    });
    return row?.opdId ?? null;
  }

  async findPjEvaluatorOrganisasiOpd(): Promise<{ opdId: string; nama: string } | null> {
    const row = await this.prisma.pengguna.findFirst({
      where: { peran: PeranPengguna.PJ_EVALUATOR, deletedAt: null },
      select: { opdId: true, opd: { select: { nama: true } } },
    });
    if (row === null) {
      return null;
    }
    return { opdId: row.opdId, nama: row.opd.nama };
  }

  /** Jumlah pengguna aktif dengan peran tertentu di OPD (opsional abaikan satu pengguna). */
  async countAktifByOpdIdAndPeran(
    opdId: string,
    peran: PeranPengguna,
    exceptPenggunaId?: string,
  ): Promise<number> {
    return this.prisma.pengguna.count({
      where: {
        opdId,
        peran,
        deletedAt: null,
        ...(exceptPenggunaId !== undefined ? { NOT: { penggunaId: exceptPenggunaId } } : {}),
      },
    });
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

  async createEvaluator(
    data: Omit<Prisma.PenggunaCreateInput, 'opd'> & { opd?: Prisma.PenggunaCreateInput['opd'] },
  ): Promise<Pengguna> {
    const biroOpdId = await this.findPjEvaluatorOrganisasiOpdId();
    if (biroOpdId === null) {
      throw new ServiceUnavailableException(BIRO_BELUM_DIKONFIGURASI_MESSAGE);
    }
    const requestedOpdId = this.resolveOpdIdFromCreateInput(data);
    if (requestedOpdId !== null && requestedOpdId !== biroOpdId) {
      throw new BadRequestException(EVALUATOR_HARUS_DARI_BIRO_MESSAGE);
    }
    const createData: Prisma.PenggunaCreateInput =
      requestedOpdId === null
        ? { ...data, opd: { connect: { opdId: biroOpdId } } }
        : (data as Prisma.PenggunaCreateInput);
    return this.prisma.pengguna.create({ data: createData });
  }

  private resolveOpdIdFromCreateInput(
    data: Omit<Prisma.PenggunaCreateInput, 'opd'> & { opd?: Prisma.PenggunaCreateInput['opd'] },
  ): string | null {
    const opd = data.opd;
    if (opd === undefined || opd === null) {
      return null;
    }
    if ('connect' in opd && opd.connect !== undefined && 'opdId' in opd.connect) {
      const opdId = opd.connect.opdId;
      return opdId ?? null;
    }
    return null;
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
