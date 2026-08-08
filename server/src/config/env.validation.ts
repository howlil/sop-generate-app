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

const trimmedEnvironmentString = (val: unknown) => (typeof val === 'string' ? val.trim() : val);

const optionalUrl = z.preprocess((val) => {
  const normalized = trimmedEnvironmentString(val);
  return normalized === '' ? undefined : normalized;
}, z.string().url().optional());

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    ALLOWED_ORIGINS: z.preprocess(trimmedEnvironmentString, z.string().optional()),
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
    // Hanya dibutuhkan oleh tooling lokal yang memilih memberi URL langsung.
    // Runtime aplikasi memakai konfigurasi DATABASE_* individual.
    DATABASE_URL: z.string().url().optional(),
    /** Override origin frontend (mis. https://app.domain.go.id). Kosong = deteksi dari header request. */
    PUBLIC_APP_ORIGIN: optionalUrl,
    SOP_PDF_STORAGE_DIR: z.preprocess(
      trimmedEnvironmentString,
      z.string().min(1).default('/app/storage/sop-pdf'),
    ),

    NOTIFICATION_IN_APP_ENABLED: envBoolean(true),
    NOTIFICATION_RECONCILE_INTERVAL_SECONDS: z.coerce.number().int().min(1).max(300).default(10),

    WHAAPI_BASE_URL: z.preprocess(
      trimmedEnvironmentString,
      z.string().default('https://whaapi.flobaze.com'),
    ),
    WHAAPI_TOKEN: z.preprocess(trimmedEnvironmentString, z.string().default('')),
    WHAAPI_CHANNEL_ID: z.preprocess(trimmedEnvironmentString, z.string().default('')),
    WHATSAPP_ALLOWED_RECIPIENTS: z.preprocess(
      trimmedEnvironmentString,
      z.string().default(''),
    ),
    WHATSAPP_REMINDER_INTERVAL_MINUTES: z.coerce.number().int().min(1).max(43_200).default(1440),
    WHATSAPP_REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(60_000).default(10_000),
    WHATSAPP_MAX_CONCURRENCY: z.coerce.number().int().min(1).max(20).default(3),
    WHATSAPP_LOCK_LEASE_SECONDS: z.coerce.number().int().min(10).max(600).default(60),

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
    if (data.WHAAPI_TOKEN === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'WHAAPI_TOKEN wajib diisi',
        path: ['WHAAPI_TOKEN'],
      });
    }
    if (data.WHAAPI_CHANNEL_ID === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'WHAAPI_CHANNEL_ID wajib diisi',
        path: ['WHAAPI_CHANNEL_ID'],
      });
    }
    if (data.PDF_SIGNING_P12_BASE64 === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'PDF_SIGNING_P12_BASE64 wajib diisi dengan file .p12/.pfx yang di-encode base64.',
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
