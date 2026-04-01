import { PrismaService } from '../../src/common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

/**
 * Factory for creating test users
 */
export class UserFactory {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a test user with default values
   */
  async create(overrides?: Partial<{
    email: string;
    nama: string;
    peran: string;
    opdId: string | null;
    nip: string;
    jabatan: string;
    pangkat: string;
    nohp: string;
    kataSandi: string;
  }>): Promise<{
    id: string;
    email: string;
    nama: string;
    peran: string;
    opdId: string | null;
    nip: string;
    jabatan: string;
    pangkat: string;
    nohp: string;
  }> {
    const timestamp = Date.now();
    const email = overrides?.email || `test-${timestamp}@example.com`;
    const nip = overrides?.nip || `NIP${timestamp}`;
    const plainPassword = overrides?.kataSandi || 'password123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const user = await this.prisma.pengguna.create({
      data: {
        email,
        nama: overrides?.nama || `Test User ${timestamp}`,
        peran: (overrides?.peran || 'TIM_PENYUSUN') as any,
        opdId: overrides?.opdId,
        nip,
        jabatan: overrides?.jabatan || 'Staff',
        pangkat: overrides?.pangkat || 'Penata Muda',
        nohp: overrides?.nohp || '081234567890',
        kataSandi: hashedPassword,
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
      },
    });

    return user;
  }

  /**
   * Create a BIRO_ORGANISASI user
   */
  async createBiroOrganisasi(overrides?: Partial<{
    email: string;
    nama: string;
  }>): Promise<any> {
    return this.create({
      ...overrides,
      peran: 'BIRO_ORGANISASI',
      opdId: null,
    });
  }

  /**
   * Create a TIM_EVALUASI user
   */
  async createTimEvaluasi(overrides?: Partial<{
    email: string;
    nama: string;
  }>): Promise<any> {
    return this.create({
      ...overrides,
      peran: 'TIM_EVALUASI',
      opdId: null,
    });
  }

  /**
   * Create a TIM_PENYUSUN user with OPD
   */
  async createTimPenyusun(opdId: string, overrides?: Partial<{
    email: string;
    nama: string;
  }>): Promise<any> {
    return this.create({
      ...overrides,
      peran: 'TIM_PENYUSUN',
      opdId,
    });
  }

  /**
   * Create a KEPALA_OPD user
   */
  async createKepalaOpd(opdId: string, overrides?: Partial<{
    email: string;
    nama: string;
  }>): Promise<any> {
    return this.create({
      ...overrides,
      peran: 'KEPALA_OPD',
      opdId,
    });
  }

  /**
   * Delete a test user
   */
  async delete(userId: string): Promise<void> {
    await this.prisma.pengguna.delete({
      where: { id: userId },
    });
  }
}
