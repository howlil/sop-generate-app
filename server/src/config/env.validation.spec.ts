import { validateEnv } from './env.validation';

const baseEnv = {
  NODE_ENV: 'test',
  JWT_SECRET: '12345678901234567890123456789012',
  TTE_ENCRYPTION_SECRET: 'tte-secret-that-is-different-and-long-enough-123456',
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: '3306',
  DATABASE_USER: 'test',
  DATABASE_PASSWORD: 'test',
  DATABASE_NAME: 'test',
  PDF_SIGNING_ENABLED: 'false',
};

describe('Environment validation', () => {
  it('tidak mewajibkan DATABASE_URL ketika DATABASE_* tersedia', () => {
    expect(validateEnv(baseEnv)).toMatchObject({
      DATABASE_HOST: 'localhost',
      DATABASE_USER: 'test',
      DATABASE_NAME: 'test',
    });
  });

  it('menormalkan spasi dari environment deployment', () => {
    expect(
      validateEnv({
        ...baseEnv,
        PUBLIC_APP_ORIGIN: 'https://sop.example.test     ',
        ALLOWED_ORIGINS: 'https://sop.example.test     ',
        SOP_PDF_STORAGE_DIR: '/app/storage/sop-pdf     ',
      }),
    ).toMatchObject({
      PUBLIC_APP_ORIGIN: 'https://sop.example.test',
      ALLOWED_ORIGINS: 'https://sop.example.test',
      SOP_PDF_STORAGE_DIR: '/app/storage/sop-pdf',
    });
  });

  it('menormalkan flag critical E2E dan default-nya nonaktif', () => {
    expect(validateEnv(baseEnv)).toMatchObject({ E2E_CRITICAL: false });
    expect(validateEnv({ ...baseEnv, E2E_CRITICAL: 'true' })).toMatchObject({
      E2E_CRITICAL: true,
    });
  });

  it('mengaktifkan in-app dan membiarkan WhatsApp nonaktif ketika konfigurasi Wago kosong', () => {
    expect(validateEnv(baseEnv)).toMatchObject({
      NOTIFICATION_IN_APP_ENABLED: true,
      NOTIFICATION_RECONCILE_INTERVAL_SECONDS: 10,
      WAGO_API_KEY: '',
      WAGO_REQUEST_TIMEOUT_MS: 10_000,
    });
    expect(validateEnv(baseEnv).WAGO_BASE_URL).toBeUndefined();
  });

  it('menerima konfigurasi Wago lengkap tanpa feature flag', () => {
    expect(
      validateEnv({
        ...baseEnv,
        WAGO_BASE_URL: 'https://wago.example.test',
        WAGO_API_KEY: 'wa_test_key',
      }),
    ).toMatchObject({
      WAGO_BASE_URL: 'https://wago.example.test',
      WAGO_API_KEY: 'wa_test_key',
      WAGO_REQUEST_TIMEOUT_MS: 10_000,
    });
  });

  it('menolak URL Wago tanpa API key', () => {
    expect(() =>
      validateEnv({
        ...baseEnv,
        WAGO_BASE_URL: 'https://wago.example.test',
        WAGO_API_KEY: '',
      }),
    ).toThrow(/WAGO_API_KEY/);
  });

  it('menolak API key Wago tanpa URL', () => {
    expect(() =>
      validateEnv({
        ...baseEnv,
        WAGO_BASE_URL: '',
        WAGO_API_KEY: 'wa_test_key',
      }),
    ).toThrow(/WAGO_BASE_URL/);
  });

  it('menerima PDF signing nonaktif tanpa P12 global server', () => {
    expect(
      validateEnv({
        ...baseEnv,
        PDF_SIGNING_ENABLED: 'false',
        PDF_SIGNING_P12_BASE64: '',
      }),
    ).toMatchObject({ PDF_SIGNING_ENABLED: false });
  });

  it('menolak TTE encryption secret yang sama dengan JWT secret', () => {
    expect(() =>
      validateEnv({
        ...baseEnv,
        TTE_ENCRYPTION_SECRET: baseEnv.JWT_SECRET,
      }),
    ).toThrow(/berbeda dari JWT_SECRET/);
  });

  it('mewajibkan refresh secret dan origin eksplisit pada production', () => {
    expect(() =>
      validateEnv({
        ...baseEnv,
        NODE_ENV: 'production',
      }),
    ).toThrow(/JWT_REFRESH_SECRET|PUBLIC_APP_ORIGIN/);
  });

  it('menolak wildcard origin pada production dengan cookie credentials', () => {
    expect(() =>
      validateEnv({
        ...baseEnv,
        NODE_ENV: 'production',
        JWT_REFRESH_SECRET: 'refresh-secret-that-is-at-least-32-characters-long',
        PUBLIC_APP_ORIGIN: 'https://sop.example.test',
        ALLOWED_ORIGINS: '*',
      }),
    ).toThrow(/Wildcard origin/);
  });

  it('menerima konfigurasi production yang eksplisit', () => {
    expect(
      validateEnv({
        ...baseEnv,
        NODE_ENV: 'production',
        JWT_REFRESH_SECRET: 'refresh-secret-that-is-at-least-32-characters-long',
        PUBLIC_APP_ORIGIN: 'https://sop.example.test',
        ALLOWED_ORIGINS: 'https://sop.example.test',
      }),
    ).toMatchObject({
      NODE_ENV: 'production',
      PUBLIC_APP_ORIGIN: 'https://sop.example.test',
      ALLOWED_ORIGINS: 'https://sop.example.test',
    });
  });
});