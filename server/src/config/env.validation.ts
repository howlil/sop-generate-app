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

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    ALLOWED_ORIGINS: z.string().optional(),
    SWAGGER_ENABLED: envBoolean(true),
    JWT_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32).optional(),
    JWT_EXPIRATION: z.preprocess(
      (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
      z.string().default('15m'),
    ),
    JWT_REFRESH_EXPIRATION: z.string().default('7d'),
    DATABASE_HOST: z.string().min(1),
    DATABASE_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
    DATABASE_USER: z.string().min(1),
    DATABASE_PASSWORD: z.string().min(1),
    DATABASE_NAME: z.string().min(1),
    DATABASE_URL: z.string().url(),
    /** Override origin frontend (mis. https://app.domain.go.id). Kosong = deteksi dari header request. */
    PUBLIC_APP_ORIGIN: z.preprocess(
      (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
      z.string().url().optional(),
    ),

    WHATSAPP_ENABLED: envBoolean(false),
    WAHA_BASE_URL: z.preprocess(
      (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
      z.string().url().optional(),
    ),
    WAHA_API_KEY: z.preprocess(
      (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
      z.string().min(16).optional(),
    ),
    WAHA_SESSION: z.string().trim().min(1).max(64).default('sop-staging'),
    WHATSAPP_ALLOWED_RECIPIENTS: z.string().default(''),
    WHATSAPP_RECONCILE_INTERVAL_SECONDS: z.coerce.number().int().min(1).max(300).default(10),
    WHATSAPP_REMINDER_INTERVAL_MINUTES: z.coerce.number().int().min(1).max(43_200).default(1_440),
    WHATSAPP_REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(60_000).default(10_000),
    WHATSAPP_MAX_CONCURRENCY: z.coerce.number().int().min(1).max(20).default(3),
    WHATSAPP_LOCK_LEASE_SECONDS: z.coerce.number().int().min(10).max(600).default(60),

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
    if (data.WHATSAPP_ENABLED) {
      if (data.WAHA_BASE_URL === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'WAHA_BASE_URL wajib jika WHATSAPP_ENABLED=true',
          path: ['WAHA_BASE_URL'],
        });
      }
      if (data.WAHA_API_KEY === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'WAHA_API_KEY wajib jika WHATSAPP_ENABLED=true (minimal 16 karakter)',
          path: ['WAHA_API_KEY'],
        });
      }
      if (data.WHATSAPP_ALLOWED_RECIPIENTS.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'WHATSAPP_ALLOWED_RECIPIENTS wajib pada staging agar pesan tidak terkirim ke nomor di luar pengujian',
          path: ['WHATSAPP_ALLOWED_RECIPIENTS'],
        });
      }
    }
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
    if (data.JWT_REFRESH_SECRET === undefined || data.JWT_REFRESH_SECRET.length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'JWT_REFRESH_SECRET wajib pada NODE_ENV=production (minimal 32 karakter). Gunakan secret berbeda dari JWT_SECRET.',
        path: ['JWT_REFRESH_SECRET'],
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
