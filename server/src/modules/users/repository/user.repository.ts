import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { IUserRepository } from './user.repository.interface';

export type UserWithoutPassword = {
  id: string;
  email: string;
  nama: string;
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
      select: {
        id: true,
        email: true,
        nama: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string): Promise<UserWithoutPassword | null> {
    return this.prisma.pengguna.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nama: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(data: CreateUserDto): Promise<UserWithoutPassword> {
    return this.prisma.pengguna.create({
      data,
      select: {
        id: true,
        email: true,
        nama: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, data: UpdateUserDto): Promise<UserWithoutPassword> {
    return this.prisma.pengguna.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        nama: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.pengguna.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return this.prisma.pengguna.count();
  }

  async findByEmail(
    email: string
  ): Promise<{
    kataSandi: string;
    id: string;
    email: string;
    nama: string;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    return this.prisma.pengguna.findUnique({
      where: { email },
    });
  }
}
