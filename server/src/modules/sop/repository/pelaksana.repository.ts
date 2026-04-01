import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class PelaksanaRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ---- Pelaksana master data ----

  async findAll(opdId?: string) {
    return this.prisma.pelaksana.findMany({
      where: opdId ? { opdId } : undefined,
      orderBy: { namaPelaksana: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.pelaksana.findUnique({ where: { id } });
  }

  async create(data: { opdId: string; namaPelaksana: string }) {
    return this.prisma.pelaksana.create({ data });
  }

  async update(id: string, data: { namaPelaksana?: string }) {
    return this.prisma.pelaksana.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.pelaksana.delete({ where: { id } });
  }

  async isUsedInSop(id: string): Promise<boolean> {
    const count = await this.prisma.langkahSOP.count({
      where: { pelaksanaId: id },
    });
    return count > 0;
  }

  // ---- Swimlane (DetailSOPPelaksana) ----

  async findSwimlane(sopDetailId: string) {
    return this.prisma.detailSOPPelaksana.findMany({
      where: { sopDetailId },
      include: { pelaksana: true },
      orderBy: { urutan: 'asc' },
    });
  }

  async findSwimlaneEntry(sopDetailId: string, pelaksanaId: string) {
    return this.prisma.detailSOPPelaksana.findUnique({
      where: { sopDetailId_pelaksanaId: { sopDetailId, pelaksanaId } },
    });
  }

  async addToSwimlane(sopDetailId: string, pelaksanaId: string, urutan: number) {
    return this.prisma.detailSOPPelaksana.create({
      data: { sopDetailId, pelaksanaId, urutan },
      include: { pelaksana: true },
    });
  }

  async removeFromSwimlane(sopDetailId: string, pelaksanaId: string) {
    await this.prisma.detailSOPPelaksana.delete({
      where: { sopDetailId_pelaksanaId: { sopDetailId, pelaksanaId } },
    });
  }
}
