import { z } from 'zod';
import ms, { type StringValue } from 'ms';

function isValidJwtExpiration(value: string): boolean {
  if (/^\d+$/.test(value)) {
    return true;
  }

  try {
    const parsed = ms(value as StringValue);
    return typeof parsed === 'number' && Number.isFinite(parsed);
  } catch {
    return false;
  }
}

function normalizeJwtExpiration(value: string): string {
  const trimmed = value.trim();
  const withoutInlineComment = trimmed.split(/\s+#/)[0] ?? trimmed;
  const unquoted = withoutInlineComment.replace(/^['"]|['"]$/g, '').trim();

  // Guard against accidental terminal/table glyphs copied into .env
  return unquoted.replace(/[|\u2500-\u257F]+$/g, '').trim();
}

export const envSchema = z.object({
  // Database
  DATABASE_HOST: z.string().min(1),
  DATABASE_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('3306'),
  DATABASE_USER: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),
  DATABASE_NAME: z.string().min(1),
  // Note: DATABASE_URL removed for security - use individual env vars above

  // Server
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('3000'),
  NODE_ENV: z
    .enum(['development', 'production', 'test', 'staging'])
    .default('development'),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRATION: z
    .string()
    .default('15m')
    .transform(normalizeJwtExpiration)
    .refine((value) => isValidJwtExpiration(value), {
      message:
        'JWT_EXPIRATION must be seconds (e.g. 900) or timespan (e.g. 15m, 1h, 7d)',
    }),
  JWT_REFRESH_EXPIRATION: z
    .string()
    .default('7d')
    .transform(normalizeJwtExpiration)
    .refine((value) => isValidJwtExpiration(value), {
      message:
        'JWT_REFRESH_EXPIRATION must be seconds (e.g. 604800) or timespan (e.g. 7d)',
    }),

  // CORS
  ALLOWED_ORIGINS: z.string().optional(),

  // API
  API_PREFIX: z.string().default('/api'),
  API_VERSION: z.string().default('v1'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  return envSchema.parse(config);
}
