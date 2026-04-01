import { PrismaService } from '../../src/common/prisma/prisma.service';

/**
 * Factory for creating test OPD (Organisasi Perangkat Daerah)
 */
export class OpdFactory {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a test OPD
   */
  async create(overrides?: Partial<{
    nama: string;
  }>): Promise<{ id: string; nama: string }> {
    const timestamp = Date.now();
    const opd = await this.prisma.oPD.create({
      data: {
        nama: overrides?.nama || `Test OPD ${timestamp}`,
      },
      select: {
        id: true,
        nama: true,
      },
    });

    return opd;
  }

  /**
   * Delete a test OPD
   */
  async delete(opdId: string): Promise<void> {
    await this.prisma.oPD.delete({
      where: { id: opdId },
    });
  }
}

/**
 * Factory for creating test SOP
 */
export class SopFactory {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a test SOP with initial DetailSOP (DRAFT status)
   */
  async create(overrides?: Partial<{
    judul: string;
    opdId: string;
    logoInstansi: string;
    namaLembaga: string;
    dibuatOlehId: string;
  }>): Promise<{
    id: string;
    judul: string;
    opdId: string;
    detailSops: Array<{
      id: string;
      status: string;
      versi: number;
      nomorSOP: string;
    }>;
  }> {
    const timestamp = Date.now();
    const sop = await this.prisma.sOP.create({
      data: {
        judul: overrides?.judul || `SOP Test ${timestamp}`,
        opdId: overrides?.opdId!,
        detailSops: {
          create: {
            nomorSOP: `SOP/TEST/${timestamp}`,
            logoInstansi: overrides?.logoInstansi || 'https://example.com/logo.png',
            namaLembaga: overrides?.namaLembaga || 'Test Institution',
            dibuatOlehId: overrides?.dibuatOlehId,
          },
        },
      },
      include: {
        detailSops: {
          select: {
            id: true,
            status: true,
            versi: true,
            nomorSOP: true,
          },
        },
      },
    });

    return sop;
  }

  /**
   * Delete a test SOP (and its DetailSOPs via cascade)
   */
  async delete(sopId: string): Promise<void> {
    await this.prisma.sOP.delete({
      where: { id: sopId },
    });
  }
}
