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
    if (!result) throw new NotFoundException('PengajuanEvaluasi tidak ditemukan');
    return result;
  }

  // EVL-01 + EVL-02 + EVL-03 + EVL-13
  async create(dto: CreatePengajuanEvaluasiDto) {
    // EVL-02: max 1 active evaluation per OPD per jenis [P0-C]
    const existing = await this.repo.findActiveByOpdAndJenis(
      dto.opdId,
      dto.jenis,
    );
    if (existing) {
      throw new ConflictException(
        `OPD ini sudah memiliki pengajuan evaluasi ${dto.jenis} yang aktif (id: ${existing.id})`,
      );
    }

    // EVL-13 + EVL-03: validate DetailSOPs belong to correct OPD and have correct status
    const details = await this.repo.findSopDetails(dto.sopDetailIds);

    if (details.length !== dto.sopDetailIds.length) {
      throw new BadRequestException('Beberapa sopDetailId tidak ditemukan');
    }

    const wrongOpd = details.filter((d) => d.sop.opdId !== dto.opdId);
    if (wrongOpd.length > 0) {
      throw new BadRequestException(
        'Semua DetailSOP harus dari OPD yang sama dengan pengajuan evaluasi',
      );
    }

    const wrongStatus = details.filter(
      (d) => d.status !== StatusSOP.DIAJUKAN_EVALUASI,
    );
    if (wrongStatus.length > 0) {
      throw new BadRequestException(
        'Semua DetailSOP harus berstatus DIAJUKAN_EVALUASI sebelum dapat dievaluasi',
      );
    }

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
      throw new NotFoundException('PengajuanEvaluasi tidak ditemukan');

    if (pengajuan.status !== StatusPengajuanEvaluasi.SEDANG_DIEVALUASI) {
      throw new BadRequestException(
        `Tidak dapat mengisi nilai — status pengajuan: ${pengajuan.status}`,
      );
    }

    return this.repo.isiNilai(id, sopDetailId, dto, userId);
  }

  // EVL-06 + EVL-07
  async selesai(id: string, dto: SelesaiEvaluasiDto, userId: string) {
    const pengajuan = await this.repo.findById(id);
    if (!pengajuan)
      throw new NotFoundException('PengajuanEvaluasi tidak ditemukan');

    if (pengajuan.status !== StatusPengajuanEvaluasi.SEDANG_DIEVALUASI) {
      throw new BadRequestException(
        `Tidak dapat diselesaikan — status pengajuan: ${pengajuan.status}`,
      );
    }

    const allFilled = await this.repo.allNilaiIsi(id);
    if (!allFilled) {
      throw new BadRequestException(
        'Semua DetailSOP harus sudah dinilai sebelum evaluasi dapat diselesaikan',
      );
    }

    // EVL-07: nilaiOPD constraint [P1-B]
    if (pengajuan.jenis === JenisPengajuanEvaluasi.TERJADWAL) {
      if (dto.nilaiOPD == null) {
        throw new BadRequestException(
          'Evaluasi TERJADWAL wajib mengisi nilaiOPD sebelum diselesaikan',
        );
      }
    } else {
      if (dto.nilaiOPD != null) {
        throw new BadRequestException(
          'Evaluasi MANDIRI tidak boleh memiliki nilaiOPD',
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
