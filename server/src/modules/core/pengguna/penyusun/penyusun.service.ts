import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../../../generated/prisma';
import { PeranPengguna, type Pengguna } from '../../../../generated/prisma';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import type { PenyusunOpdGrupDto } from './dto/penyusun-opd-grup.dto';
import type { PenyusunPublikItemDto } from './dto/penyusun-publik-item.dto';
import type { RiwayatOpdPenyusunItemDto } from './dto/riwayat-opd-penyusun-item.dto';
import { CreatePenyusunDto } from './dto/create-penyusun.dto';
import { UpdatePenyusunDto } from './dto/update-penyusun.dto';
import { PenyusunRepository } from './penyusun.repository';

const BCRYPT_SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = '@Password123:)' as const;

/** Pesan ketika OPD sudah punya PJ Penyusun aktif dan slot tidak boleh didobel. */
const PJ_PENYUSUN_SLOT_TAKEN_MESSAGE =
  'OPD ini sudah memiliki PJ Penyusun aktif. Ubah peran atau nonaktifkan PJ yang ada terlebih dahulu.' as const;

@Injectable()
export class PenyusunService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly penyusunRepository: PenyusunRepository,
  ) {}

  async listGrup(search?: string): Promise<PenyusunOpdGrupDto[]> {
    const rows = await this.penyusunRepository.findOpdsWithPenyusun(search);
    const trimmed = search?.trim();
    const mapped = rows.map((r) => ({
      opdId: r.opdId,
      namaOpd: r.nama,
      penyusun: r.pengguna.map((p) => this.toPublikItem(p)),
    }));
    if (trimmed) {
      return mapped.filter((g) => g.penyusun.length > 0);
    }
    return mapped;
  }

  async create(dto: CreatePenyusunDto): Promise<PenyusunPublikItemDto> {
    const opd = await this.penyusunRepository.findOpdById(dto.opdId);
    if (opd === null) {
      throw new NotFoundException('OPD tidak ditemukan');
    }
    if (dto.peran === PeranPengguna.PJ_PENYUSUN) {
      await this.assertNoOtherPjPenyusunInOpd(dto.opdId);
    }
    const hashed = await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_SALT_ROUNDS);
    try {
      const created = await this.prisma.$transaction(async (tx) => {
        const u = await tx.pengguna.create({
          data: {
            email: dto.email.trim().toLowerCase(),
            nama: dto.nama.trim(),
            nip: dto.nip.trim(),
            pangkat: dto.pangkat.trim(),
            jabatan: dto.jabatan.trim(),
            nohp: dto.nohp.trim(),
            kataSandi: hashed,
            peran: dto.peran as PeranPengguna,
            opdId: dto.opdId,
          },
        });
        if (dto.peran === PeranPengguna.PJ_PENYUSUN) {
          await tx.oPD.update({
            where: { opdId: dto.opdId },
            data: { pjPenyusunPenggunaId: u.penggunaId },
          });
        }
        await tx.riwayatOpdPengguna.create({
          data: { penggunaId: u.penggunaId, opdId: dto.opdId },
        });
        return u;
      });
      return this.toPublikItem(created);
    } catch (err: unknown) {
      this.rethrowUniqueViolation(err);
      throw err;
    }
  }

  async update(penggunaId: string, dto: UpdatePenyusunDto): Promise<PenyusunPublikItemDto> {
    const existing = await this.penyusunRepository.findPenyusunById(penggunaId);
    if (existing === null) {
      throw new NotFoundException('Penyusun tidak ditemukan');
    }
    if (!this.hasUpdatePayload(dto)) {
      throw new BadRequestException('Minimal satu field harus diisi untuk pembaruan');
    }
    const nextDeletedAt: Date | null =
      dto.status === 'NONAKTIF'
        ? new Date()
        : dto.status === 'AKTIF'
          ? null
          : existing.deletedAt;
    const willBeActive = nextDeletedAt === null;
    const peranNext = dto.peran ?? existing.peran;
    const emailNext = dto.email !== undefined ? dto.email.trim().toLowerCase() : undefined;
    const nipNext = dto.nip !== undefined ? dto.nip.trim() : undefined;
    if (emailNext !== undefined && emailNext !== existing.email) {
      const taken = await this.prisma.pengguna.count({
        where: { email: emailNext, deletedAt: null, NOT: { penggunaId } },
      });
      if (taken > 0) {
        throw new ConflictException('Email sudah digunakan pengguna lain');
      }
    }
    if (nipNext !== undefined && nipNext !== existing.nip) {
      const taken = await this.prisma.pengguna.count({
        where: { nip: nipNext, deletedAt: null, NOT: { penggunaId } },
      });
      if (taken > 0) {
        throw new ConflictException('NIP sudah digunakan pengguna lain');
      }
    }
    if (
      !willBeActive &&
      peranNext === PeranPengguna.PJ_PENYUSUN &&
      existing.peran !== PeranPengguna.PJ_PENYUSUN
    ) {
      throw new BadRequestException(
        'Tidak dapat menjadikan PJ Penyusun selagi akun nonaktif. Aktifkan akun terlebih dahulu.',
      );
    }
    if (
      willBeActive &&
      peranNext === PeranPengguna.PJ_PENYUSUN &&
      existing.peran !== PeranPengguna.PJ_PENYUSUN
    ) {
      await this.assertNoOtherPjPenyusunInOpd(existing.opdId, penggunaId);
    }
    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        if (nextDeletedAt !== null && existing.deletedAt === null) {
          await tx.oPD.updateMany({
            where: { pjPenyusunPenggunaId: penggunaId },
            data: { pjPenyusunPenggunaId: null },
          });
        }
        if (willBeActive) {
          if (
            peranNext === PeranPengguna.PJ_PENYUSUN &&
            existing.peran !== PeranPengguna.PJ_PENYUSUN
          ) {
            await tx.oPD.update({
              where: { opdId: existing.opdId },
              data: { pjPenyusunPenggunaId: penggunaId },
            });
          }
          if (
            peranNext === PeranPengguna.PENYUSUN &&
            existing.peran === PeranPengguna.PJ_PENYUSUN
          ) {
            await tx.oPD.updateMany({
              where: { pjPenyusunPenggunaId: penggunaId },
              data: { pjPenyusunPenggunaId: null },
            });
          }
        }
        const data: Prisma.PenggunaUpdateInput = {};
        if (dto.nama !== undefined) data.nama = dto.nama.trim();
        if (emailNext !== undefined) data.email = emailNext;
        if (nipNext !== undefined) data.nip = nipNext;
        if (dto.pangkat !== undefined) data.pangkat = dto.pangkat.trim();
        if (dto.jabatan !== undefined) data.jabatan = dto.jabatan.trim();
        if (dto.nohp !== undefined) data.nohp = dto.nohp.trim();
        if (dto.peran !== undefined) data.peran = dto.peran as PeranPengguna;
        if (dto.status !== undefined) {
          data.deletedAt = nextDeletedAt;
        }
        const u = await tx.pengguna.update({
          where: { penggunaId },
          data,
        });
        if (
          existing.deletedAt !== null &&
          nextDeletedAt === null &&
          u.peran === PeranPengguna.PJ_PENYUSUN
        ) {
          await tx.oPD.update({
            where: { opdId: u.opdId },
            data: { pjPenyusunPenggunaId: penggunaId },
          });
        }
        return u;
      });
      return this.toPublikItem(updated);
    } catch (err: unknown) {
      this.rethrowUniqueViolation(err);
      throw err;
    }
  }

  async nonaktifkan(penggunaId: string): Promise<void> {
    const existing = await this.penyusunRepository.findPenyusunAktifById(penggunaId);
    if (existing === null) {
      throw new NotFoundException('Penyusun tidak ditemukan');
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.oPD.updateMany({
        where: { pjPenyusunPenggunaId: penggunaId },
        data: { pjPenyusunPenggunaId: null },
      });
      await tx.pengguna.update({
        where: { penggunaId },
        data: { deletedAt: new Date() },
      });
    });
  }

  /** Mengaktifkan kembali penyusun yang dinonaktifkan (hapus soft-delete). */
  async aktifkan(penggunaId: string): Promise<PenyusunPublikItemDto> {
    const existing = await this.penyusunRepository.findPenyusunById(penggunaId);
    if (existing === null) {
      throw new NotFoundException('Penyusun tidak ditemukan');
    }
    if (existing.deletedAt === null) {
      throw new BadRequestException('Penyusun sudah aktif');
    }
    if (existing.peran === PeranPengguna.PJ_PENYUSUN) {
      await this.assertNoOtherPjPenyusunInOpd(existing.opdId, penggunaId);
    }
    try {
      const restored = await this.prisma.$transaction(async (tx) => {
        const u = await tx.pengguna.update({
          where: { penggunaId },
          data: { deletedAt: null },
        });
        if (u.peran === PeranPengguna.PJ_PENYUSUN) {
          await tx.oPD.update({
            where: { opdId: u.opdId },
            data: { pjPenyusunPenggunaId: penggunaId },
          });
        }
        return u;
      });
      return this.toPublikItem(restored);
    } catch (err: unknown) {
      this.rethrowUniqueViolation(err);
      throw err;
    }
  }

  async pindah(penggunaId: string, opdTujuanId: string): Promise<PenyusunPublikItemDto> {
    const existing = await this.penyusunRepository.findPenyusunAktifById(penggunaId);
    if (existing === null) {
      throw new NotFoundException('Penyusun tidak ditemukan');
    }
    const opdTujuan = await this.penyusunRepository.findOpdById(opdTujuanId);
    if (opdTujuan === null) {
      throw new NotFoundException('OPD tujuan tidak ditemukan');
    }
    if (existing.opdId === opdTujuanId) {
      throw new ConflictException('Penyusun sudah berada di OPD tersebut');
    }
    if (existing.peran === PeranPengguna.PJ_PENYUSUN) {
      await this.assertNoOtherPjPenyusunInOpd(opdTujuanId);
    }
    try {
      const moved = await this.prisma.$transaction(async (tx) => {
        await tx.oPD.updateMany({
          where: { pjPenyusunPenggunaId: penggunaId },
          data: { pjPenyusunPenggunaId: null },
        });
        await this.touchRiwayatOpdLink(tx, penggunaId, existing.opdId);
        if (existing.peran === PeranPengguna.PJ_PENYUSUN) {
          await tx.pengguna.update({
            where: { penggunaId },
            data: { opdId: opdTujuanId },
          });
          await tx.oPD.update({
            where: { opdId: opdTujuanId },
            data: { pjPenyusunPenggunaId: penggunaId },
          });
        } else {
          await tx.pengguna.update({
            where: { penggunaId },
            data: { opdId: opdTujuanId },
          });
        }
        await this.touchRiwayatOpdLink(tx, penggunaId, opdTujuanId);
        return tx.pengguna.findFirstOrThrow({ where: { penggunaId } });
      });
      return this.toPublikItem(moved);
    } catch (err: unknown) {
      this.rethrowUniqueViolation(err);
      throw err;
    }
  }

  /** Daftar OPD yang pernah terikat dengan penyusun (mutasi pindah menambah/memperbarui baris riwayat). */
  async listRiwayatOpdPenyusun(penggunaId: string): Promise<RiwayatOpdPenyusunItemDto[]> {
    const row = await this.penyusunRepository.findPenyusunById(penggunaId);
    if (row === null) {
      throw new NotFoundException('Penyusun tidak ditemukan');
    }
    const items = await this.penyusunRepository.findRiwayatOpdByPenggunaId(penggunaId);
    return items.map((r) => ({
      opdId: r.opdId,
      namaOpd: r.namaOpd,
      pertamaDicatat: r.pertamaDicatat,
      terakhirDiperbarui: r.terakhirDiperbarui,
    }));
  }

  async hapusPermanen(penggunaId: string): Promise<void> {
    const row = await this.penyusunRepository.findPenyusunById(penggunaId);
    if (row === null) {
      throw new NotFoundException('Penyusun tidak ditemukan');
    }
    await this.assertCanDeletePermanently(penggunaId);
    await this.prisma.pengguna.delete({ where: { penggunaId } });
  }

  private async assertCanDeletePermanently(penggunaId: string): Promise<void> {
    const row = await this.prisma.pengguna.findUnique({
      where: { penggunaId },
      include: {
        _count: {
          select: {
            detailSopDibuat: true,
            detailSopDiedit: true,
            komentar: true,
            logEditSop: true,
            logNilaiEvaluasi: true,
            nilaiEvaluasiDiisi: true,
            pengajuanEvaluasiDiselesaikan: true,
            pengajuanEvaluasiDitandatangani: true,
            pengajuanEvaluasiDiverifikasi: true,
            riwayatOpd: true,
            tandaTangan: true,
          },
        },
        opdSebagaiKepala: true,
        opdSebagaiPjPenyusun: true,
      },
    });
    if (row === null) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }
    const c = row._count;
    const sum =
      c.detailSopDibuat +
      c.detailSopDiedit +
      c.komentar +
      c.logEditSop +
      c.logNilaiEvaluasi +
      c.nilaiEvaluasiDiisi +
      c.pengajuanEvaluasiDiselesaikan +
      c.pengajuanEvaluasiDitandatangani +
      c.pengajuanEvaluasiDiverifikasi +
      c.riwayatOpd +
      c.tandaTangan;
    if (sum > 0 || row.ttePinHash !== null || row.opdSebagaiKepala !== null) {
      throw new ConflictException(
        'Tidak dapat menghapus pengguna: masih ada data yang terikat (SOP, komentar, evaluasi, atau jabatan OPD).',
      );
    }
    if (row.opdSebagaiPjPenyusun !== null) {
      throw new ConflictException(
        'Tidak dapat menghapus pengguna: masih terdaftar sebagai PJ Penyusun pada OPD.',
      );
    }
  }

  /** Mencatat / memperbarui pasangan (pengguna, OPD) di riwayat (mis. saat pindah atau kembali ke OPD lama). */
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

  /**
   * Memastikan belum ada penyusun lain dengan peran PJ_PENYUSUN aktif di OPD yang sama.
   * @param exceptPenggunaId — abaikan pengguna ini (mis. saat promosi dari PENYUSUN ke PJ).
   */
  private async assertNoOtherPjPenyusunInOpd(
    opdId: string,
    exceptPenggunaId?: string,
  ): Promise<void> {
    const lain = await this.prisma.pengguna.findFirst({
      where: {
        opdId,
        peran: PeranPengguna.PJ_PENYUSUN,
        deletedAt: null,
        ...(exceptPenggunaId !== undefined ? { NOT: { penggunaId: exceptPenggunaId } } : {}),
      },
    });
    if (lain !== null) {
      throw new ConflictException(PJ_PENYUSUN_SLOT_TAKEN_MESSAGE);
    }
  }

  private hasUpdatePayload(dto: UpdatePenyusunDto): boolean {
    return (
      dto.email !== undefined ||
      dto.nama !== undefined ||
      dto.nip !== undefined ||
      dto.peran !== undefined ||
      dto.pangkat !== undefined ||
      dto.jabatan !== undefined ||
      dto.nohp !== undefined ||
      dto.status !== undefined
    );
  }

  private rethrowUniqueViolation(err: unknown): void {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ConflictException('Email atau NIP sudah terdaftar');
    }
  }

  private toPublikItem(row: Pengguna): PenyusunPublikItemDto {
    const aktif = row.deletedAt === null;
    return {
      id: row.penggunaId,
      nama: row.nama,
      nip: row.nip,
      jabatan: row.jabatan,
      pangkat: row.pangkat,
      email: row.email,
      nohp: row.nohp,
      peran: row.peran as 'PENYUSUN' | 'PJ_PENYUSUN',
      status: aktif ? 'AKTIF' : 'NONAKTIF',
    };
  }
}
