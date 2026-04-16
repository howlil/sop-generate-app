import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PelaksanaRepository } from '../repository/pelaksana.repository';
import {
  CreatePelaksanaDto,
  UpdatePelaksanaDto,
  AddSwimlanDto,
} from '../dto/pelaksana.dto';
import { PelaksanaMessages } from '../../../common/messages';

@Injectable()
export class PelaksanaService {
  constructor(private readonly repo: PelaksanaRepository) {}

  async findAll(opdId?: string) {
    return this.repo.findAll(opdId);
  }

  async findById(id: string) {
    const p = await this.repo.findById(id);
    if (!p) throw new NotFoundException(PelaksanaMessages.PELAKSANA_NOT_FOUND);
    return p;
  }

  async create(dto: CreatePelaksanaDto) {
    return this.repo.create({
      opdId: dto.opdId,
      namaPelaksana: dto.namaPelaksana,
    });
  }

  async update(id: string, dto: UpdatePelaksanaDto) {
    await this.findById(id);
    return this.repo.update(id, { namaPelaksana: dto.namaPelaksana });
  }

  async delete(id: string) {
    await this.findById(id);
    const inUse = await this.repo.isUsedInSop(id);
    if (inUse) {
      throw new ConflictException(PelaksanaMessages.PELAKSANA_IN_USE);
    }
    await this.repo.delete(id);
  }

  // ---- Swimlane ----

  async getSwimlane(sopDetailId: string) {
    return this.repo.findSwimlane(sopDetailId);
  }

  async addToSwimlane(sopDetailId: string, dto: AddSwimlanDto) {
    const existing = await this.repo.findSwimlaneEntry(
      sopDetailId,
      dto.pelaksanaId,
    );
    if (existing) {
      throw new ConflictException(PelaksanaMessages.PELAKSANA_ALREADY_EXISTS);
    }
    return this.repo.addToSwimlane(
      sopDetailId,
      dto.pelaksanaId,
      dto.urutan ?? 0,
    );
  }

  async removeFromSwimlane(sopDetailId: string, pelaksanaId: string) {
    const existing = await this.repo.findSwimlaneEntry(
      sopDetailId,
      pelaksanaId,
    );
    if (!existing) {
      throw new NotFoundException(PelaksanaMessages.PELAKSANA_NOT_IN_SWIMLANE);
    }
    await this.repo.removeFromSwimlane(sopDetailId, pelaksanaId);
  }
}
