import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PeraturanRepository } from '../repository/peraturan.repository';
import {
  CreatePeraturanDto,
  UpdatePeraturanDto,
  PeraturanResponseDto,
} from '../dto/peraturan.dto';
import { PeranPengguna, StatusPeraturan } from '../../../generated/prisma';
import { PeraturanMessages, LampiranMessages } from '../../../common/messages';

type JwtUser = {
  id: string;
  peran: PeranPengguna;
  opdId: string | null;
};

@Injectable()
export class PeraturanService {
  constructor(private readonly peraturanRepository: PeraturanRepository) {}

  private resolveOpdFilter(user: JwtUser, requestedOpdId?: string): string | undefined {
    // PRT-06: Tim Penyusun (incl. Koordinator) dan Kepala OPD hanya bisa lihat OPD sendiri
    const isOpdScoped =
      user.peran === PeranPengguna.TIM_PENYUSUN ||
      user.peran === PeranPengguna.KOORDINATOR_TIM_PENYUSUN ||
      user.peran === PeranPengguna.KEPALA_OPD;

    if (isOpdScoped) {
      return user.opdId ?? undefined;
    }

    return requestedOpdId;
  }

  async findAll(user: JwtUser, opdId?: string): Promise<PeraturanResponseDto[]> {
    const filter = this.resolveOpdFilter(user, opdId);
    return this.peraturanRepository.findAll(filter);
  }

  async findById(id: string, user: JwtUser): Promise<PeraturanResponseDto> {
    const peraturan = await this.peraturanRepository.findById(id);

    if (!peraturan) {
      throw new NotFoundException(PeraturanMessages.PERATURAN_NOT_FOUND);
    }

    // PRT-06: enforce OPD scope for non-BIRO, non-TIM_EVALUASI roles
    const isOpdScoped =
      user.peran === PeranPengguna.TIM_PENYUSUN ||
      user.peran === PeranPengguna.KOORDINATOR_TIM_PENYUSUN ||
      user.peran === PeranPengguna.KEPALA_OPD;

    if (isOpdScoped && peraturan.opdId !== user.opdId) {
      throw new ForbiddenException('Peraturan ini bukan milik OPD Anda');
    }

    return peraturan;
  }

  async create(dto: CreatePeraturanDto): Promise<PeraturanResponseDto> {
    return this.peraturanRepository.create({
      opdId: dto.opdId,
      namaPeraturan: dto.namaPeraturan,
      nomor: dto.nomor,
      tahun: dto.tahun,
      tentang: dto.tentang,
    });
  }

  async update(id: string, dto: UpdatePeraturanDto): Promise<PeraturanResponseDto> {
    const peraturan = await this.peraturanRepository.findById(id);

    if (!peraturan) {
      throw new NotFoundException(PeraturanMessages.PERATURAN_NOT_FOUND);
    }

    if (peraturan.status === StatusPeraturan.DICABUT) {
      throw new BadRequestException(PeraturanMessages.PERATURAN_DICABUT);
    }

    return this.peraturanRepository.update(id, {
      namaPeraturan: dto.namaPeraturan,
      nomor: dto.nomor,
      tahun: dto.tahun,
      tentang: dto.tentang,
    });
  }

  async revoke(id: string): Promise<PeraturanResponseDto> {
    const peraturan = await this.peraturanRepository.findById(id);

    if (!peraturan) {
      throw new NotFoundException(PeraturanMessages.PERATURAN_NOT_FOUND);
    }

    if (peraturan.status === StatusPeraturan.DICABUT) {
      throw new ConflictException(PeraturanMessages.PERATURAN_ALREADY_REVOKED);
    }

    return this.peraturanRepository.revoke(id);
  }

  async delete(id: string): Promise<void> {
    const peraturan = await this.peraturanRepository.findById(id);

    if (!peraturan) {
      throw new NotFoundException(PeraturanMessages.PERATURAN_NOT_FOUND);
    }

    // PRT-09: cek tidak dipakai sebagai DasarHukum
    const isUsed = await this.peraturanRepository.isUsedAsDasarHukum(id);
    if (isUsed) {
      throw new ConflictException(LampiranMessages.PERATURAN_AS_DASAR_HUKUM);
    }

    await this.peraturanRepository.delete(id);
  }
}
