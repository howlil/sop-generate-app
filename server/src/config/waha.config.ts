export const DEFAULT_WAHA_BASE_URL = 'https://waha.howlil.my.id';

export function normalizeWahaBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}
