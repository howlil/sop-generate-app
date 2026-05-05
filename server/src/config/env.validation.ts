import { z } from 'zod';

/**
 * Skema env: `TTE_SIGNING_SECRET` wajib dan panjang di production (HMAC penandatanganan server).
 * Di development/test boleh kosong — `TteService` memakai fallback dev yang tidak dipakai di production.
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
  })
  .superRefine((data, ctx) => {
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
