import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { JwtAccessPayload } from '../../../common';
import { PeranPengguna } from '../../../generated/prisma';
import { RegisterTteDto } from '../shared/dto/register-tte.dto';
import { UpdateTtePinDto } from '../shared/dto/update-tte-pin.dto';
import { mapTtePeranResponse } from '../shared/utils/tte-support';
import { TteRepository } from '../shared/repository/tte.repository';
import type { TteProfilResponse } from '../shared/types/tte.types';

@Injectable()
export class TteProfilService {
  constructor(private readonly tteRepository: TteRepository) {}

  async getProfil(user: JwtAccessPayload): Promise<TteProfilResponse | null> {
    const pengguna = await this.tteRepository.findPenggunaAktif(user.sub);
    if (pengguna === null) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }
    const row = await this.tteRepository.findKredensial(user.sub);
    if (row === null) {
      return null;
    }
    return this.buildProfilResponse(pengguna, row);
  }

  async registerProfil(user: JwtAccessPayload, dto: RegisterTteDto): Promise<TteProfilResponse> {
    const pengguna = await this.tteRepository.findPenggunaAktif(user.sub);
    if (pengguna === null) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }
    const existing = await this.tteRepository.findKredensial(user.sub);
    if (existing !== null) {
      throw new ConflictException('PIN TTE sudah diatur. Gunakan ubah PIN jika ingin memperbarui.');
    }
    const hashPin = await bcrypt.hash(dto.pin, 10);
    const row = await this.tteRepository.createKredensialPin({
      userId: user.sub,
      hashPin,
    });
    return this.buildProfilResponse(pengguna, row);
  }

  async updateProfilPin(user: JwtAccessPayload, dto: UpdateTtePinDto): Promise<TteProfilResponse> {
    const pengguna = await this.tteRepository.findPenggunaAktif(user.sub);
    if (pengguna === null) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }
    const existing = await this.tteRepository.findKredensial(user.sub);
    if (existing === null) {
      throw new BadRequestException('PIN TTE belum diatur. Atur PIN terlebih dahulu.');
    }
    const pinValid = await bcrypt.compare(dto.pinLama, existing.hashPin);
    if (!pinValid) {
      throw new UnauthorizedException('PIN lama tidak sesuai');
    }
    const hashPin = await bcrypt.hash(dto.pinBaru, 10);
    const row = await this.tteRepository.updateKredensialPinHash({
      userId: user.sub,
      hashPin,
    });
    return this.buildProfilResponse(pengguna, row);
  }

  async mintTokenVerifikasi(user: JwtAccessPayload): Promise<{ token: string }> {
    const row = await this.tteRepository.findKredensial(user.sub);
    if (row === null) {
      throw new BadRequestException('Buat PIN TTE terlebih dahulu');
    }
    return { token: 'mock-email-skip' };
  }

  async konfirmasiEmail(token: string): Promise<{ message: string }> {
    if (typeof token !== 'string' || token.trim() === '') {
      throw new BadRequestException('Token tidak valid');
    }
    return { message: 'Verifikasi tidak diperlukan pada mode simulasi TTE' };
  }

  private buildProfilResponse(
    pengguna: {
      penggunaId: string;
      nama: string;
      email: string;
      nip: string;
      jabatan: string;
      pangkat: string;
      peran: PeranPengguna;
    },
    row: { updatedAt: Date },
  ): TteProfilResponse {
    return {
      id: pengguna.penggunaId,
      userId: pengguna.penggunaId,
      peran: mapTtePeranResponse(pengguna.peran),
      createdAt: row.updatedAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      user: {
        id: pengguna.penggunaId,
        nama: pengguna.nama,
        email: pengguna.email,
        nip: pengguna.nip,
        jabatan: pengguna.jabatan,
        pangkat: pengguna.pangkat,
      },
    };
  }
}
