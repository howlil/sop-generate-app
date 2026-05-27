import { z } from 'zod'

/**
 * Skema variabel lingkungan sisi klien (Vite).
 * Diparse saat modul pertama kali diimpor agar konfigurasi salah terdeteksi dini.
 */
export const clientEnvSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .min(1)
    .refine(
      (val) => val.startsWith('/') || /^https?:\/\//i.test(val),
      'VITE_API_BASE_URL harus path relatif (awalan /) atau URL absolut http(s)',
    ),
})

export type ClientEnv = z.infer<typeof clientEnvSchema>

function readApiBaseUrl(): string {
  const raw: unknown = import.meta.env.VITE_API_BASE_URL
  if (typeof raw === 'string' && raw.trim() !== '') {
    return raw.trim().replace(/\/$/, '')
  }
  return 'http://localhost:3000/api/v1'
}

export function resolveApiBaseUrl(): string {
  return readApiBaseUrl()
}

/** Untuk unit test: parse input mentah tanpa membaca import.meta. */
export function parseClientEnv(input: z.input<typeof clientEnvSchema>): ClientEnv {
  return clientEnvSchema.parse(input)
}

export const clientEnv: ClientEnv = parseClientEnv({
  VITE_API_BASE_URL: readApiBaseUrl(),
})
