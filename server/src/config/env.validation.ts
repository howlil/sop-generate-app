import { z } from 'zod';

export const envSchema = z.object({
  // Database
  DATABASE_HOST: z.string().min(1),
  DATABASE_PORT: z.string().transform((val) => parseInt(val, 10)).default('3306'),
  DATABASE_USER: z.string().min(1),
  DATABASE_PASSWORD: z.string().min(1),
  DATABASE_NAME: z.string().min(1),
  // Note: DATABASE_URL removed for security - use individual env vars above

  // Server
  PORT: z.string().transform((val) => parseInt(val, 10)).default('3000'),
  NODE_ENV: z
    .enum(['development', 'production', 'test', 'staging'])
    .default('development'),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRATION: z.string().default('1d'),

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
