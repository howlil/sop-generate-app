import { z } from 'zod';

const envBoolean = (defaultValue: boolean) =>
  z.preprocess((val) => {
    if (typeof val !== 'string') {
      return val;
    }
    const normalized = val.trim().toLowerCase();
    if (normalized === '') {
      return undefined;
    }
    if (['true', '1', 'yes', 'on'].includes(normalized)) {
      return true;
    }
    if (['false', '0', 'no', 'off'].includes(normalized)) {
      return false;
    }
    return val;
  }, z.boolean().default(defaultValue));

/**
 * Skema env: `TTE_SIGNING_SECRET` wajib dan panjang di production (HMAC penandatanganan server).
 * Di development/test boleh kosong — `TteService` memakai nilai cadangan dev yang tidak dipakai di production.
 */
const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    ALLOWED_ORIGINS: z.string().optional(),
    SWAGGER_ENABLED: z.coerce.boolean().default(true),
    JWT_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32).optional(),
    JWT_EXPIRATION: z.preprocess(
      (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
      z.string().default('15m'),
    ),
    JWT_REFRESH_EXPIRATION: z.string().default('7d'),
    DATABASE_HOST: z.string().min(1),
    DATABASE_USER: z.string().min(1),
    DATABASE_PASSWORD: z.string().min(1),
    DATABASE_NAME: z.string().min(1),
    DATABASE_URL: z.string().url(),
    TTE_SIGNING_SECRET: z.preprocess(
      (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
      z.string().min(16).optional(),
    ),
    /** Basis URL publik (frontend) untuk tautan verifikasi dokumen di QR — opsional; tanpa ini QR memakai JSON deterministik. */
    PUBLIC_TTE_VERIFY_BASE_URL: z.preprocess(
      (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
      z.string().url().optional(),
    ),
    PDF_SIGNING_ENABLED: envBoolean(false),
    PDF_SIGNING_P12_BASE64: z.preprocess(
      (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
      z.string().optional(),
    ),
    PDF_SIGNING_P12_PASSPHRASE: z.string().default(''),
    PDF_SIGNING_REASON: z.string().default('Pengesahan dokumen SOP'),
    PDF_SIGNING_LOCATION: z.string().default('Indonesia'),
    PDF_SIGNING_CONTACT: z.string().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.PDF_SIGNING_ENABLED && data.PDF_SIGNING_P12_BASE64 === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'PDF_SIGNING_P12_BASE64 wajib jika PDF_SIGNING_ENABLED=true. Isi dengan file .p12/.pfx yang di-encode base64.',
        path: ['PDF_SIGNING_P12_BASE64'],
      });
    }
    if (data.NODE_ENV !== 'production') {
      return;
    }
    const secret = data.TTE_SIGNING_SECRET;
    if (secret === undefined || secret.length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'TTE_SIGNING_SECRET wajib pada NODE_ENV=production (minimal 32 karakter). Gunakan nilai acak kuat (mis. openssl rand -hex 32), jangan commit ke git.',
        path: ['TTE_SIGNING_SECRET'],
      });
    }
  });

export function validateEnv(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const errors = parsed.error.errors
      .map((error) => `${error.path.join('.')}: ${error.message}`)
      .join('; ');

    throw new Error(`Invalid environment configuration: ${errors}`);
  }

  return parsed.data;
}
