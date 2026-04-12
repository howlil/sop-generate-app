import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { IPeraturanRepository } from './peraturan.repository.interface';
import { PeraturanResponseDto } from '../dto/peraturan.dto';

@Injectable()
export class PeraturanRepository implements IPeraturanRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDto(
    p: any & { _count: { dasarHukum: number } },
  ): PeraturanResponseDto {
    const { _count, ...rest } = p;
    return { ...rest, digunakan: _count.dasarHukum };
  }

  async findAll(opdId?: string): Promise<PeraturanResponseDto[]> {
    const records = await this.prisma.peraturan.findMany({
      where: opdId ? { opdId } : undefined,
      include: { _count: { select: { dasarHukum: true } } },
      orderBy: [{ tahun: 'desc' }, { nomor: 'asc' }],
    });

    return records.map((r) => this.toDto(r));
  }

  async findById(id: string): Promise<PeraturanResponseDto | null> {
    const record = await this.prisma.peraturan.findUnique({
      where: { id },
      include: { _count: { select: { dasarHukum: true } } },
    });

    if (!record) return null;

    return this.toDto(record);
  }

  async create(data: {
    opdId: string;
    namaPeraturan: string;
    nomor: string;
    tahun: number;
    tentang: string;
  }): Promise<PeraturanResponseDto> {
    const record = await this.prisma.peraturan.create({
      data,
      include: { _count: { select: { dasarHukum: true } } },
    });

    return this.toDto(record);
  }

  async update(
    id: string,
    data: { namaPeraturan?: string; nomor?: string; tahun?: number; tentang?: string },
  ): Promise<PeraturanResponseDto> {
    const record = await this.prisma.peraturan.update({
      where: { id },
      data,
      include: { _count: { select: { dasarHukum: true } } },
    });

    return this.toDto(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.peraturan.delete({ where: { id } });
  }

  async isUsedAsDasarHukum(id: string): Promise<boolean> {
    const count = await this.prisma.dasarHukum.count({
      where: { peraturanId: id },
    });

    return count > 0;
  }
}
