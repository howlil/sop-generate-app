import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { TimEvaluasiRepository } from '../repository/tim-evaluasi.repository';
import {
  CreateTimEvaluasiDto,
  AnggotaTimEvaluasiResponseDto,
} from '../dto/tim-evaluasi.dto';
import { StatusTim } from '../../../generated/prisma';
import { TimMessages } from '../../../common/messages';

@Injectable()
export class TimEvaluasiService {
  constructor(private readonly repo: TimEvaluasiRepository) {}

  async findAll(): Promise<AnggotaTimEvaluasiResponseDto[]> {
    return this.repo.findAll();
  }

  async findById(id: string): Promise<AnggotaTimEvaluasiResponseDto> {
    const member = await this.repo.findById(id);

    if (!member) {
      throw new NotFoundException(TimMessages.TIM_NOT_FOUND);
    }

    return member;
  }

  async tambah(dto: CreateTimEvaluasiDto): Promise<AnggotaTimEvaluasiResponseDto> {
    // TIM-07: unique userId on AnggotaTimEvaluasi
    const existing = await this.repo.findByUserId(dto.userId);
    if (existing) {
      throw new ConflictException(
        'Pengguna sudah terdaftar sebagai anggota Tim Evaluasi',
      );
    }

    return this.repo.create({ userId: dto.userId });
  }

  async nonaktifkan(id: string): Promise<AnggotaTimEvaluasiResponseDto> {
    const member = await this.repo.findById(id);

    if (!member) {
      throw new NotFoundException(TimMessages.TIM_NOT_FOUND);
    }

    if (member.status === StatusTim.NONAKTIF) {
      throw new ConflictException(TimMessages.TIM_ALREADY_INACTIVE);
    }

    return this.repo.deactivate(id);
  }
}
