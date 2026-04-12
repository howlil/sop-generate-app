import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { JenisLampiran } from '../../../generated/prisma';

@Injectable()
export class LampiranRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ---- LampiranTeks ----

  async findLampiran(sopDetailId: string) {
    return this.prisma.lampiranTeks.findMany({ where: { sopDetailId } });
  }

  async createLampiran(sopDetailId: string, jenis: JenisLampiran, teks: string) {
    return this.prisma.lampiranTeks.create({
      data: { sopDetailId, jenis, teks },
    });
  }

  async updateLampiran(id: string, teks: string) {
    return this.prisma.lampiranTeks.update({ where: { id }, data: { teks } });
  }

  async deleteLampiran(id: string) {
    await this.prisma.lampiranTeks.delete({ where: { id } });
  }

  // ---- DasarHukum ----

  async findDasarHukum(sopDetailId: string) {
    return this.prisma.dasarHukum.findMany({
      where: { sopDetailId },
      include: {
        peraturan: {
          select: { id: true, namaPeraturan: true, nomor: true, tahun: true, tentang: true, opdId: true },
        },
      },
    });
  }

  async addDasarHukum(sopDetailId: string, peraturanId: string) {
    return this.prisma.dasarHukum.create({
      data: { sopDetailId, peraturanId },
      include: {
        peraturan: { select: { id: true, namaPeraturan: true, nomor: true, tahun: true } },
      },
    });
  }

  async removeDasarHukum(sopDetailId: string, peraturanId: string) {
    await this.prisma.dasarHukum.delete({
      where: { sopDetailId_peraturanId: { sopDetailId, peraturanId } },
    });
  }

  async dasarHukumExists(sopDetailId: string, peraturanId: string): Promise<boolean> {
    const entry = await this.prisma.dasarHukum.findUnique({
      where: { sopDetailId_peraturanId: { sopDetailId, peraturanId } },
    });
    return entry !== null;
  }

  // ---- SopTerkait ----

  async findSopTerkait(sopDetailId: string) {
    return this.prisma.sopTerkait.findMany({
      where: { sopDetailId },
      include: {
        sopTerkait: {
          select: { id: true, nomorSOP: true, sop: { select: { judul: true } } },
        },
      },
    });
  }

  async addSopTerkait(sopDetailId: string, sopTerkaitDetailId: string) {
    return this.prisma.sopTerkait.create({
      data: { sopDetailId, sopTerkaitDetailId },
    });
  }

  async removeSopTerkait(sopDetailId: string, sopTerkaitDetailId: string) {
    await this.prisma.sopTerkait.delete({
      where: { sopDetailId_sopTerkaitDetailId: { sopDetailId, sopTerkaitDetailId } },
    });
  }

  async sopTerkaitExists(sopDetailId: string, sopTerkaitDetailId: string): Promise<boolean> {
    const entry = await this.prisma.sopTerkait.findUnique({
      where: { sopDetailId_sopTerkaitDetailId: { sopDetailId, sopTerkaitDetailId } },
    });
    return entry !== null;
  }
}
