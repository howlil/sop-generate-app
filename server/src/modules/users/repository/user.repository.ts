import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { IUserRepository } from './user.repository.interface';

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

  async findByEmail(
    email: string
  ): Promise<UserWithoutPassword | null> {
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

  async findByEmailWithPassword(
    email: string
  ): Promise<{
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
    return this.prisma.pengguna.findFirst({
      where: { peran: peran as any, opdId, deletedAt: null },
      select: { id: true },
    });
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
}
