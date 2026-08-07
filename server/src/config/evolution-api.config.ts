export const DEFAULT_EVOLUTION_API_BASE_URL = 'https://evolution.example.test';

export function normalizeEvolutionApiBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}
