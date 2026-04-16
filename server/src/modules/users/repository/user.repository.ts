import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { IUserRepository } from './user.repository.interface';
import { interpolate, UserMessages } from '../../../common/messages';

export type UserWithoutPassword = {
  id: string;
  email: string;
  nama: string;
  peran: string;
  opdId: string | null;
  nip: string;
  jabatan: string;
  pangkat: string;
  nohp: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(skip = 0, take = 10): Promise<UserWithoutPassword[]> {
    return this.prisma.pengguna.findMany({
      skip,
      take,
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        nama: true,
        peran: true,
        opdId: true,
        nip: true,
        jabatan: true,
        pangkat: true,
        nohp: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAllKepala(
    skip = 0,
    take = 100,
    opdId?: string,
  ): Promise<UserWithoutPassword[]> {
    return this.prisma.pengguna.findMany({
      skip,
      take,
      where: {
        deletedAt: null,
        peran: 'KEPALA_OPD',
        ...(opdId ? { opdId } : {}),
      },
      select: {
        id: true,
        email: true,
        nama: true,
        peran: true,
        opdId: true,
        nip: true,
        jabatan: true,
        pangkat: true,
        nohp: true,
        createdAt: true,
        updatedAt: true,
        opd: { select: { nama: true } },
      },
    }) as Promise<(UserWithoutPassword & { opd: { nama: string } | null })[]>;
  }

  async findActiveKepalaOpd(opdId: string): Promise<{ id: string } | null> {
    return this.prisma.pengguna.findFirst({
      where: {
        opdId,
        peran: 'KEPALA_OPD',
        deletedAt: null,
      },
      select: { id: true },
    });
  }

  async findById(id: string): Promise<UserWithoutPassword | null> {
    return this.prisma.pengguna.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        nama: true,
        peran: true,
        opdId: true,
        nip: true,
        jabatan: true,
        pangkat: true,
        nohp: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(data: any): Promise<UserWithoutPassword> {
    return this.prisma.pengguna.create({
      data,
      select: {
        id: true,
        email: true,
        nama: true,
        peran: true,
        opdId: true,
        nip: true,
        jabatan: true,
        pangkat: true,
        nohp: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, data: any): Promise<UserWithoutPassword> {
    return this.prisma.pengguna.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        nama: true,
        peran: true,
        opdId: true,
        nip: true,
        jabatan: true,
        pangkat: true,
        nohp: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    // [P1-G]: deactivate all active team memberships before soft-deleting
    await this.prisma.$transaction(async (tx) => {
      await tx.anggotaTimPenyusun.updateMany({
        where: { userId: id, status: 'AKTIF' },
        data: { status: 'NONAKTIF', berakhirPada: new Date() },
      });
      await tx.anggotaTimEvaluasi.updateMany({
        where: { userId: id, status: 'AKTIF' },
        data: { status: 'NONAKTIF', berakhirPada: new Date() },
      });
      await tx.pengguna.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
  }

  async count(): Promise<number> {
    return this.prisma.pengguna.count({ where: { deletedAt: null } });
  }

  async findByEmail(email: string): Promise<UserWithoutPassword | null> {
    return this.prisma.pengguna.findUnique({
      where: { email, deletedAt: null },
      select: {
        id: true,
        email: true,
        nama: true,
        peran: true,
        opdId: true,
        nip: true,
        jabatan: true,
        pangkat: true,
        nohp: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findByEmailWithPassword(email: string): Promise<{
    kataSandi: string;
    id: string;
    email: string;
    nama: string;
    peran: string;
    opdId: string | null;
    nip: string;
    jabatan: string;
    pangkat: string;
    nohp: string;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    return this.prisma.pengguna.findUnique({
      where: { email, deletedAt: null },
    });
  }

  async findByIdWithPassword(id: string): Promise<{
    kataSandi: string;
    id: string;
    email: string;
    nama: string;
    peran: string;
    opdId: string | null;
    nip: string;
    jabatan: string;
    pangkat: string;
    nohp: string;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    return this.prisma.pengguna.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async findActiveRoleInOpd(
    peran: string,
    opdId: string,
  ): Promise<{ id: string } | null> {
    // [P2-D] Use SELECT FOR UPDATE to prevent race condition
    // This locks the rows during transaction to prevent concurrent inserts
    const result = await this.prisma.$queryRaw<[{ id: string }]>`
      SELECT id FROM Pengguna
      WHERE opdId = ${opdId}
        AND peran = ${peran}
        AND deletedAt IS NULL
      FOR UPDATE
    `;

    return result.length > 0 ? result[0] : null;
  }

  async hasActiveMembership(userId: string): Promise<boolean> {
    const [penyusun, evaluasi] = await Promise.all([
      this.prisma.anggotaTimPenyusun.findFirst({
        where: { userId, status: 'AKTIF' },
        select: { id: true },
      }),
      this.prisma.anggotaTimEvaluasi.findFirst({
        where: { userId, status: 'AKTIF' },
        select: { id: true },
      }),
    ]);

    return penyusun !== null || evaluasi !== null;
  }

  async findByNip(nip: string): Promise<UserWithoutPassword | null> {
    return this.prisma.pengguna.findFirst({
      where: { nip, deletedAt: null },
      select: {
        id: true,
        email: true,
        nama: true,
        peran: true,
        opdId: true,
        nip: true,
        jabatan: true,
        pangkat: true,
        nohp: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async addToTimEvaluasi(userId: string): Promise<void> {
    // Check if already exists to avoid conflict
    const existing = await this.prisma.anggotaTimEvaluasi.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!existing) {
      await this.prisma.anggotaTimEvaluasi.create({
        data: {
          userId,
          status: 'AKTIF',
        },
      });
    }
  }

  async addToTimPenyusun(userId: string, opdId: string): Promise<void> {
    // Check if already exists to avoid conflict
    const existing = await this.prisma.anggotaTimPenyusun.findUnique({
      where: { userId_opdId: { userId, opdId } },
      select: { id: true },
    });

    if (!existing) {
      await this.prisma.anggotaTimPenyusun.create({
        data: {
          userId,
          opdId,
          status: 'AKTIF',
        },
      });
    }
  }

  // [P2-D] Create user with role lock transaction to prevent race condition
  async createWithRoleLock(
    data: any,
    peran: string,
    opdId: string,
  ): Promise<UserWithoutPassword> {
    return this.prisma.$transaction(async (tx) => {
      // [P2-D] SELECT FOR UPDATE to lock rows during check
      const existing = await tx.$queryRaw<[{ id: string }]>`
        SELECT id FROM Pengguna
        WHERE opdId = ${opdId}
          AND peran = ${peran}
          AND deletedAt IS NULL
        FOR UPDATE
      `;

      if (existing.length > 0) {
        throw new ConflictException(
          interpolate(UserMessages.OPD_ROLE_ALREADY_EXISTS, { peran }),
        );
      }

      // Also check NIP uniqueness if provided
      if (data.nip) {
        const existingByNip = await tx.pengguna.findFirst({
          where: { nip: data.nip, deletedAt: null },
          select: { id: true },
        });

        if (existingByNip) {
          throw new ConflictException(UserMessages.NIP_EXISTS);
        }
      }

      // Create the user
      const user = await tx.pengguna.create({
        data,
        select: {
          id: true,
          email: true,
          nama: true,
          peran: true,
          opdId: true,
          nip: true,
          jabatan: true,
          pangkat: true,
          nohp: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Auto-create membership entry for KOORDINATOR_TIM_PENYUSUN
      // (KEPALA_OPD doesn't need membership in AnggotaTimPenyusun)
      if (peran === 'KOORDINATOR_TIM_PENYUSUN') {
        const existingMembership = await tx.anggotaTimPenyusun.findUnique({
          where: { userId_opdId: { userId: user.id, opdId } },
          select: { id: true },
        });

        if (!existingMembership) {
          await tx.anggotaTimPenyusun.create({
            data: {
              userId: user.id,
              opdId,
              status: 'AKTIF',
            },
          });
        }
      }

      return user;
    });
  }
}
