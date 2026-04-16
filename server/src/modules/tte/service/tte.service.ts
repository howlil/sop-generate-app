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
import { assertTteXor } from '../../../common/validators';
import { interpolate, TteMessages } from '../../../common/messages';

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
    if (!kredensial)
      throw new NotFoundException(TteMessages.KREDENSIAL_NOT_FOUND);
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
        interpolate(TteMessages.ROLE_NOT_ELIGIBLE, { peran: user.peran }),
      );
    }
    const result = await this.repo.upsertKredensial(user.id, dto.pin, peranTte);
    const { hashPin, tokenVerifikasi, ...safe } = result;
    return safe;
  }

  // TTE-02: request email verification token
  async mintTokenVerifikasi(user: JwtUser) {
    const kredensial = await this.repo.findKredensial(user.id);
    if (!kredensial)
      throw new NotFoundException(TteMessages.KREDENSIAL_NOT_FOUND);
    if (kredensial.emailTerverifikasi) {
      throw new BadRequestException(TteMessages.EMAIL_ALREADY_VERIFIED);
    }
    const token = await this.repo.generateVerifikasiToken(user.id);
    // In production, send the token via email. Return it here for dev convenience.
    return { token };
  }

  // TTE-02: confirm email with token
  async konfirmasiEmail(dto: VerifikasiEmailDto) {
    const result = await this.repo.konfirmasiEmail(dto.token);
    if (!result) {
      throw new BadRequestException(TteMessages.TOKEN_INVALID_OR_EXPIRED);
    }
    return { message: TteMessages.EMAIL_VERIFIED_SUCCESS };
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
    if (!kredensial)
      throw new ForbiddenException(TteMessages.KREDENSIAL_NOT_FOUND);
    if (!kredensial.emailTerverifikasi) {
      throw new ForbiddenException(TteMessages.EMAIL_NOT_VERIFIED);
    }

    // Verify PIN
    const pinValid = await this.repo.verifyPin(user.id, dto.pin);
    if (!pinValid) throw new UnauthorizedException(TteMessages.PIN_INVALID);

    const pengajuan = await this.repo.findPengajuan(pengajuanId);
    if (!pengajuan)
      throw new NotFoundException(TteMessages.PENGAJUAN_NOT_FOUND);

    if (user.peran === PeranPengguna.BIRO_ORGANISASI) {
      // TTE-05
      if (pengajuan.status !== StatusPengajuanEvaluasi.SELESAI_DIEVALUASI) {
        throw new BadRequestException(
          interpolate(TteMessages.BA_SIGN_BIRO_INVALID_STATUS, {
            status: pengajuan.status,
          }),
        );
      }
      // TTE-11: check all nilai filled
      const allFilled = await this.repo.allNilaiIsiForPengajuan(pengajuanId);
      if (!allFilled) {
        throw new BadRequestException(
          TteMessages.BA_SIGN_REQUIRE_ALL_NILAI,
        );
      }
      // Check not already signed by Biro
      const existing = await this.repo.findTteBa(
        pengajuanId,
        PeranTTE.BIRO_ORGANISASI,
      );
      if (existing)
        throw new ConflictException(TteMessages.BA_ALREADY_SIGNED_BIRO);

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
          interpolate(TteMessages.BA_SIGN_KOORDINATOR_INVALID_STATUS, {
            status: pengajuan.status,
          }),
        );
      }
      if (pengajuan.opdId !== user.opdId) {
        throw new ForbiddenException(
          TteMessages.BA_SIGN_KOORDINATOR_OPD_SCOPE,
        );
      }
      // TTE-10: check not already signed by Koordinator
      const existing = await this.repo.findTteBa(
        pengajuanId,
        PeranTTE.KOORDINATOR_TIM_PENYUSUN,
      );
      if (existing)
        throw new ConflictException(TteMessages.BA_ALREADY_SIGNED_KOORDINATOR);

      return this.repo.tandaTanganiBaOlehKoordinator(
        user.id,
        pengajuanId,
        dto.nomorDokumen,
        dto.judulDokumen,
      );
    }

    throw new ForbiddenException(
      TteMessages.BA_SIGN_ROLE_FORBIDDEN,
    );
  }

  // TTE-07: Kepala OPD signs individual DetailSOP → BERLAKU
  async tandaTanganiSop(
    user: JwtUser,
    sopDetailId: string,
    dto: TandaTanganiSopDto,
  ) {
    if (user.peran !== PeranPengguna.KEPALA_OPD) {
      throw new ForbiddenException(
        TteMessages.SOP_SIGN_ONLY_KEPALA,
      );
    }

    // Verify KredensialTTE
    const kredensial = await this.repo.findKredensial(user.id);
    if (!kredensial)
      throw new ForbiddenException(TteMessages.KREDENSIAL_NOT_FOUND);
    if (!kredensial.emailTerverifikasi) {
      throw new ForbiddenException(TteMessages.EMAIL_NOT_VERIFIED);
    }

    const pinValid = await this.repo.verifyPin(user.id, dto.pin);
    if (!pinValid) throw new UnauthorizedException(TteMessages.PIN_INVALID);

    const detail = await this.repo.findDetailSop(sopDetailId);
    if (!detail) throw new NotFoundException(TteMessages.SOP_NOT_FOUND);

    // Must be DIVERIFIKASI_BIRO_ORGANISASI
    if (detail.status !== StatusSOP.DIVERIFIKASI_BIRO_ORGANISASI) {
      throw new BadRequestException(
        interpolate(TteMessages.SOP_SIGN_INVALID_STATUS, {
          status: detail.status,
        }),
      );
    }

    // Must belong to Kepala's OPD
    if (detail.sop.opdId !== user.opdId) {
      throw new ForbiddenException(
        TteMessages.SOP_SIGN_OPD_SCOPE,
      );
    }

    // TTE-09: max 1 TTE per DetailSOP by KEPALA_OPD
    const existing = await this.repo.findTteSop(
      sopDetailId,
      PeranTTE.KEPALA_OPD,
    );
    if (existing)
      throw new ConflictException(TteMessages.SOP_ALREADY_SIGNED_KEPALA);

    return this.repo.tandaTanganiSop(
      user.id,
      sopDetailId,
      dto.nomorDokumen,
      dto.judulDokumen,
    );
  }
}
