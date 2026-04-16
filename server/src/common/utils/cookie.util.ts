
export function parseCookie(
  cookieHeader: string | undefined,
): Record<string, string> {
  if (!cookieHeader) return {};

  return cookieHeader
    .split(';')
    .map((c) => c.trim().split('='))
    .reduce<Record<string, string>>((acc, [key, val]) => {
      if (key) {
        try {
          acc[key.trim()] = decodeURIComponent(val?.trim() ?? '');
        } catch {
          // If decoding fails, use raw value
          acc[key.trim()] = val?.trim() ?? '';
        }
      }
      return acc;
    }, {});
}


export function getCookieValue(
  name: string,
  cookieHeader: string | undefined,
): string | undefined {
  return parseCookie(cookieHeader)[name];
}
