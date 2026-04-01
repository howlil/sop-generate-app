import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { TteRepository } from '../repository/tte.repository';
import {
  RegisterTteDto,
  VerifikasiEmailDto,
  TandaTanganiBaDto,
  TandaTanganiSopDto,
} from '../dto/tte.dto';
import {
  PeranPengguna,
  PeranTTE,
  StatusPengajuanEvaluasi,
  StatusSOP,
} from '../../../generated/prisma';

type JwtUser = { id: string; peran: PeranPengguna; opdId: string | null };

// TTE-03/04: which PeranPengguna may hold a KredensialTTE
const PERAN_TTE_MAP: Partial<Record<PeranPengguna, PeranTTE>> = {
  [PeranPengguna.KEPALA_OPD]: PeranTTE.KEPALA_OPD,
  [PeranPengguna.BIRO_ORGANISASI]: PeranTTE.BIRO_ORGANISASI,
  [PeranPengguna.KOORDINATOR_TIM_PENYUSUN]: PeranTTE.KOORDINATOR_TIM_PENYUSUN,
};

@Injectable()
export class TteService {
  constructor(private readonly repo: TteRepository) {}

  // TTE-01: get own KredensialTTE
  async getProfil(userId: string) {
    const kredensial = await this.repo.findKredensial(userId);
    if (!kredensial) throw new NotFoundException('KredensialTTE belum terdaftar');
    // Exclude hashPin from response
    const { hashPin, tokenVerifikasi, ...safe } = kredensial;
    return safe;
  }

  // TTE-01: register/update KredensialTTE
  async registerProfil(user: JwtUser, dto: RegisterTteDto) {
    // TTE-03/04: only eligible roles
    const peranTte = PERAN_TTE_MAP[user.peran];
    if (!peranTte) {
      throw new ForbiddenException(
        `Peran ${user.peran} tidak diizinkan memiliki KredensialTTE`,
      );
    }
    const result = await this.repo.upsertKredensial(user.id, dto.pin, peranTte);
    const { hashPin, tokenVerifikasi, ...safe } = result;
    return safe;
  }

  // TTE-02: request email verification token
  async mintTokenVerifikasi(user: JwtUser) {
    const kredensial = await this.repo.findKredensial(user.id);
    if (!kredensial) throw new NotFoundException('KredensialTTE belum terdaftar');
    if (kredensial.emailTerverifikasi) {
      throw new BadRequestException('Email sudah terverifikasi');
    }
    const token = await this.repo.generateVerifikasiToken(user.id);
    // In production, send the token via email. Return it here for dev convenience.
    return { token };
  }

  // TTE-02: confirm email with token
  async konfirmasiEmail(dto: VerifikasiEmailDto) {
    const result = await this.repo.konfirmasiEmail(dto.token);
    if (!result) {
      throw new BadRequestException('Token tidak valid atau sudah kadaluarsa');
    }
    return { message: 'Email berhasil diverifikasi' };
  }

  // TTE-13: get own signing history
  async getRiwayat(userId: string) {
    return this.repo.findRiwayatByUser(userId);
  }

  // TTE-05/06: sign BA — role determines which transition occurs
  async tandaTanganiBa(
    user: JwtUser,
    pengajuanId: string,
    dto: TandaTanganiBaDto,
  ) {
    // Verify KredensialTTE exists and email is verified
    const kredensial = await this.repo.findKredensial(user.id);
    if (!kredensial) throw new ForbiddenException('KredensialTTE belum terdaftar');
    if (!kredensial.emailTerverifikasi) {
      throw new ForbiddenException('Email TTE belum diverifikasi');
    }

    // Verify PIN
    const pinValid = await this.repo.verifyPin(user.id, dto.pin);
    if (!pinValid) throw new UnauthorizedException('PIN TTE salah');

    const pengajuan = await this.repo.findPengajuan(pengajuanId);
    if (!pengajuan) throw new NotFoundException('PengajuanEvaluasi tidak ditemukan');

    if (user.peran === PeranPengguna.BIRO_ORGANISASI) {
      // TTE-05
      if (pengajuan.status !== StatusPengajuanEvaluasi.SELESAI_DIEVALUASI) {
        throw new BadRequestException(
          `Berita Acara hanya bisa ditandatangani Biro saat status SELESAI_DIEVALUASI — saat ini: ${pengajuan.status}`,
        );
      }
      // TTE-11: check all nilai filled
      const allFilled = await this.repo.allNilaiIsiForPengajuan(pengajuanId);
      if (!allFilled) {
        throw new BadRequestException(
          'Semua NilaiEvaluasi harus sudah diisi sebelum BA dapat ditandatangani',
        );
      }
      // Check not already signed by Biro
      const existing = await this.repo.findTteBa(
        pengajuanId,
        PeranTTE.BIRO_ORGANISASI,
      );
      if (existing) throw new ConflictException('Biro sudah menandatangani BA ini');

      return this.repo.tandaTanganiBaOlehBiro(
        user.id,
        pengajuanId,
        dto.nomorDokumen,
        dto.judulDokumen,
      );
    }

    if (user.peran === PeranPengguna.KOORDINATOR_TIM_PENYUSUN) {
      // TTE-06: must be DIVERIFIKASI_BIRO and same OPD
      if (pengajuan.status !== StatusPengajuanEvaluasi.DIVERIFIKASI_BIRO) {
        throw new BadRequestException(
          `Koordinator dapat menandatangani BA hanya setelah Biro — status saat ini: ${pengajuan.status}`,
        );
      }
      if (pengajuan.opdId !== user.opdId) {
        throw new ForbiddenException('Koordinator hanya dapat menandatangani BA milik OPD-nya');
      }
      // TTE-10: check not already signed by Koordinator
      const existing = await this.repo.findTteBa(
        pengajuanId,
        PeranTTE.KOORDINATOR_TIM_PENYUSUN,
      );
      if (existing) throw new ConflictException('Koordinator sudah menandatangani BA ini');

      return this.repo.tandaTanganiBaOlehKoordinator(
        user.id,
        pengajuanId,
        dto.nomorDokumen,
        dto.judulDokumen,
      );
    }

    throw new ForbiddenException('Peran ini tidak dapat menandatangani Berita Acara');
  }

  // TTE-07: Kepala OPD signs individual DetailSOP → BERLAKU
  async tandaTanganiSop(
    user: JwtUser,
    sopDetailId: string,
    dto: TandaTanganiSopDto,
  ) {
    if (user.peran !== PeranPengguna.KEPALA_OPD) {
      throw new ForbiddenException('Hanya Kepala OPD yang dapat mengesahkan SOP');
    }

    // Verify KredensialTTE
    const kredensial = await this.repo.findKredensial(user.id);
    if (!kredensial) throw new ForbiddenException('KredensialTTE belum terdaftar');
    if (!kredensial.emailTerverifikasi) {
      throw new ForbiddenException('Email TTE belum diverifikasi');
    }

    const pinValid = await this.repo.verifyPin(user.id, dto.pin);
    if (!pinValid) throw new UnauthorizedException('PIN TTE salah');

    const detail = await this.repo.findDetailSop(sopDetailId);
    if (!detail) throw new NotFoundException('DetailSOP tidak ditemukan');

    // Must be DIVERIFIKASI_BIRO_ORGANISASI
    if (detail.status !== StatusSOP.DIVERIFIKASI_BIRO_ORGANISASI) {
      throw new BadRequestException(
        `DetailSOP harus berstatus DIVERIFIKASI_BIRO_ORGANISASI — saat ini: ${detail.status}`,
      );
    }

    // Must belong to Kepala's OPD
    if (detail.sop.opdId !== user.opdId) {
      throw new ForbiddenException('Kepala OPD hanya dapat mengesahkan SOP milik OPD-nya');
    }

    // TTE-09: max 1 TTE per DetailSOP by KEPALA_OPD
    const existing = await this.repo.findTteSop(sopDetailId, PeranTTE.KEPALA_OPD);
    if (existing) throw new ConflictException('SOP ini sudah ditandatangani Kepala OPD');

    return this.repo.tandaTanganiSop(
      user.id,
      sopDetailId,
      dto.nomorDokumen,
      dto.judulDokumen,
    );
  }
}
