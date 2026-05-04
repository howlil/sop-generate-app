import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../../../generated/prisma';
import { PeranPengguna } from '../../../../generated/prisma';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { CreateKepalaOpdDto } from './dto/create-kepala-opd.dto';
import { KepalaOpdPublicDto } from './dto/kepala-opd-public.dto';
import { KepalaOpdRiwayatItemDto } from './dto/kepala-opd-riwayat-item.dto';
import { UpdateKepalaOpdDto } from './dto/update-kepala-opd.dto';
import { KepalaOpdRepository, type KepalaOpdWithCounts } from './kepala-opd.repository';

const BCRYPT_SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = '@Password123:)' as const;

@Injectable()
export class KepalaOpdService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly kepalaOpdRepository: KepalaOpdRepository,
  ) {}

  async findAll(search?: string): Promise<KepalaOpdPublicDto[]> {
    const rows = await this.kepalaOpdRepository.findManyKepala(search);
    return rows.map((r) => this.toPublic(r));
  }

  async create(dto: CreateKepalaOpdDto): Promise<KepalaOpdPublicDto> {
    const opd = await this.kepalaOpdRepository.findOpdAktifById(dto.opdId);
    if (opd === null) {
      throw new NotFoundException('OPD tidak ditemukan');
    }
    if (opd.kepalaPenggunaId !== null) {
      const slotUser = await this.prisma.pengguna.findUnique({
        where: { penggunaId: opd.kepalaPenggunaId },
      });
      if (slotUser !== null && slotUser.deletedAt === null) {
        throw new ConflictException(
          'OPD ini sudah memiliki Kepala OPD aktif. Nonaktifkan atau akhiri jabatan yang ada terlebih dahulu.',
        );
      }
    }
    const hashed = await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_SALT_ROUNDS);
    try {
      const created = await this.prisma.$transaction(async (tx) => {
        if (opd.kepalaPenggunaId !== null) {
          await tx.oPD.update({
            where: { opdId: dto.opdId },
            data: { kepalaPenggunaId: null },
          });
        }
        const u = await tx.pengguna.create({
          data: {
            email: dto.email.trim().toLowerCase(),
            nama: dto.nama.trim(),
            nip: dto.nip.trim(),
            pangkat: dto.pangkat.trim(),
            jabatan: dto.jabatan.trim(),
            nohp: dto.nohp.trim(),
            kataSandi: hashed,
            peran: PeranPengguna.KEPALA_OPD,
            opdId: dto.opdId,
          },
        });
        await tx.oPD.update({
          where: { opdId: dto.opdId },
          data: { kepalaPenggunaId: u.penggunaId },
        });
        await this.touchRiwayatOpdLink(tx, u.penggunaId, dto.opdId);
        return u;
      });
      const full = await this.kepalaOpdRepository.findKepalaById(created.penggunaId);
      if (full === null) {
        throw new NotFoundException('Kepala OPD tidak ditemukan setelah dibuat');
      }
      return this.toPublic(full);
    } catch (err: unknown) {
      this.rethrowUniqueViolation(err);
      throw err;
    }
  }

  async update(penggunaId: string, dto: UpdateKepalaOpdDto): Promise<KepalaOpdPublicDto> {
    const existing = await this.kepalaOpdRepository.findKepalaById(penggunaId);
    if (existing === null) {
      throw new NotFoundException('Kepala OPD tidak ditemukan');
    }
    if (!this.hasUpdatePayload(dto)) {
      throw new BadRequestException('Minimal satu field harus diisi untuk pembaruan');
    }
    try {
      await this.prisma.$transaction(async (tx) => {
        if (dto.opdId !== undefined && dto.opdId !== existing.opdId) {
          if (existing.deletedAt !== null) {
            throw new BadRequestException(
              'Akun nonaktif tidak dapat dipindahkan. Aktifkan kembali terlebih dahulu.',
            );
          }
          await this.applyPindahOpd(tx, existing, dto.opdId);
        }
        const data: Prisma.PenggunaUpdateInput = {};
        if (dto.nama !== undefined) {
          data.nama = dto.nama.trim();
        }
        if (dto.email !== undefined) {
          data.email = dto.email.trim().toLowerCase();
        }
        if (dto.nip !== undefined) {
          data.nip = dto.nip.trim();
        }
        if (dto.jabatan !== undefined) {
          data.jabatan = dto.jabatan.trim();
        }
        if (dto.pangkat !== undefined) {
          data.pangkat = dto.pangkat.trim();
        }
        if (dto.nohp !== undefined) {
          data.nohp = dto.nohp.trim();
        }
        if (dto.status === 'NONAKTIF') {
          data.deletedAt = new Date();
        } else if (dto.status === 'AKTIF') {
          data.deletedAt = null;
        }
        if (Object.keys(data).length > 0) {
          await tx.pengguna.update({
            where: { penggunaId },
            data,
          });
        }
        if (dto.status === 'NONAKTIF') {
          await tx.oPD.updateMany({
            where: { kepalaPenggunaId: penggunaId },
            data: { kepalaPenggunaId: null },
          });
        }
        if (dto.status === 'AKTIF' && existing.deletedAt !== null) {
          const u = await tx.pengguna.findUnique({ where: { penggunaId } });
          if (u === null) {
            throw new NotFoundException('Kepala OPD tidak ditemukan');
          }
          const opdRow = await tx.oPD.findUnique({ where: { opdId: u.opdId } });
          if (opdRow === null) {
            throw new NotFoundException('OPD tidak ditemukan');
          }
          if (
            opdRow.kepalaPenggunaId !== null &&
            opdRow.kepalaPenggunaId !== penggunaId
          ) {
            const other = await tx.pengguna.findUnique({
              where: { penggunaId: opdRow.kepalaPenggunaId },
            });
            if (other?.deletedAt === null) {
              throw new ConflictException(
                'OPD masih memiliki Kepala OPD aktif lain. Nonaktifkan yang ada terlebih dahulu.',
              );
            }
            await tx.oPD.update({
              where: { opdId: u.opdId },
              data: { kepalaPenggunaId: null },
            });
          }
          await tx.oPD.update({
            where: { opdId: u.opdId },
            data: { kepalaPenggunaId: penggunaId },
          });
        }
      });
      const full = await this.kepalaOpdRepository.findKepalaById(penggunaId);
      if (full === null) {
        throw new NotFoundException('Kepala OPD tidak ditemukan');
      }
      return this.toPublic(full);
    } catch (err: unknown) {
      this.rethrowUniqueViolation(err);
      throw err;
    }
  }

  async remove(penggunaId: string): Promise<void> {
    const existing = await this.kepalaOpdRepository.findKepalaById(penggunaId);
    if (existing === null) {
      throw new NotFoundException('Kepala OPD tidak ditemukan');
    }
    const totalSop = existing._count.detailSopDibuat;
    if (totalSop > 0) {
      throw new ConflictException(
        'Tidak dapat menghapus Kepala OPD yang masih memiliki SOP yang dibuat.',
      );
    }
    await this.prisma.$transaction(async (tx) => {
      await this.clearKepalaSlotIfMatches(tx, existing.opdId, penggunaId);
      await tx.pengguna.update({
        where: { penggunaId },
        data: { deletedAt: new Date() },
      });
    });
  }

  async listRiwayatOpd(penggunaId: string): Promise<KepalaOpdRiwayatItemDto[]> {
    const existing = await this.kepalaOpdRepository.findKepalaById(penggunaId);
    if (existing === null) {
      throw new NotFoundException('Kepala OPD tidak ditemukan');
    }
    const rows = await this.kepalaOpdRepository.findRiwayatRowsForPengguna(penggunaId);
    return rows.map((r) => ({
      opdId: r.opdId,
      namaOpd: r.opd.nama,
      dicatatPada: r.createdAt,
      diperbaruiPada: r.updatedAt,
    }));
  }

  private async applyPindahOpd(
    tx: Prisma.TransactionClient,
    existing: KepalaOpdWithCounts,
    opdTujuanId: string,
  ): Promise<void> {
    if (opdTujuanId === existing.opdId) {
      return;
    }
    const opdTujuan = await tx.oPD.findFirst({
      where: { opdId: opdTujuanId, deletedAt: null },
    });
    if (opdTujuan === null) {
      throw new NotFoundException('OPD tujuan tidak ditemukan');
    }
    if (
      opdTujuan.kepalaPenggunaId !== null &&
      opdTujuan.kepalaPenggunaId !== existing.penggunaId
    ) {
      const lain = await tx.pengguna.findUnique({
        where: { penggunaId: opdTujuan.kepalaPenggunaId },
      });
      if (lain !== null && lain.deletedAt === null) {
        throw new ConflictException(
          'OPD tujuan sudah memiliki Kepala OPD aktif. Nonaktifkan atau pindahkan yang ada terlebih dahulu.',
        );
      }
      await tx.oPD.update({
        where: { opdId: opdTujuanId },
        data: { kepalaPenggunaId: null },
      });
    }
    await tx.oPD.updateMany({
      where: { kepalaPenggunaId: existing.penggunaId },
      data: { kepalaPenggunaId: null },
    });
    await tx.pengguna.update({
      where: { penggunaId: existing.penggunaId },
      data: { opdId: opdTujuanId },
    });
    await tx.oPD.update({
      where: { opdId: opdTujuanId },
      data: { kepalaPenggunaId: existing.penggunaId },
    });
    await this.touchRiwayatOpdLink(tx, existing.penggunaId, opdTujuanId);
  }

  private async clearKepalaSlotIfMatches(
    tx: Prisma.TransactionClient,
    opdId: string,
    penggunaId: string,
  ): Promise<void> {
    const o = await tx.oPD.findUnique({ where: { opdId } });
    if (o?.kepalaPenggunaId === penggunaId) {
      await tx.oPD.update({
        where: { opdId },
        data: { kepalaPenggunaId: null },
      });
    }
  }

  private async touchRiwayatOpdLink(
    tx: Prisma.TransactionClient,
    penggunaId: string,
    opdId: string,
  ): Promise<void> {
    await tx.riwayatOpdPengguna.upsert({
      where: {
        penggunaId_opdId: { penggunaId, opdId },
      },
      create: { penggunaId, opdId },
      update: { updatedAt: new Date() },
    });
  }

  private hasUpdatePayload(dto: UpdateKepalaOpdDto): boolean {
    return (
      dto.opdId !== undefined ||
      dto.nama !== undefined ||
      dto.email !== undefined ||
      dto.nip !== undefined ||
      dto.jabatan !== undefined ||
      dto.pangkat !== undefined ||
      dto.nohp !== undefined ||
      dto.status !== undefined
    );
  }

  private rethrowUniqueViolation(err: unknown): void {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ConflictException('Email atau NIP sudah terdaftar');
    }
  }

  private toPublic(row: KepalaOpdWithCounts): KepalaOpdPublicDto {
    return {
      id: row.penggunaId,
      nama: row.nama,
      nip: row.nip,
      email: row.email,
      nohp: row.nohp,
      jabatan: row.jabatan,
      pangkat: row.pangkat,
      opdId: row.opdId,
      namaOpd: row.opd.nama,
      isActive: row.deletedAt === null,
      updatedAt: row.updatedAt,
      dapatDihapus: row._count.detailSopDibuat === 0,
    };
  }
}
