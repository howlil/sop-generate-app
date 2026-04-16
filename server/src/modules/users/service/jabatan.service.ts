import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  UserRepository,
  UserWithoutPassword,
} from '../repository/user.repository';
import { PeranPengguna } from '../../../generated/prisma';
import type { AuthenticatedUser } from '../../../common/decorators/current-user.decorator';
import { JabatanMessages } from '../../../common/messages';

export interface RiwayatJabatanEntry {
  id: string;
  nama: string;
  nip: string;
  jabatan: string;
  opdId: string | null;
  opdNama?: string;
  peran: string;
  isActive: boolean;
  totalSopDisusun: number;
  updatedAt: Date;
}

@Injectable()
export class JabatanService {
  private readonly logger = new Logger(JabatanService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  private logJabatanChange(
    action: 'set-kepala-aktif' | 'akhiri-jabatan' | 'pindah-jabatan',
    currentUser: AuthenticatedUser,
    payload: Record<string, unknown>,
  ) {
    this.logger.log(
      JSON.stringify({
        event: 'jabatan_audit',
        action,
        actorUserId: currentUser.id,
        actorRole: currentUser.peran,
        ...payload,
      }),
    );
  }

  /**
   * Set a user as Kepala OPD for the given OPD.
   * If there's already an active Kepala OPD, they'll be changed to TIM_PENYUSUN.
   */
  async setKepalaAktif(
    userId: string,
    opdId: string,
    currentUser: AuthenticatedUser,
  ): Promise<UserWithoutPassword> {
    // Verify target user exists
    const targetUser = await this.userRepository.findById(userId);
    if (!targetUser) {
      throw new NotFoundException(JabatanMessages.USER_NOT_FOUND);
    }

    // Verify OPD exists
    const opd = await this.prisma.oPD.findUnique({
      where: { id: opdId },
    });
    if (!opd) {
      throw new NotFoundException(JabatanMessages.OPD_NOT_FOUND);
    }

    // Find current Kepala OPD for this OPD and deactivate
    const currentKepala = await this.userRepository.findActiveKepalaOpd(opdId);
    if (currentKepala && currentKepala.id !== userId) {
      // Change current Kepala to TIM_PENYUSUN
      await this.userRepository.update(currentKepala.id, {
        peran: PeranPengguna.TIM_PENYUSUN,
      });

      this.logJabatanChange('set-kepala-aktif', currentUser, {
        targetUserId: userId,
        opdId,
        replacedUserId: currentKepala.id,
      });
    }

    // Set target user as Kepala OPD
    const updatedUser = await this.userRepository.update(userId, {
      peran: PeranPengguna.KEPALA_OPD,
      opdId,
    });

    this.logJabatanChange('set-kepala-aktif', currentUser, {
      targetUserId: userId,
      opdId,
      replacedUserId: currentKepala?.id ?? null,
    });

    return updatedUser;
  }

  /**
   * End a Kepala OPD's tenure — change role to TIM_PENYUSUN.
   */
  async akhiriJabatan(
    userId: string,
    currentUser: AuthenticatedUser,
  ): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(JabatanMessages.USER_NOT_FOUND);
    }

    if (user.peran !== PeranPengguna.KEPALA_OPD) {
      throw new ConflictException(JabatanMessages.USER_NOT_KEPALA_OPD);
    }

    const updatedUser = await this.userRepository.update(userId, {
      peran: PeranPengguna.TIM_PENYUSUN,
    });

    this.logJabatanChange('akhiri-jabatan', currentUser, {
      targetUserId: userId,
      opdId: user.opdId ?? null,
    });

    return updatedUser;
  }

  /**
   * Move a Kepala OPD to a different OPD.
   * The old OPD will have no Kepala OPD after this.
   */
  async pindahJabatan(
    userId: string,
    newOpdId: string,
    currentUser: AuthenticatedUser,
  ): Promise<UserWithoutPassword> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(JabatanMessages.USER_NOT_FOUND);
    }

    // Verify new OPD exists
    const newOpd = await this.prisma.oPD.findUnique({
      where: { id: newOpdId },
    });
    if (!newOpd) {
      throw new NotFoundException(JabatanMessages.TARGET_OPD_NOT_FOUND);
    }

    // Check if new OPD already has a Kepala OPD
    const existingKepala =
      await this.userRepository.findActiveKepalaOpd(newOpdId);
    if (existingKepala && existingKepala.id !== userId) {
      throw new ConflictException(JabatanMessages.TARGET_OPD_ALREADY_HAS_KEPALA);
    }

    const updatedUser = await this.userRepository.update(userId, {
      opdId: newOpdId,
    });

    this.logJabatanChange('pindah-jabatan', currentUser, {
      targetUserId: userId,
      fromOpdId: user.opdId ?? null,
      toOpdId: newOpdId,
    });

    return updatedUser;
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
        _count: {
          select: {
            detailSopDibuat: true,
          },
        },
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
      totalSopDisusun: u._count?.detailSopDibuat ?? 0,
      updatedAt: u.updatedAt,
    }));
  }
}
