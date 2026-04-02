import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { EvaluasiRepository } from '../repository/evaluasi.repository';
import {
  CreatePengajuanEvaluasiDto,
  IsiNilaiEvaluasiDto,
  SelesaiEvaluasiDto,
} from '../dto/evaluasi.dto';
import {
  JenisPengajuanEvaluasi,
  PeranPengguna,
  StatusPengajuanEvaluasi,
  StatusSOP,
} from '../../../generated/prisma';
import { EvaluasiMessages, interpolate } from '../../../common/messages';

type JwtUser = { id: string; peran: PeranPengguna; opdId: string | null };

@Injectable()
export class EvaluasiService {
  constructor(private readonly repo: EvaluasiRepository) {}

  // EVL-04: open pool for TIM_EVALUASI; OPD-scoped for others
  async findAll(
    user: JwtUser,
    opdId?: string,
    status?: StatusPengajuanEvaluasi,
    jenis?: JenisPengajuanEvaluasi,
  ) {
    const filterOpdId =
      user.peran === PeranPengguna.BIRO_ORGANISASI ||
      user.peran === PeranPengguna.TIM_EVALUASI
        ? opdId
        : (user.opdId ?? undefined);

    return this.repo.findAll({ opdId: filterOpdId, status, jenis });
  }

  // EVL-08
  async findById(id: string) {
    const result = await this.repo.findById(id);
    if (!result) throw new NotFoundException(EvaluasiMessages.EVALUASI_NOT_FOUND);
    return result;
  }

  // EVL-01 + EVL-02 + EVL-03 + EVL-13
  // [P0-C] Sentinel table handles race condition prevention
  async create(dto: CreatePengajuanEvaluasiDto) {
    // EVL-13 + EVL-03: validate DetailSOPs belong to correct OPD and have correct status
    // Validation now happens in repository after sentinel INSERT
    return this.repo.create(dto);
  }

  // EVL-05 + EVL-10 + EVL-11
  async isiNilai(
    id: string,
    sopDetailId: string,
    dto: IsiNilaiEvaluasiDto,
    userId: string,
  ) {
    const pengajuan = await this.repo.findById(id);
    if (!pengajuan)
      throw new NotFoundException(EvaluasiMessages.EVALUASI_NOT_FOUND);

    if (pengajuan.status !== StatusPengajuanEvaluasi.SEDANG_DIEVALUASI) {
      throw new BadRequestException(
        interpolate(EvaluasiMessages.INVALID_STATUS, { status: pengajuan.status }),
      );
    }

    return this.repo.isiNilai(id, sopDetailId, dto, userId);
  }

  // EVL-06 + EVL-07
  async selesai(id: string, dto: SelesaiEvaluasiDto, userId: string) {
    const pengajuan = await this.repo.findById(id);
    if (!pengajuan)
      throw new NotFoundException(EvaluasiMessages.EVALUASI_NOT_FOUND);

    if (pengajuan.status !== StatusPengajuanEvaluasi.SEDANG_DIEVALUASI) {
      throw new BadRequestException(
        interpolate(EvaluasiMessages.INVALID_STATUS, { status: pengajuan.status }),
      );
    }

    const allFilled = await this.repo.allNilaiIsi(id);
    if (!allFilled) {
      throw new BadRequestException(EvaluasiMessages.ALL_SOP_MUST_BE_EVALUATED);
    }

    // EVL-07: nilaiOPD constraint [P1-B]
    if (pengajuan.jenis === JenisPengajuanEvaluasi.TERJADWAL) {
      if (dto.nilaiOPD == null) {
        throw new BadRequestException(
          EvaluasiMessages.EVALUASI_TERJADWAL_REQUIRES_NILAI_OPD,
        );
      }
    } else {
      if (dto.nilaiOPD != null) {
        throw new BadRequestException(
          EvaluasiMessages.EVALUASI_MANDIRI_CANNOT_HAVE_NILAI_OPD,
        );
      }
    }

    return this.repo.selesai(id, dto.nilaiOPD, userId);
  }

  // EVL-09
  async rekap(tahun?: number) {
    return this.repo.rekap(tahun ?? new Date().getFullYear());
  }
}
