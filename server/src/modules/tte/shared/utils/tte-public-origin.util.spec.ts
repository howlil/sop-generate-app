import {
  buildValidasiPengesahanBaseUrl,
  extractAppOriginFromRequest,
  VALIDASI_PENGESAHAN_PATH,
} from './tte-public-origin.util';

describe('Pengujian util origin publik TTE', () => {
  it('seharusnya mengambil origin dari header Origin', () => {
    const actual = extractAppOriginFromRequest({
      headers: { origin: 'https://app.example.com' },
    } as never);
    expect(actual).toBe('https://app.example.com');
  });

  it('seharusnya membangun path validasi pengesahan dari origin', () => {
    expect(buildValidasiPengesahanBaseUrl('https://app.example.com')).toBe(
      `https://app.example.com${VALIDASI_PENGESAHAN_PATH}`,
    );
  });
});
