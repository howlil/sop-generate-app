import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UserRepository, UserWithoutPassword } from '../repository/user.repository';
import { PeranPengguna } from '../../../generated/prisma';

export interface RiwayatJabatanEntry {
  id: string;
  nama: string;
  nip: string;
  jabatan: string;
  opdId: string | null;
  opdNama?: string;
  peran: string;
  isActive: boolean;
  updatedAt: Date;
}

@Injectable()
export class JabatanService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Set a user as Kepala OPD for the given OPD.
   * If there's already an active Kepala OPD, they'll be changed to TIM_PENYUSUN.
   */
  async setKepalaAktif(
    userId: string,
    opdId: string,
    _currentUser: any,
  ): Promise<UserWithoutPassword> {
    // Verify target user exists
    const targetUser = await this.userRepository.findById(userId);
    if (!targetUser) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Verify OPD exists
    const opd = await this.prisma.oPD.findUnique({
      where: { id: opdId },
    });
    if (!opd) {
      throw new NotFoundException('OPD tidak ditemukan');
    }

    // Find current Kepala OPD for this OPD and deactivate
    const currentKepala = await this.userRepository.findActiveKepalaOpd(opdId);
    if (currentKepala && currentKepala.id !== userId) {
      // Change current Kepala to TIM_PENYUSUN
      await this.userRepository.update(currentKepala.id, {
        peran: PeranPengguna.TIM_PENYUSUN,
      });
    }

    // Set target user as Kepala OPD
    return this.userRepository.update(userId, {
      peran: PeranPengguna.KEPALA_OPD,
      opdId,
    });
  }

  /**
   * End a Kepala OPD's tenure — change role to TIM_PENYUSUN.
   */
  async akhiriJabatan(
    userId: string,
    _currentUser: any,
  ): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (user.peran !== PeranPengguna.KEPALA_OPD) {
      throw new ConflictException('User bukan Kepala OPD');
    }

    return this.userRepository.update(userId, {
      peran: PeranPengguna.TIM_PENYUSUN,
    });
  }

  /**
   * Move a Kepala OPD to a different OPD.
   * The old OPD will have no Kepala OPD after this.
   */
  async pindahJabatan(
    userId: string,
    newOpdId: string,
    _currentUser: any,
  ): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Verify new OPD exists
    const newOpd = await this.prisma.oPD.findUnique({
      where: { id: newOpdId },
    });
    if (!newOpd) {
      throw new NotFoundException('OPD tujuan tidak ditemukan');
    }

    // Check if new OPD already has a Kepala OPD
    const existingKepala = await this.userRepository.findActiveKepalaOpd(newOpdId);
    if (existingKepala && existingKepala.id !== userId) {
      throw new ConflictException('OPD tujuan sudah memiliki Kepala OPD aktif');
    }

    return this.userRepository.update(userId, {
      opdId: newOpdId,
    });
  }

  /**
   * Get list of all Kepala OPD (current + history based on role).
   */
  async getRiwayat(opdId?: string): Promise<RiwayatJabatanEntry[]> {
    const users = await this.prisma.pengguna.findMany({
      where: {
        deletedAt: null,
        peran: 'KEPALA_OPD',
        ...(opdId ? { opdId } : {}),
      },
      include: {
        opd: { select: { nama: true } },
      },
    });

    return users.map((u) => ({
      id: u.id,
      nama: u.nama,
      nip: u.nip,
      jabatan: u.jabatan,
      opdId: u.opdId,
      opdNama: u.opd?.nama,
      peran: u.peran,
      isActive: u.peran === 'KEPALA_OPD',
      updatedAt: u.updatedAt,
    }));
  }
}
