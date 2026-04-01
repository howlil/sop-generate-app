import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { LangkahSopRepository } from '../repository/langkah-sop.repository';
import { CreateLangkahSopDto, UpdateLangkahSopDto } from '../dto/langkah-sop.dto';
import { JenisLangkahProsedur } from '../../../generated/prisma';
import { LangkahSopMessages, interpolate } from '../../../common/messages';

@Injectable()
export class LangkahSopService {
  constructor(private readonly repo: LangkahSopRepository) {}

  private validateJenisCabang(dto: Partial<CreateLangkahSopDto>) {
    const jenis = dto.jenis ?? JenisLangkahProsedur.TASK;
    const hasYa = !!dto.langkahSelanjutnyaYaId;
    const hasTidak = !!dto.langkahSelanjutnyaTidakId;

    // PLK-06
    if (jenis === JenisLangkahProsedur.TERMINATOR && (hasYa || hasTidak)) {
      throw new BadRequestException(LangkahSopMessages.TERMINATOR_CANNOT_HAVE_NEXT);
    }
    if (jenis === JenisLangkahProsedur.TASK && hasTidak) {
      throw new BadRequestException(LangkahSopMessages.TASK_ONLY_YES_BRANCH);
    }
  }

  async findAll(sopDetailId: string) {
    return this.repo.findAll(sopDetailId);
  }

  async findById(id: string) {
    const langkah = await this.repo.findById(id);
    if (!langkah) throw new NotFoundException(LangkahSopMessages.LANGKAH_NOT_FOUND);
    return langkah;
  }

  async create(sopDetailId: string, dto: CreateLangkahSopDto) {
    this.validateJenisCabang(dto);

    // PLK-03: pelaksana must be registered in swimlane
    const inSwimlane = await this.repo.isSwimlaneMember(sopDetailId, dto.pelaksanaId);
    if (!inSwimlane) {
      throw new BadRequestException(LangkahSopMessages.PELAKSANA_NOT_IN_SWIMLANE);
    }

    // PLK-05: urutan must be unique within DetailSOP
    const urutanConflict = await this.repo.findByUrutanInDetail(sopDetailId, dto.urutan);
    if (urutanConflict) {
      throw new ConflictException(
        interpolate(LangkahSopMessages.URUTAN_ALREADY_USED, { urutan: dto.urutan })
      );
    }

    return this.repo.create({
      sopDetailId,
      kegiatan: dto.kegiatan,
      jenis: dto.jenis ?? JenisLangkahProsedur.TASK,
      urutan: dto.urutan,
      kelengkapan: dto.kelengkapan,
      keluaran: dto.keluaran,
      waktu: dto.waktu,
      satuanWaktu: dto.satuanWaktu,
      keterangan: dto.keterangan ?? '',
      pelaksanaId: dto.pelaksanaId,
      langkahSelanjutnyaYaId: dto.langkahSelanjutnyaYaId ?? null,
      langkahSelanjutnyaTidakId: dto.langkahSelanjutnyaTidakId ?? null,
    });
  }

  async update(id: string, dto: UpdateLangkahSopDto) {
    const existing = await this.findById(id);

    this.validateJenisCabang({
      jenis: dto.jenis ?? existing.jenis,
      langkahSelanjutnyaYaId: dto.langkahSelanjutnyaYaId !== undefined
        ? dto.langkahSelanjutnyaYaId ?? undefined
        : existing.langkahSelanjutnyaYaId ?? undefined,
      langkahSelanjutnyaTidakId: dto.langkahSelanjutnyaTidakId !== undefined
        ? dto.langkahSelanjutnyaTidakId ?? undefined
        : existing.langkahSelanjutnyaTidakId ?? undefined,
    });

    // PLK-03: if pelaksana changes, must still be in swimlane
    if (dto.pelaksanaId && dto.pelaksanaId !== existing.pelaksanaId) {
      const inSwimlane = await this.repo.isSwimlaneMember(
        existing.sopDetailId,
        dto.pelaksanaId,
      );
      if (!inSwimlane) {
        throw new BadRequestException(LangkahSopMessages.PELAKSANA_NOT_IN_SWIMLANE);
      }
    }

    // PLK-05: urutan conflict check
    if (dto.urutan && dto.urutan !== existing.urutan) {
      const conflict = await this.repo.findByUrutanInDetail(
        existing.sopDetailId,
        dto.urutan,
        id,
      );
      if (conflict) {
        throw new ConflictException(
          interpolate(LangkahSopMessages.URUTAN_ALREADY_USED, { urutan: dto.urutan })
        );
      }
    }

    return this.repo.update(id, dto);
  }

  async delete(id: string) {
    await this.findById(id);
    // PLK-07 / [P0-A]: delete is handled inside repository with proper ordering
    await this.repo.delete(id);
  }
}
