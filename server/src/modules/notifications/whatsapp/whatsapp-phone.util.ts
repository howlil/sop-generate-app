const INDONESIAN_MOBILE_MIN_DIGITS = 10;
const E164_MAX_DIGITS = 15;

/** Normalisasi nomor seluler Indonesia menjadi E.164 tanpa tanda `+`, sesuai Evolution API. */
export function normalizeIndonesianWhatsappNumber(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0 || /[a-z]/i.test(trimmed)) {
    return null;
  }
  const digits = trimmed.replace(/[\s()+.-]/g, '');
  if (!/^\d+$/.test(digits)) {
    return null;
  }
  let normalized: string;
  if (digits.startsWith('62')) {
    normalized = digits;
  } else if (digits.startsWith('08')) {
    normalized = `62${digits.slice(1)}`;
  } else if (digits.startsWith('8')) {
    normalized = `62${digits}`;
  } else {
    return null;
  }
  if (
    normalized.length < INDONESIAN_MOBILE_MIN_DIGITS ||
    normalized.length > E164_MAX_DIGITS ||
    !normalized.startsWith('628')
  ) {
    return null;
  }
  return normalized;
}

export function parseWhatsappRecipientAllowlist(raw: string): ReadonlySet<string> {
  const normalized = raw
    .split(',')
    .map((entry) => normalizeIndonesianWhatsappNumber(entry))
    .filter((entry): entry is string => entry !== null);
  return new Set(normalized);
}

/** Allowlist kosong berarti seluruh nomor valid dari database diizinkan. */
export function isWhatsappRecipientAllowed(
  allowlist: ReadonlySet<string>,
  normalizedNumber: string,
): boolean {
  return allowlist.size === 0 || allowlist.has(normalizedNumber);
}

export function maskWhatsappNumber(value: string): string {
  if (value.length <= 7) {
    return '*'.repeat(value.length);
  }
  return `${value.slice(0, 5)}${'*'.repeat(value.length - 8)}${value.slice(-3)}`;
}
