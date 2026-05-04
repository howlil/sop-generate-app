import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { JwtAccessPayload } from '../../../common';
import type { CreatePelaksanaDto } from './dto/create-pelaksana.dto';
import type { UpdatePelaksanaDto } from './dto/update-pelaksana.dto';
import type { PelaksanaResponseDto } from './dto/pelaksana-response.dto';
import { PelaksanaRepository, type PelaksanaRow } from './pelaksana.repository';

@Injectable()
export class PelaksanaService {
  constructor(private readonly pelaksanaRepository: PelaksanaRepository) {}

  private mapRow(row: PelaksanaRow): PelaksanaResponseDto {
    return {
      id: row.pelaksanaId,
      opdId: row.opdId,
      namaPelaksana: row.nama,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private async resolveOpdIdOrThrow(
    user: JwtAccessPayload,
    bodyOrQueryOpdId?: string,
  ): Promise<string> {
    const ownOpdId = await this.pelaksanaRepository.findOpdIdByPenggunaId(user.sub);
    if (ownOpdId === null) {
      throw new ForbiddenException('Pengguna tidak terikat OPD');
    }
    if (bodyOrQueryOpdId !== undefined && bodyOrQueryOpdId !== '' && bodyOrQueryOpdId !== ownOpdId) {
      throw new ForbiddenException('Tidak dapat mengakses OPD lain');
    }
    return ownOpdId;
  }

  async list(user: JwtAccessPayload, queryOpdId?: string): Promise<PelaksanaResponseDto[]> {
    const opdId = await this.resolveOpdIdOrThrow(user, queryOpdId);
    const rows = await this.pelaksanaRepository.findManyByOpdId(opdId);
    return rows.map((r) => this.mapRow(r));
  }

  async create(user: JwtAccessPayload, dto: CreatePelaksanaDto): Promise<PelaksanaResponseDto> {
    const opdId = await this.resolveOpdIdOrThrow(user, dto.opdId);
    const row = await this.pelaksanaRepository.create(opdId, dto.namaPelaksana);
    return this.mapRow(row);
  }

  async update(
    user: JwtAccessPayload,
    id: string,
    dto: UpdatePelaksanaDto,
  ): Promise<PelaksanaResponseDto> {
    const opdId = await this.resolveOpdIdOrThrow(user, undefined);
    const existing = await this.pelaksanaRepository.findByIdAndOpd(id, opdId);
    if (existing === null) {
      throw new NotFoundException('Pelaksana tidak ditemukan');
    }
    const row = await this.pelaksanaRepository.updateNama(id, dto.namaPelaksana);
    return this.mapRow(row);
  }

  async remove(user: JwtAccessPayload, id: string): Promise<void> {
    const opdId = await this.resolveOpdIdOrThrow(user, undefined);
    const existing = await this.pelaksanaRepository.findByIdAndOpd(id, opdId);
    if (existing === null) {
      throw new NotFoundException('Pelaksana tidak ditemukan');
    }
    const langkah = await this.pelaksanaRepository.countLangkahReferences(id);
    const swim = await this.pelaksanaRepository.countSwimlaneReferences(id);
    if (langkah > 0 || swim > 0) {
      throw new ConflictException(
        'Pelaksana masih direferensikan pada langkah atau swimlane SOP',
      );
    }
    await this.pelaksanaRepository.delete(id);
  }
}
