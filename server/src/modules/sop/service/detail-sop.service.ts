import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DetailSopRepository } from '../repository/detail-sop.repository';
import { UpdateMetadataDto, UpdateStatusDto } from '../dto/detail-sop.dto';
import { PeranPengguna, StatusSOP } from '../../../generated/prisma';
import {
  DetailSopMessages,
  GenericMessages,
  interpolate,
} from '../../../common/messages';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  assertValidSopTransition,
  isSopStatusTerminal,
} from '../../../common/validators';

type JwtUser = { id: string; peran: PeranPengguna; opdId: string | null };

// Role allowed to perform each forward transition
const TRANSITION_ROLES: Partial<Record<StatusSOP, PeranPengguna[]>> = {
  [StatusSOP.SEDANG_DISUSUN]: [
    PeranPengguna.TIM_PENYUSUN,
    PeranPengguna.KOORDINATOR_TIM_PENYUSUN,
  ],
  [StatusSOP.SIAP_DIEVALUASI]: [
    PeranPengguna.TIM_PENYUSUN,
    PeranPengguna.KOORDINATOR_TIM_PENYUSUN,
  ],
  [StatusSOP.DIAJUKAN_EVALUASI]: [PeranPengguna.KOORDINATOR_TIM_PENYUSUN],
};

const EDITABLE_STATUSES = new Set<StatusSOP>([
  StatusSOP.DRAFT,
  StatusSOP.SEDANG_DISUSUN,
  StatusSOP.REVISI_DARI_TIM_EVALUASI,
]);

@Injectable()
export class DetailSopService {
  constructor(
    private readonly repo: DetailSopRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(
    user: JwtUser,
    sopId?: string,
    opdId?: string,
    status?: StatusSOP,
  ) {
    const effectiveOpdId =
      user.peran !== PeranPengguna.BIRO_ORGANISASI &&
      user.peran !== PeranPengguna.TIM_EVALUASI
        ? (user.opdId ?? undefined)
        : opdId;

    return this.repo.findAll({
      sopId,
      opdId: effectiveOpdId,
      status,
    });
  }

  async findById(id: string, user: JwtUser) {
    const detail = await this.repo.findById(id);
    if (!detail)
      throw new NotFoundException(DetailSopMessages.DETAIL_SOP_NOT_FOUND);

    if (
      user.peran !== PeranPengguna.BIRO_ORGANISASI &&
      user.peran !== PeranPengguna.TIM_EVALUASI &&
      (detail as any).sop?.opdId !== user.opdId
    ) {
      throw new ForbiddenException(GenericMessages.FORBIDDEN);
    }
    return detail;
  }

  async updateMetadata(id: string, dto: UpdateMetadataDto, user: JwtUser) {
    const detail = await this.repo.findById(id);
    if (!detail)
      throw new NotFoundException(DetailSopMessages.DETAIL_SOP_NOT_FOUND);

    if (!EDITABLE_STATUSES.has(detail.status)) {
      throw new BadRequestException(
        `Detail SOP berstatus ${detail.status} tidak dapat diedit`,
      );
    }

    return this.repo.updateMetadata(id, dto, user.id);
  }

  async updateStatus(id: string, dto: UpdateStatusDto, user: JwtUser) {
    const detail = await this.repo.findById(id);
    if (!detail)
      throw new NotFoundException(DetailSopMessages.DETAIL_SOP_NOT_FOUND);

    // SOP-15: terminal statuses
    if (isSopStatusTerminal(detail.status)) {
      throw new BadRequestException(
        interpolate(DetailSopMessages.CANNOT_UPDATE_TERMINAL_STATUS, {
          status: detail.status,
        }),
      );
    }

    assertValidSopTransition(detail.status, dto.status);

    // Check role permission for the target status
    const allowedRoles = TRANSITION_ROLES[dto.status];
    if (allowedRoles && !allowedRoles.includes(user.peran)) {
      throw new ForbiddenException(
        `Peran ${user.peran} tidak memiliki izin untuk transisi ke ${dto.status}`,
      );
    }

    // SOP-13 / [P0-B]: cannot have two BERLAKU for same SOP
    // Use transaction with SELECT FOR UPDATE to prevent race condition
    if (dto.status === StatusSOP.BERLAKU) {
      const sopId = (detail as any).sopId;

      await this.prisma.$transaction(
        async (tx) => {
          // Lock SOP row to prevent concurrent BERLAKU creation
          await this.repo.lockSopForUpdate(sopId, tx);

          // Check if another BERLAKU version exists
          const berlakuCount = await this.repo.countBerlakuBySopId(sopId, tx);
          if (berlakuCount > 0) {
            throw new ConflictException(DetailSopMessages.EVALUATION_EXISTS);
          }

          // Update status within transaction
          await this.repo.updateStatus(id, dto.status, user.id);
        },
        {
          isolationLevel: 'Serializable',
        },
      );

      // Return updated detail
      return this.repo.findById(id);
    }

    return this.repo.updateStatus(id, dto.status, user.id);
  }
}
