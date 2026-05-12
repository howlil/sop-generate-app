import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../../../generated/prisma';
import { PeranPengguna, type Pengguna } from '../../../../generated/prisma';
import type { AnggotaEvaluatorItemDto } from './dto/anggota-evaluator-item.dto';
import type { EvaluatorOpdGrupDto } from './dto/evaluator-opd-grup.dto';
import { CreateEvaluatorDto } from './dto/create-evaluator.dto';
import { UpdateEvaluatorDto } from './dto/update-evaluator.dto';
import { PenggunaRepository } from '../pengguna.repository';

const BCRYPT_SALT_ROUNDS = 10;
const DEFAULT_EVALUATOR_PASSWORD = '@Password123:)' as const;

@Injectable()
export class EvaluatorService {
  constructor(private readonly penggunaRepository: PenggunaRepository) {}

  async listGrup(search?: string): Promise<EvaluatorOpdGrupDto[]> {
    const opdMaster = await this.penggunaRepository.findPjEvaluatorOrganisasiOpd();
    if (opdMaster === null) {
      throw new ServiceUnavailableException(
        'OPD PJ Evaluator Organisasi belum dikonfigurasi. Hubungi administrator sistem.',
      );
    }
    const rows = await this.penggunaRepository.findEvaluatorsByOpd(opdMaster.opdId, search);
    return [
      {
        opdId: opdMaster.opdId,
        namaOpd: opdMaster.nama,
        evaluator: rows.map((r) => this.toAnggotaDto(r)),
      },
    ];
  }

  async createAnggota(dto: CreateEvaluatorDto): Promise<AnggotaEvaluatorItemDto> {
    const opdId = await this.requireBiroOpdId();
    const hashed = await bcrypt.hash(DEFAULT_EVALUATOR_PASSWORD, BCRYPT_SALT_ROUNDS);
    try {
      const created = await this.penggunaRepository.createEvaluator({
        email: dto.email.trim().toLowerCase(),
        nama: dto.nama.trim(),
        nip: dto.nip.trim(),
        jabatan: dto.jabatan.trim(),
        pangkat: dto.pangkat.trim(),
        nohp: dto.nohp.trim(),
        kataSandi: hashed,
        peran: PeranPengguna.EVALUATOR,
        opd: { connect: { opdId } },
      });
      return this.toAnggotaDto(created);
    } catch (err: unknown) {
      this.rethrowUniqueViolation(err);
      throw err;
    }
  }

  async updateAnggota(penggunaId: string, dto: UpdateEvaluatorDto): Promise<AnggotaEvaluatorItemDto> {
    const opdId = await this.requireBiroOpdId();
    const existing = await this.penggunaRepository.findEvaluatorByIdInOpd(penggunaId, opdId);
    if (existing === null) {
      throw new NotFoundException('Evaluator tidak ditemukan');
    }
    if (!this.hasUpdatePayload(dto)) {
      throw new BadRequestException('Minimal satu field harus diisi untuk pembaruan');
    }
    const nextDeletedAt: Date | null =
      dto.status === 'NONAKTIF'
        ? new Date()
        : dto.status === 'AKTIF'
          ? null
          : existing.deletedAt;
    const emailNext = dto.email !== undefined ? dto.email.trim().toLowerCase() : undefined;
    const nipNext = dto.nip !== undefined ? dto.nip.trim() : undefined;
    if (emailNext !== undefined && emailNext !== existing.email) {
      const taken = await this.penggunaRepository.existsEmailOtherThan(emailNext, penggunaId);
      if (taken) {
        throw new ConflictException('Email sudah digunakan pengguna lain');
      }
    }
    if (nipNext !== undefined && nipNext !== existing.nip) {
      const taken = await this.penggunaRepository.existsNipOtherThan(nipNext, penggunaId);
      if (taken) {
        throw new ConflictException('NIP sudah digunakan pengguna lain');
      }
    }
    const data: Prisma.PenggunaUpdateInput = {};
    if (dto.nama !== undefined) data.nama = dto.nama.trim();
    if (emailNext !== undefined) data.email = emailNext;
    if (nipNext !== undefined) data.nip = nipNext;
    if (dto.jabatan !== undefined) data.jabatan = dto.jabatan.trim();
    if (dto.pangkat !== undefined) data.pangkat = dto.pangkat.trim();
    if (dto.nohp !== undefined) data.nohp = dto.nohp.trim();
    if (dto.status !== undefined) {
      data.deletedAt = nextDeletedAt;
    }
    try {
      const updated = await this.penggunaRepository.updateEvaluator(penggunaId, data);
      return this.toAnggotaDto(updated);
    } catch (err: unknown) {
      this.rethrowUniqueViolation(err);
      throw err;
    }
  }

  async softDeleteAnggota(penggunaId: string): Promise<void> {
    const opdId = await this.requireBiroOpdId();
    const existing = await this.penggunaRepository.findEvaluatorAktifById(penggunaId, opdId);
    if (existing === null) {
      throw new NotFoundException('Evaluator tidak ditemukan');
    }
    await this.penggunaRepository.softDeleteEvaluator(penggunaId);
  }

  private async requireBiroOpdId(): Promise<string> {
    const opdId = await this.penggunaRepository.findPjEvaluatorOrganisasiOpdId();
    if (opdId === null) {
      throw new ServiceUnavailableException(
        'OPD PJ Evaluator Organisasi belum dikonfigurasi. Hubungi administrator sistem.',
      );
    }
    return opdId;
  }

  private hasUpdatePayload(dto: UpdateEvaluatorDto): boolean {
    return (
      dto.email !== undefined ||
      dto.nama !== undefined ||
      dto.nip !== undefined ||
      dto.jabatan !== undefined ||
      dto.pangkat !== undefined ||
      dto.nohp !== undefined ||
      dto.status !== undefined
    );
  }

  private rethrowUniqueViolation(err: unknown): void {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new ConflictException('Email atau NIP sudah terdaftar');
    }
  }

  private toAnggotaDto(row: Pengguna): AnggotaEvaluatorItemDto {
    const aktif = row.deletedAt === null;
    return {
      id: row.penggunaId,
      userId: row.penggunaId,
      status: aktif ? 'AKTIF' : 'NONAKTIF',
      tanggalBergabung: row.createdAt,
      berakhirPada: row.deletedAt ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: {
        id: row.penggunaId,
        nama: row.nama,
        email: row.email,
        nip: row.nip,
        jabatan: row.jabatan,
        pangkat: row.pangkat,
        nohp: row.nohp,
        peran: row.peran,
      },
    };
  }
}
