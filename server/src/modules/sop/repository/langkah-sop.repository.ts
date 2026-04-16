import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';

@Injectable()
export class LangkahSopRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(sopDetailId: string) {
    return this.prisma.langkahSOP.findMany({
      where: { sopDetailId },
      orderBy: { urutan: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.langkahSOP.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.langkahSOP.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.langkahSOP.update({ where: { id }, data });
  }

  async delete(id: string) {
    // [PLK-07] / [P0-A]: Delete DiagramEdge + DiagramNodePosition before LangkahSOP
    await this.prisma.$transaction(async (tx) => {
      // Delete diagram edges that reference this step (both incoming and outgoing)
      await tx.diagramEdge.deleteMany({
        where: {
          OR: [{ dariLangkahId: id }, { keLangkahId: id }],
        },
      });

      // Delete diagram node positions for this step
      await tx.diagramNodePosition.deleteMany({
        where: { langkahSopId: id },
      });

      // Clear self-referential next-step pointers in other langkah
      await tx.langkahSOP.updateMany({
        where: {
          OR: [
            { langkahSelanjutnyaYaId: id },
            { langkahSelanjutnyaTidakId: id },
          ],
        },
        data: {
          langkahSelanjutnyaYaId: null,
          langkahSelanjutnyaTidakId: null,
        },
      });

      await tx.langkahSOP.delete({ where: { id } });
    });
  }

  async findByUrutanInDetail(
    sopDetailId: string,
    urutan: number,
    excludeId?: string,
  ) {
    return this.prisma.langkahSOP.findFirst({
      where: {
        sopDetailId,
        urutan,
        id: excludeId ? { not: excludeId } : undefined,
      },
    });
  }

  async isSwimlaneMember(
    sopDetailId: string,
    pelaksanaId: string,
  ): Promise<boolean> {
    const entry = await this.prisma.detailSOPPelaksana.findUnique({
      where: { sopDetailId_pelaksanaId: { sopDetailId, pelaksanaId } },
    });
    return entry !== null;
  }
}
