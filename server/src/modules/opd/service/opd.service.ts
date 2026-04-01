import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { OpdRepository } from '../repository/opd.repository';
import { CreateOpdDto, UpdateOpdDto, OpdResponseDto } from '../dto/opd.dto';
import { PeranPengguna } from '../../../generated/prisma';
import { OpdMessages, GenericMessages } from '../../../common/messages';

type JwtUser = {
  id: string;
  peran: PeranPengguna;
  opdId: string | null;
};

@Injectable()
export class OpdService {
  constructor(private readonly opdRepository: OpdRepository) {}

  async findAll(user: JwtUser): Promise<OpdResponseDto[]> {
    const all = await this.opdRepository.findAll();

    // OPD-05: non-BIRO roles only see their own OPD
    if (user.peran !== PeranPengguna.BIRO_ORGANISASI) {
      return all.filter((o) => o.id === user.opdId);
    }

    return all;
  }

  async findById(id: string, user: JwtUser): Promise<OpdResponseDto> {
    const opd = await this.opdRepository.findById(id);

    if (!opd) {
      throw new NotFoundException(OpdMessages.OPD_NOT_FOUND);
    }

    // OPD-05: non-BIRO roles can only access their own OPD
    if (
      user.peran !== PeranPengguna.BIRO_ORGANISASI &&
      user.peran !== PeranPengguna.TIM_EVALUASI &&
      opd.id !== user.opdId
    ) {
      throw new ForbiddenException(GenericMessages.FORBIDDEN);
    }

    return opd;
  }

  async create(dto: CreateOpdDto): Promise<OpdResponseDto> {
    return this.opdRepository.create({ nama: dto.nama });
  }

  async update(id: string, dto: UpdateOpdDto): Promise<OpdResponseDto> {
    const opd = await this.opdRepository.findById(id);

    if (!opd) {
      throw new NotFoundException(OpdMessages.OPD_NOT_FOUND);
    }

    return this.opdRepository.update(id, { nama: dto.nama });
  }

  async softDelete(id: string): Promise<void> {
    const opd = await this.opdRepository.findById(id);

    if (!opd) {
      throw new NotFoundException(OpdMessages.OPD_NOT_FOUND);
    }

    // OPD-04 / [P1-G]: cek tidak ada pengajuan evaluasi aktif
    const hasActive = await this.opdRepository.hasActivePengajuanEvaluasi(id);
    if (hasActive) {
      throw new ConflictException(OpdMessages.OPD_HAS_ACTIVE_EVALUATION);
    }

    await this.opdRepository.softDelete(id);
  }
}
