import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { LampiranRepository } from '../repository/lampiran.repository';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  CreateLampiranTeksDto,
  AddDasarHukumDto,
  AddSopTerkaitDto,
} from '../dto/lampiran.dto';
import { StatusPeraturan } from '../../../generated/prisma';
import { LampiranMessages, interpolate } from '../../../common/messages';

@Injectable()
export class LampiranService {
  constructor(
    private readonly repo: LampiranRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ---- LampiranTeks ----

  async getLampiran(sopDetailId: string) {
    return this.repo.findLampiran(sopDetailId);
  }

  async addLampiran(sopDetailId: string, dto: CreateLampiranTeksDto) {
    return this.repo.createLampiran(sopDetailId, dto.jenis, dto.teks);
  }

  async updateLampiran(id: string, teks: string) {
    return this.repo.updateLampiran(id, teks);
  }

  async deleteLampiran(id: string) {
    await this.repo.deleteLampiran(id);
  }

  // ---- DasarHukum ----

  async getDasarHukum(sopDetailId: string) {
    return this.repo.findDasarHukum(sopDetailId);
  }

  async addDasarHukum(sopDetailId: string, dto: AddDasarHukumDto) {
    // Duplicate check
    const exists = await this.repo.dasarHukumExists(sopDetailId, dto.peraturanId);
    if (exists) {
      throw new ConflictException(LampiranMessages.PERATURAN_EXISTS);
    }

    // Get DetailSOP to find OPD
    const detail = await this.prisma.detailSOP.findUnique({
      where: { id: sopDetailId },
      include: { sop: { select: { opdId: true } } },
    });
    if (!detail) throw new NotFoundException(LampiranMessages.DETAIL_SOP_NOT_FOUND);

    // Get Peraturan
    const peraturan = await this.prisma.peraturan.findUnique({
      where: { id: dto.peraturanId },
    });
    if (!peraturan) throw new NotFoundException(LampiranMessages.PERATURAN_NOT_FOUND);

    // PRT-07 / [P2-F]: DICABUT peraturan cannot be DasarHukum
    if (peraturan.status === StatusPeraturan.DICABUT) {
      throw new BadRequestException(LampiranMessages.PERATURAN_DICABUT);
    }

    // SOP-23 / [P2-F]: Peraturan must be from same OPD
    if (peraturan.opdId !== (detail as any).sop?.opdId) {
      throw new BadRequestException(LampiranMessages.PERATURAN_DIFFERENT_OPD);
    }

    return this.repo.addDasarHukum(sopDetailId, dto.peraturanId);
  }

  async removeDasarHukum(sopDetailId: string, peraturanId: string) {
    await this.repo.removeDasarHukum(sopDetailId, peraturanId);
  }

  // ---- SopTerkait ----

  async getSopTerkait(sopDetailId: string) {
    return this.repo.findSopTerkait(sopDetailId);
  }

  async addSopTerkait(sopDetailId: string, dto: AddSopTerkaitDto) {
    // SOP-21: no self-reference
    if (sopDetailId === dto.sopTerkaitDetailId) {
      throw new BadRequestException(LampiranMessages.SOP_SELF_REFERENCE);
    }

    // SOP-21: no bidirectional duplicate (A→B if B→A already exists)
    const reverseExists = await this.repo.sopTerkaitExists(
      dto.sopTerkaitDetailId,
      sopDetailId,
    );
    if (reverseExists) {
      throw new ConflictException(LampiranMessages.SOP_BIDIRECTIONAL_DUPLICATE);
    }

    const exists = await this.repo.sopTerkaitExists(sopDetailId, dto.sopTerkaitDetailId);
    if (exists) {
      throw new ConflictException(LampiranMessages.SOP_RELATIONSHIP_EXISTS);
    }

    return this.repo.addSopTerkait(sopDetailId, dto.sopTerkaitDetailId);
  }

  async removeSopTerkait(sopDetailId: string, sopTerkaitDetailId: string) {
    await this.repo.removeSopTerkait(sopDetailId, sopTerkaitDetailId);
  }
}
