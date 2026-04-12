import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AnggotaTimEvaluasiResponseDto } from '../dto/tim-evaluasi.dto';
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
export class TimEvaluasiRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<AnggotaTimEvaluasiResponseDto[]> {
    return this.prisma.anggotaTimEvaluasi.findMany({
      include: { user: { select: USER_SELECT } },
      orderBy: { tanggalBergabung: 'desc' },
    });
  }

  async findById(id: string): Promise<AnggotaTimEvaluasiResponseDto | null> {
    return this.prisma.anggotaTimEvaluasi.findUnique({
      where: { id },
      include: { user: { select: USER_SELECT } },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.anggotaTimEvaluasi.findUnique({
      where: { userId },
    });
  }

  async create(data: { userId: string }): Promise<AnggotaTimEvaluasiResponseDto> {
    return this.prisma.anggotaTimEvaluasi.create({
      data: {
        userId: data.userId,
        status: StatusTim.AKTIF,
      },
      include: { user: { select: USER_SELECT } },
    });
  }

  async deactivate(id: string): Promise<AnggotaTimEvaluasiResponseDto> {
    // [P1-F] Invariant: update status AND berakhirPada together
    return this.prisma.anggotaTimEvaluasi.update({
      where: { id },
      data: {
        status: StatusTim.NONAKTIF,
        berakhirPada: new Date(),
      },
      include: { user: { select: USER_SELECT } },
    });
  }
}
