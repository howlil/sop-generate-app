import {
  buildValidasiPengesahanBaseUrl,
  extractAppOriginFromRequest,
  resolvePublicAppOrigin,
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

  it('seharusnya memprioritaskan PUBLIC_APP_ORIGIN daripada legacy path', () => {
    const actual = resolvePublicAppOrigin({
      configOrigin: 'https://cfg.example.com',
      legacyVerifyBaseUrl: `https://legacy.example.com${VALIDASI_PENGESAHAN_PATH}`,
    });
    expect(actual).toBe('https://cfg.example.com');
  });

  it('seharusnya menurunkan origin dari legacy URL yang sudah berisi path validasi', () => {
    const actual = resolvePublicAppOrigin({
      legacyVerifyBaseUrl: `https://legacy.example.com${VALIDASI_PENGESAHAN_PATH}`,
    });
    expect(actual).toBe('https://legacy.example.com');
  });
});
