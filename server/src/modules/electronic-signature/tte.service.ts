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
import { buildTteQrPayload } from './tte-verifikasi-qr.util';
import { TteRepository } from './tte.repository';

/** Respons profil TTE untuk klien — PIN disimpan di baris `Pengguna`. */
export type TteProfilResponse = {
  readonly id: string;
  readonly userId: string;
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
  /** ID `DokumenTte` — dipakai untuk payload QR tanpa kolom tambahan di DB. */
  readonly dokumenTteId: string;
  readonly nomorDokumen: string;
  readonly jenisDokumen: string;
  readonly judulDokumen: string;
  readonly hashDokumen: string;
  readonly sopDetailId?: string;
  readonly pengajuanEvaluasiId?: string;
  readonly ditandatanganiPada: string;
  readonly user?: { readonly id: string; readonly nama: string; readonly nip: string };
  /** URL publik verifikasi jika `PUBLIC_TTE_VERIFY_BASE_URL` di-set; selain itu null (pakai `qrPayload`). */
  readonly qrVerificationUrl: string | null;
  /** String yang di-encode ke QR (URL publik atau JSON deterministik). */
  readonly qrPayload: string;
};

/** Respons GET publik verifikasi pengesahan (scan QR) — kunci junction `(userId, dokumenTteId)`; tanpa nilai tanda tangan mentah. */
export type TtePengesahanPublicResponse = {
  readonly userId: string;
  readonly dokumenTteId: string;
  readonly ditandatanganiPada: string;
  readonly peran: 'KEPALA_OPD' | 'PJ_EVALUATOR' | 'PJ_PENYUSUN';
  readonly penandatangan: {
    readonly nama: string;
    readonly nip: string;
    readonly jabatan: string;
  };
  readonly dokumen: {
    readonly dokumenTteId: string;
    readonly nomorDokumen: string;
    readonly judulDokumen: string;
    readonly jenisDokumen: string;
    readonly hashDokumen: string;
    readonly sopDetailId?: string;
    readonly pengajuanEvaluasiId?: string;
  };
  readonly qrVerificationUrl: string | null;
  readonly qrPayload: string;
};

export type TteBatchSignSopPengajuanResponse = {
  readonly pengajuanEvaluasiId: string;
  readonly totalSopDitandatangani: number;
  readonly ditandatanganiPada: string;
};

/**
 * TTE tanpa gateway BSSN: PIN (bcrypt), hash dokumen (SHA-256), nilai tanda tangan (HMAC-SHA256 + `TTE_SIGNING_SECRET`).
 * Cocok untuk production sebagai **jejak audit teknik internal**; bukan pengesahan hukum setara BSRE/PKI nasional.
 */
@Injectable()
export class TteService {
  private readonly signingSecret: string;
  private readonly publicTteVerifyBaseUrl: string | undefined;

  constructor(
    private readonly tteRepository: TteRepository,
    private readonly configService: ConfigService,
  ) {
    this.publicTteVerifyBaseUrl = this.configService.get<string>('PUBLIC_TTE_VERIFY_BASE_URL');
    const raw = this.configService.get<string>('TTE_SIGNING_SECRET', '');
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    if (raw.length >= 16) {
      this.signingSecret = raw;
    } else if (nodeEnv === 'production') {
      throw new Error(
        'TTE_SIGNING_SECRET tidak valid — seharusnya sudah divalidasi di ConfigModule (production minimal 32 karakter)',
      );
    } else {
      this.signingSecret = 'local-dev-only-tte-secret-min16';
    }
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
      id: pengguna.penggunaId,
      userId: pengguna.penggunaId,
      peran: peranClient,
      createdAt: row.ttePinSetAt.toISOString(),
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
    });
    return {
      id: pengguna.penggunaId,
      userId: pengguna.penggunaId,
      peran: peranClient,
      createdAt: row.ttePinSetAt.toISOString(),
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

  /**
   * Verifikasi publik: data pengesahan berdasarkan pasangan junction `(userId, dokumenTteId)` (nilai di URL/QR).
   * Tidak memerlukan autentikasi.
   */
  async getPengesahanPublic(dokumenTteId: string, userId: string): Promise<TtePengesahanPublicResponse> {
    const row = await this.tteRepository.findRiwayatPengesahanByUserAndDokumen(userId, dokumenTteId);
    if (row === null || row.dokumenTte === null || row.user === null) {
      throw new NotFoundException('Data pengesahan tidak ditemukan');
    }
    const qr = buildTteQrPayload({
      publicVerifyBaseUrl: this.publicTteVerifyBaseUrl,
      dokumenTteId: row.dokumenTte.dokumenTteId,
      hashDokumen: row.dokumenTte.hashDokumen,
    });
    const peran = this.mapPeranResponse(row.peran);
    return {
      userId: row.userId,
      dokumenTteId: row.dokumenTteId,
      ditandatanganiPada: row.ditandatanganiPada.toISOString(),
      peran,
      penandatangan: {
        nama: row.user.nama,
        nip: row.user.nip,
        jabatan: row.user.jabatan ?? '',
      },
      dokumen: {
        dokumenTteId: row.dokumenTte.dokumenTteId,
        nomorDokumen: row.dokumenTte.nomorDokumen,
        judulDokumen: row.dokumenTte.judulDokumen,
        jenisDokumen: String(row.dokumenTte.jenisDokumen),
        hashDokumen: row.dokumenTte.hashDokumen,
        sopDetailId: row.dokumenTte.detailSopId ?? undefined,
        pengajuanEvaluasiId: row.dokumenTte.pengajuanEvaluasiId ?? undefined,
      },
      qrVerificationUrl: qr.qrVerificationUrl,
      qrPayload: qr.qrPayload,
    };
  }

  private mapRiwayat(row: {
    userId: string;
    dokumenTteId: string;
    peran: PeranPengguna;
    ditandatanganiPada: Date;
    dokumenTte: {
      dokumenTteId: string;
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
    const qr = buildTteQrPayload({
      publicVerifyBaseUrl: this.publicTteVerifyBaseUrl,
      dokumenTteId: row.dokumenTte.dokumenTteId,
      hashDokumen: row.dokumenTte.hashDokumen,
    });
    return {
      id: `${row.dokumenTte.dokumenTteId}:${row.userId}`,
      userId: row.userId,
      peran: peranMap,
      dokumenTteId: row.dokumenTte.dokumenTteId,
      nomorDokumen: row.dokumenTte.nomorDokumen,
      jenisDokumen: String(row.dokumenTte.jenisDokumen),
      judulDokumen: row.dokumenTte.judulDokumen,
      hashDokumen: row.dokumenTte.hashDokumen,
      sopDetailId: row.dokumenTte.detailSopId ?? undefined,
      pengajuanEvaluasiId: row.dokumenTte.pengajuanEvaluasiId ?? undefined,
      ditandatanganiPada: row.ditandatanganiPada.toISOString(),
      user: { id: row.user.penggunaId, nama: row.user.nama, nip: row.user.nip },
      qrVerificationUrl: qr.qrVerificationUrl,
      qrPayload: qr.qrPayload,
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
      if (result.error === 'INVALID_DOC_PARENT') {
        throw new ConflictException(
          'Data dokumen TTE tidak konsisten: wajib tepat satu referensi parent (DetailSOP atau PengajuanEvaluasi)',
        );
      }
      if (!result.ok || result.riwayat === null || result.riwayat === undefined) {
        throw new ConflictException('Gagal menyelesaikan penandatanganan');
      }
      return this.mapRiwayat(result.riwayat);
    }
    if (pengguna.peran === PeranPengguna.PJ_PENYUSUN) {
      const result = await this.tteRepository.transaksiTandaTanganiBaPjPenyusun({
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
      if (result.error === 'INVALID_DOC_PARENT') {
        throw new ConflictException(
          'Data dokumen TTE tidak konsisten: wajib tepat satu referensi parent (DetailSOP atau PengajuanEvaluasi)',
        );
      }
      if (result.error === 'DOC_MISMATCH') {
        throw new ConflictException('Dokumen TTE tidak cocok dengan pengajuan evaluasi');
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
    if (result.error === 'INVALID_DOC_PARENT') {
      throw new ConflictException(
        'Data dokumen TTE tidak konsisten: wajib tepat satu referensi parent (DetailSOP atau PengajuanEvaluasi)',
      );
    }
    if (!result.ok || result.riwayat === null || result.riwayat === undefined) {
      throw new ConflictException('Gagal menyelesaikan penandatanganan');
    }
    return this.mapRiwayat(result.riwayat);
  }

  async tandaTanganiSemuaSopPengajuan(
    user: JwtAccessPayload,
    pengajuanEvaluasiId: string,
    dto: TandaTanganiDto,
  ): Promise<TteBatchSignSopPengajuanResponse> {
    const pengguna = await this.tteRepository.findPenggunaAktif(user.sub);
    if (pengguna === null) {
      throw new NotFoundException('Pengguna tidak ditemukan');
    }
    if (pengguna.peran !== PeranPengguna.KEPALA_OPD) {
      throw new ForbiddenException('Hanya Kepala OPD yang dapat menandatangani seluruh SOP');
    }
    await this.assertPinValid(user.sub, dto.pin);
    const hashDokumen = this.hashDokumenKanonik({
      jenis: JenisDokumenTte.SOP_BERLAKU,
      nomorDokumen: dto.nomorDokumen,
      judulDokumen: dto.judulDokumen,
      refId: pengajuanEvaluasiId,
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
    const result = await this.tteRepository.transaksiTandaTanganiSemuaSopPengajuan({
      pengajuanEvaluasiId,
      userId: user.sub,
      userOpdId: pengguna.opdId,
      peran: PeranPengguna.KEPALA_OPD,
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
    if (result.error === 'BAD_PENGAJUAN_STATUS') {
      throw new ConflictException(
        `Pengajuan tidak dapat ditandatangani pada status ${String((result as { status?: StatusPengajuanEvaluasi }).status)}. Batch tanda tangan Kepala OPD hanya diizinkan pada status ${String((result as { expectedStatus?: StatusPengajuanEvaluasi }).expectedStatus ?? StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN)}.`,
      );
    }
    if (result.error === 'EMPTY_SOP') {
      throw new BadRequestException('Pengajuan tidak memiliki SOP untuk ditandatangani');
    }
    if (result.error === 'BAD_SOP_STATUS') {
      throw new ConflictException(
        `SOP ${String((result as { nomorSOP?: string }).nomorSOP ?? (result as { detailSopId?: string }).detailSopId)} (${String((result as { judulSOP?: string }).judulSOP ?? '-')}) tidak dapat ditandatangani dari status ${String((result as { status?: StatusSOP }).status)}. Status yang diwajibkan: ${String((result as { expectedStatus?: StatusSOP }).expectedStatus ?? StatusSOP.DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI)}.`,
      );
    }
    if (result.error === 'ALREADY_SIGNED') {
      throw new ConflictException(
        `SOP ${String((result as { detailSopId?: string }).detailSopId)} sudah ditandatangani oleh Kepala OPD`,
      );
    }
    if (result.error === 'INVALID_DOC_PARENT') {
      throw new ConflictException(
        `Data dokumen TTE tidak konsisten untuk SOP ${String((result as { detailSopId?: string }).detailSopId)}: wajib tepat satu referensi parent (DetailSOP atau PengajuanEvaluasi)`,
      );
    }
    if (!result.ok) {
      throw new ConflictException('Gagal menandatangani seluruh SOP dalam pengajuan');
    }
    return {
      pengajuanEvaluasiId,
      totalSopDitandatangani: result.totalSopDitandatangani,
      ditandatanganiPada: signedAt.toISOString(),
    };
  }
}
