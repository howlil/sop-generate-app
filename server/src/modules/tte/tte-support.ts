import {
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, createHmac, randomUUID } from 'crypto';
import {
  JenisDokumenTte,
  PeranPengguna,
  Prisma,
} from '../../generated/prisma';

export function resolveTteSigningSecret(configService: ConfigService): string {
  const raw = configService.get<string>('TTE_SIGNING_SECRET', '');
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  if (raw.length >= 16) {
    return raw;
  }
  if (nodeEnv === 'production') {
    throw new Error(
      'TTE_SIGNING_SECRET tidak valid — seharusnya sudah divalidasi di ConfigModule (production minimal 32 karakter)',
    );
  }
  return 'local-dev-only-tte-secret-min16';
}

export function mapTtePeranResponse(
  peran: PeranPengguna,
): 'KEPALA_OPD' | 'PJ_EVALUATOR' | 'PJ_PENYUSUN' {
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

export function hashDokumenKanonik(params: {
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

export function buildSignatureMetadata(
  signingSecret: string,
  params: {
    hashDokumen: string;
    userId: string;
    peran: PeranPengguna;
    signedAt: Date;
    nama: string;
    nip: string;
  },
) {
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
  const signatureValue = createHmac('sha256', signingSecret)
    .update(payload, 'utf8')
    .digest('base64');
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

export async function runTteRepositoryMutation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target)
        ? err.meta.target.map(String).join(',')
        : String(err.meta?.target ?? '');
      if (target.includes('nomorDokumen')) {
        throw new ConflictException('Nomor dokumen sudah digunakan');
      }
    }
    throw err;
  }
}
