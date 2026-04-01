import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { TimPenyusunRepository } from '../repository/tim-penyusun.repository';
import {
  CreateTimPenyusunDto,
  PindahTimPenyusunDto,
  AnggotaTimPenyusunResponseDto,
} from '../dto/tim-penyusun.dto';
import { PeranPengguna, StatusTim } from '../../../generated/prisma';
import { TimMessages } from '../../../common/messages';

type JwtUser = {
  id: string;
  peran: PeranPengguna;
  opdId: string | null;
};

@Injectable()
export class TimPenyusunService {
  constructor(private readonly repo: TimPenyusunRepository) {}

  async findAll(
    user: JwtUser,
    opdId?: string,
  ): Promise<AnggotaTimPenyusunResponseDto[]> {
    // Non-BIRO roles see only their own OPD
    const filterOpdId =
      user.peran === PeranPengguna.BIRO_ORGANISASI
        ? opdId
        : user.opdId ?? undefined;

    return this.repo.findAll(filterOpdId);
  }

  async findById(id: string): Promise<AnggotaTimPenyusunResponseDto> {
    const member = await this.repo.findById(id);

    if (!member) {
      throw new NotFoundException(TimMessages.TIM_NOT_FOUND);
    }

    return member;
  }

  async tambah(dto: CreateTimPenyusunDto): Promise<AnggotaTimPenyusunResponseDto> {
    // TIM-06: unique [userId, opdId]
    const existing = await this.repo.findByUserAndOpd(dto.userId, dto.opdId);
    if (existing) {
      throw new ConflictException(
        'Pengguna sudah terdaftar sebagai anggota di OPD ini',
      );
    }

    return this.repo.create({ userId: dto.userId, opdId: dto.opdId });
  }

  async nonaktifkan(id: string): Promise<AnggotaTimPenyusunResponseDto> {
    const member = await this.repo.findById(id);

    if (!member) {
      throw new NotFoundException(TimMessages.TIM_NOT_FOUND);
    }

    if (member.status === StatusTim.NONAKTIF) {
      throw new ConflictException(TimMessages.TIM_ALREADY_INACTIVE);
    }

    return this.repo.deactivate(id);
  }

  async pindah(
    id: string,
    dto: PindahTimPenyusunDto,
  ): Promise<AnggotaTimPenyusunResponseDto> {
    const member = await this.repo.findById(id);

    if (!member) {
      throw new NotFoundException(TimMessages.TIM_NOT_FOUND);
    }

    if (member.status === StatusTim.NONAKTIF) {
      throw new BadRequestException(
        'Anggota yang sudah nonaktif tidak dapat dipindahkan',
      );
    }

    if (member.opdId === dto.opdIdBaru) {
      throw new BadRequestException(TimMessages.TIM_SAME_OPD);
    }

    // TIM-06: check no existing active membership in target OPD
    const existingInTarget = await this.repo.findByUserAndOpd(
      member.userId,
      dto.opdIdBaru,
    );
    if (existingInTarget) {
      throw new ConflictException(
        'Pengguna sudah terdaftar sebagai anggota di OPD tujuan',
      );
    }

    return this.repo.transfer(id, dto.opdIdBaru);
  }
}
