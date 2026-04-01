import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { SopRepository } from '../repository/sop.repository';
import { CreateSopDto } from '../dto/sop.dto';
import { PeranPengguna } from '../../../generated/prisma';
import { SopMessages, GenericMessages } from '../../../common/messages';

type JwtUser = { id: string; peran: PeranPengguna; opdId: string | null };

@Injectable()
export class SopService {
  constructor(private readonly repo: SopRepository) {}

  private resolveFilter(user: JwtUser, opdId?: string, status?: string) {
    // SOP-09/10/11: role-based visibility
    if (user.peran === PeranPengguna.TIM_EVALUASI) {
      return { status: status ?? undefined, opdId };
    }
    if (user.peran !== PeranPengguna.BIRO_ORGANISASI) {
      return { opdId: user.opdId ?? undefined, status };
    }
    return { opdId, status };
  }

  async findAll(user: JwtUser, opdId?: string, status?: string) {
    const filters = this.resolveFilter(user, opdId, status);
    return this.repo.findAll(filters);
  }

  async findById(id: string, user: JwtUser) {
    const sop = await this.repo.findById(id);
    if (!sop) throw new NotFoundException(SopMessages.SOP_NOT_FOUND);

    if (
      user.peran !== PeranPengguna.BIRO_ORGANISASI &&
      user.peran !== PeranPengguna.TIM_EVALUASI &&
      sop.opdId !== user.opdId
    ) {
      throw new ForbiddenException(GenericMessages.FORBIDDEN);
    }
    return sop;
  }

  async create(dto: CreateSopDto, user: JwtUser) {
    return this.repo.create({
      judul: dto.judul,
      opdId: dto.opdId,
      logoInstansi: dto.logoInstansi,
      namaLembaga: dto.namaLembaga,
      dibuatOlehId: user.id,
    });
  }

  async update(id: string, judul: string) {
    const sop = await this.repo.findById(id);
    if (!sop) throw new NotFoundException(SopMessages.SOP_NOT_FOUND);
    return this.repo.update(id, { judul });
  }

  async delete(id: string) {
    const sop = await this.repo.findById(id);
    if (!sop) throw new NotFoundException(SopMessages.SOP_NOT_FOUND);

    // SOP-16: block delete if any DetailSOP has signatures or evaluations
    const hasRelations = await this.repo.hasSignaturesOrEvaluations(id);
    if (hasRelations) {
      throw new ConflictException(SopMessages.SOP_HAS_EVALUATION);
    }

    await this.repo.delete(id);
  }
}
