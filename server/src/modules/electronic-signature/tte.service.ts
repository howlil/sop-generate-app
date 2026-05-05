import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, createHmac, randomUUID } from 'crypto';
import type { JwtAccessPayload } from '../../common';
import {
  JenisDokumenTte,
  PeranPengguna,
  StatusPengajuanEvaluasi,
  StatusSOP,
} from '../../generated/prisma';
import { RegisterTteDto } from './register-tte.dto';
import { TandaTanganiDto } from './tanda-tangani.dto';
import { TteRepository } from './tte.repository';

/** Respons profil TTE untuk klien (mirror `KredensialTTE` di frontend). */
export type TteProfilResponse = {
  readonly id: string;
  readonly userId: string;
  readonly emailTerverifikasi: boolean;
  readonly peran: 'KEPALA_OPD' | 'PJ_EVALUATOR' | 'PJ_PENYUSUN';
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly user?: {
    readonly id: string;
    readonly nama: string;
    readonly email: string;
    readonly nip: string;
    readonly jabatan: string;
    readonly pangkat: string;
  };
};

export type TteRiwayatResponse = {
  readonly id: string;
  readonly userId: string;
  readonly peran: 'KEPALA_OPD' | 'PJ_EVALUATOR' | 'PJ_PENYUSUN';
  readonly nomorDokumen: string;
  readonly jenisDokumen: string;
  readonly judulDokumen: string;
  readonly hashDokumen: string;
  readonly sopDetailId?: string;
  readonly pengajuanEvaluasiId?: string;
  readonly ditandatanganiPada: string;
  readonly user?: { readonly id: string; readonly nama: string; readonly nip: string };
};

/**
 * TTE tanpa gateway BSSN: PIN (bcrypt), hash dokumen (SHA-256), nilai tanda tangan (HMAC-SHA256 + `TTE_SIGNING_SECRET`).
 * Cocok untuk production sebagai **jejak audit teknik internal**; bukan pengesahan hukum setara BSRE/PKI nasional.
 */
@Injectable()
export class TteService {
  private readonly signingSecret: string;

  constructor(
    private readonly tteRepository: TteRepository,
    private readonly configService: ConfigService,
  ) {
    const raw = this.configService.get<string>('TTE_SIGNING_SECRET', '');
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    if (raw.length >= 16) {
      this.signingSecret = raw;
      return;
    }
    if (nodeEnv === 'production') {
      throw new Error(
        'TTE_SIGNING_SECRET tidak valid — seharusnya sudah divalidasi di ConfigModule (production minimal 32 karakter)',
      );
    }
    this.signingSecret = 'local-dev-only-tte-secret-min16';
  }

  private mapPeranResponse(peran: PeranPengguna): 'KEPALA_OPD' | 'PJ_EVALUATOR' | 'PJ_PENYUSUN' {
    if (peran === PeranPengguna.KEPALA_OPD) {
      return 'KEPALA_OPD';
    }
    if (peran === PeranPengguna.PJ_EVALUATOR) {
      return 'PJ_EVALUATOR';
    }
    if (peran === PeranPengguna.PJ_PENYUSUN) {
      return 'PJ_PENYUSUN';
    }
    throw new ForbiddenException('Peran tidak mendukung TTE');
  }

  private hashDokumenKanonik(params: {
    jenis: JenisDokumenTte;
    nomorDokumen: string;
    judulDokumen: string;
    refId: string;
  }): string {
    const canonical = [
      params.jenis,
      params.refId,
      params.nomorDokumen.trim(),
      params.judulDokumen.trim(),
    ].join('|');
    return createHash('sha256').update(canonical, 'utf8').digest('hex');
  }

  private buildSignatureMetadata(params: {
    hashDokumen: string;
    userId: string;
    peran: PeranPengguna;
    signedAt: Date;
    nama: string;
    nip: string;
  }) {
    const certSerialNumber = randomUUID().replace(/-/g, '').slice(0, 32).toUpperCase();
    const certSubject = `CN=${params.nama},SERIALNUMBER=NIP:${params.nip},OU=BSSN-MOCK-TTE,O=SIMULASI`;
    const certIssuer = 'CN=BSSN-MOCK-PKI,OU=Simulasi,O=TugasAkhir';
    const certFingerprint = createHash('sha256').update(certSubject + certSerialNumber).digest('hex');
    const payload = [
      params.hashDokumen,
      params.userId,
      params.peran,
      params.signedAt.toISOString(),
      certSerialNumber,
    ].join('|');
    const signatureValue = createHmac('sha256', this.signingSecret).update(payload, 'utf8').digest('base64');
    const certValidFrom = new Date(params.signedAt);
    const certValidTo = new Date(params.signedAt);
    certValidTo.setFullYear(certValidTo.getFullYear() + 1);
    return {
      signatureValue,
      signatureAlgorithm: 'RSA-SHA256-MOCK',
      signatureFormat: 'PKCS7-DETACHED-MOCK',
      certSerialNumber,
      certIssuer,
      certSubject,
      certFingerprint,
      certValidFrom,
      certValidTo,
      keyId: `mock-key-${params.userId.slice(0, 8)}`,
    };
  }

  async getProfil(user: JwtAccessPayload): Promise<TteProfilResponse | null> {
    const pengguna = await this.tteRepository.findPenggunaAktif(user.sub);
    if (pengguna === null) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }
    const peranClient = this.mapPeranResponse(pengguna.peran);
    const row = await this.tteRepository.findKredensial(user.sub);
    if (row === null) {
      return null;
    }
    return {
      id: row.kredensialTteId,
      userId: row.userId,
      emailTerverifikasi: row.emailTerverifikasi,
      peran: peranClient,
      createdAt: row.createdAt.toISOString(),
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

  async registerProfil(user: JwtAccessPayload, dto: RegisterTteDto): Promise<TteProfilResponse> {
    const pengguna = await this.tteRepository.findPenggunaAktif(user.sub);
    if (pengguna === null) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }
    const peranClient = this.mapPeranResponse(pengguna.peran);
    const hashPin = await bcrypt.hash(dto.pin, 10);
    const row = await this.tteRepository.upsertKredensialPin({
      userId: user.sub,
      hashPin,
      emailTerverifikasi: true,
    });
    return {
      id: row.kredensialTteId,
      userId: row.userId,
      emailTerverifikasi: row.emailTerverifikasi,
      peran: peranClient,
      createdAt: row.createdAt.toISOString(),
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

  /** Kompatibilitas klien lama — tidak mengirim email; token hanya placeholder. */
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

  async listRiwayat(user: JwtAccessPayload): Promise<TteRiwayatResponse[]> {
    const rows = await this.tteRepository.findRiwayatUser(user.sub);
    return rows.map((r) => this.mapRiwayat(r));
  }

  private mapRiwayat(row: {
    riwayatTandaTanganId: string;
    userId: string;
    peran: PeranPengguna;
    ditandatanganiPada: Date;
    dokumenTte: {
      nomorDokumen: string;
      judulDokumen: string;
      hashDokumen: string;
      jenisDokumen: JenisDokumenTte;
      detailSopId: string | null;
      pengajuanEvaluasiId: string | null;
    };
    user: { penggunaId: string; nama: string; nip: string };
  }): TteRiwayatResponse {
    const peranMap = this.mapPeranResponse(row.peran);
    return {
      id: row.riwayatTandaTanganId,
      userId: row.userId,
      peran: peranMap,
      nomorDokumen: row.dokumenTte.nomorDokumen,
      jenisDokumen: String(row.dokumenTte.jenisDokumen),
      judulDokumen: row.dokumenTte.judulDokumen,
      hashDokumen: row.dokumenTte.hashDokumen,
      sopDetailId: row.dokumenTte.detailSopId ?? undefined,
      pengajuanEvaluasiId: row.dokumenTte.pengajuanEvaluasiId ?? undefined,
      ditandatanganiPada: row.ditandatanganiPada.toISOString(),
      user: { id: row.user.penggunaId, nama: row.user.nama, nip: row.user.nip },
    };
  }

  private async assertPinValid(userId: string, pin: string): Promise<void> {
    const row = await this.tteRepository.findKredensial(userId);
    if (row === null) {
      throw new BadRequestException('Kredensial TTE belum dibuat');
    }
    const ok = await bcrypt.compare(pin, row.hashPin);
    if (!ok) {
      throw new ForbiddenException('PIN TTE tidak valid');
    }
  }

  async tandaTanganiBa(
    user: JwtAccessPayload,
    pengajuanEvaluasiId: string,
    dto: TandaTanganiDto,
  ): Promise<TteRiwayatResponse> {
    const pengguna = await this.tteRepository.findPenggunaAktif(user.sub);
    if (pengguna === null) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }
    await this.assertPinValid(user.sub, dto.pin);
    const hashDokumen = this.hashDokumenKanonik({
      jenis: JenisDokumenTte.BERITA_ACARA_EVALUASI,
      nomorDokumen: dto.nomorDokumen,
      judulDokumen: dto.judulDokumen,
      refId: pengajuanEvaluasiId,
    });
    const signedAt = new Date();
    const signatureFields = this.buildSignatureMetadata({
      hashDokumen,
      userId: user.sub,
      peran: pengguna.peran,
      signedAt,
      nama: pengguna.nama,
      nip: pengguna.nip,
    });
    if (pengguna.peran === PeranPengguna.PJ_EVALUATOR) {
      const result = await this.tteRepository.transaksiTandaTanganiBaEvaluator({
        pengajuanEvaluasiId,
        userId: user.sub,
        peran: PeranPengguna.PJ_EVALUATOR,
        hashDokumen,
        nomorDokumen: dto.nomorDokumen,
        judulDokumen: dto.judulDokumen,
        signatureFields,
      });
      if (result.error === 'NOT_FOUND') {
        throw new NotFoundException('Pengajuan evaluasi tidak ditemukan');
      }
      if (result.error === 'BAD_STATUS') {
        throw new ConflictException(
          `Pengajuan tidak dapat ditandatangani pada status ${String((result as { status?: StatusPengajuanEvaluasi }).status)}`,
        );
      }
      if (result.error === 'ALREADY_SIGNED') {
        throw new ConflictException('Berita Acara sudah ditandatangani untuk peran ini');
      }
      if (!result.ok || result.riwayat === null || result.riwayat === undefined) {
        throw new ConflictException('Gagal menyelesaikan penandatanganan');
      }
      return this.mapRiwayat(result.riwayat);
    }
    if (pengguna.peran === PeranPengguna.PJ_PENYUSUN) {
      const result = await this.tteRepository.transaksiTandaTanganiBaKoordinator({
        pengajuanEvaluasiId,
        userId: user.sub,
        userOpdId: pengguna.opdId,
        peran: PeranPengguna.PJ_PENYUSUN,
        hashDokumen,
        nomorDokumen: dto.nomorDokumen,
        judulDokumen: dto.judulDokumen,
        signatureFields,
      });
      if (result.error === 'NOT_FOUND') {
        throw new NotFoundException('Pengajuan evaluasi tidak ditemukan');
      }
      if (result.error === 'FORBIDDEN_OPD') {
        throw new ForbiddenException('Pengajuan tidak termasuk OPD Anda');
      }
      if (result.error === 'BAD_STATUS') {
        throw new ConflictException(
          `Pengajuan tidak dapat ditandatangani pada status ${String((result as { status?: StatusPengajuanEvaluasi }).status)}`,
        );
      }
      if (result.error === 'ALREADY_SIGNED') {
        throw new ConflictException('Berita Acara sudah ditandatangani untuk peran ini');
      }
      if (!result.ok || result.riwayat === null || result.riwayat === undefined) {
        throw new ConflictException('Gagal menyelesaikan penandatanganan');
      }
      return this.mapRiwayat(result.riwayat);
    }
    throw new ForbiddenException('Hanya PJ Evaluator atau PJ Penyusun yang dapat menandatangani Berita Acara');
  }

  async tandaTanganiSop(
    user: JwtAccessPayload,
    detailSopId: string,
    dto: TandaTanganiDto,
  ): Promise<TteRiwayatResponse> {
    const pengguna = await this.tteRepository.findPenggunaAktif(user.sub);
    if (pengguna === null) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }
    if (pengguna.peran !== PeranPengguna.KEPALA_OPD) {
      throw new ForbiddenException('Hanya Kepala OPD yang dapat mengesahkan SOP');
    }
    await this.assertPinValid(user.sub, dto.pin);
    const hashDokumen = this.hashDokumenKanonik({
      jenis: JenisDokumenTte.SOP_BERLAKU,
      nomorDokumen: dto.nomorDokumen,
      judulDokumen: dto.judulDokumen,
      refId: detailSopId,
    });
    const signedAt = new Date();
    const signatureFields = this.buildSignatureMetadata({
      hashDokumen,
      userId: user.sub,
      peran: PeranPengguna.KEPALA_OPD,
      signedAt,
      nama: pengguna.nama,
      nip: pengguna.nip,
    });
    const result = await this.tteRepository.transaksiTandaTanganiSop({
      detailSopId,
      userId: user.sub,
      userOpdId: pengguna.opdId,
      peran: PeranPengguna.KEPALA_OPD,
      hashDokumen,
      nomorDokumen: dto.nomorDokumen,
      judulDokumen: dto.judulDokumen,
      signatureFields,
    });
    if (result.error === 'NOT_FOUND') {
      throw new NotFoundException('Detail SOP tidak ditemukan');
    }
    if (result.error === 'FORBIDDEN_OPD') {
      throw new ForbiddenException('SOP tidak termasuk OPD Anda');
    }
    if (result.error === 'BAD_SOP_STATUS') {
      throw new ConflictException(
        `Tidak dapat mengesahkan SOP dari status ${String((result as { status?: StatusSOP }).status)}`,
      );
    }
    if (result.error === 'ALREADY_SIGNED') {
      throw new ConflictException('SOP sudah ditandatangani oleh Kepala OPD');
    }
    if (!result.ok || result.riwayat === null || result.riwayat === undefined) {
      throw new ConflictException('Gagal menyelesaikan penandatanganan');
    }
    return this.mapRiwayat(result.riwayat);
  }
}
