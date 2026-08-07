import { validateEnv } from './env.validation';

const baseEnv = {
  NODE_ENV: 'test',
  JWT_SECRET: '12345678901234567890123456789012',
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: '3306',
  DATABASE_USER: 'test',
  DATABASE_PASSWORD: 'test',
  DATABASE_NAME: 'test',
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

  it('membolehkan WhatsApp nonaktif tanpa kredensial Evolution API', () => {
    expect(validateEnv(baseEnv)).toMatchObject({
      WHATSAPP_ENABLED: false,
      EVOLUTION_API_BASE_URL: 'https://evolution.example.test',
      EVOLUTION_API_INSTANCE: 'sop-production',
    });
  });

  it('mewajibkan API key Evolution API ketika WhatsApp aktif', () => {
    expect(() => validateEnv({ ...baseEnv, WHATSAPP_ENABLED: 'true' })).toThrow(
      /EVOLUTION_API_KEY/,
    );
  });

  it('menerima konfigurasi Evolution API server sendiri', () => {
    expect(
      validateEnv({
        ...baseEnv,
        WHATSAPP_ENABLED: 'true',
        EVOLUTION_API_BASE_URL: 'https://evolution.example.test',
        EVOLUTION_API_KEY: 'secret-api-key-123',
        EVOLUTION_API_INSTANCE: 'sop-staging',
        WHATSAPP_ALLOWED_RECIPIENTS: '628111111111',
      }),
    ).toMatchObject({
      WHATSAPP_ENABLED: true,
      EVOLUTION_API_BASE_URL: 'https://evolution.example.test',
    });
  });

  it('menormalkan trailing slash URL Evolution API eksternal', () => {
    expect(
      validateEnv({
        ...baseEnv,
        EVOLUTION_API_BASE_URL: 'https://evolution.example.test///',
      }),
    ).toMatchObject({ EVOLUTION_API_BASE_URL: 'https://evolution.example.test' });
  });

  it('menolak HTTP untuk Evolution API aktif di production', () => {
    expect(() =>
      validateEnv({
        ...baseEnv,
        NODE_ENV: 'production',
        JWT_REFRESH_SECRET: 'abcdefghijklmnopqrstuvwxyz123456',
        WHATSAPP_ENABLED: 'true',
        EVOLUTION_API_BASE_URL: 'http://evolution.example.test',
        EVOLUTION_API_KEY: 'secret-api-key-123',
      }),
    ).toThrow(/HTTPS/);
  });

  it('menolak kredensial di URL Evolution API', () => {
    expect(() =>
      validateEnv({
        ...baseEnv,
        EVOLUTION_API_BASE_URL: 'https://admin:secret@evolution.example.test',
      }),
    ).toThrow(/username atau password/);
  });

  it('membolehkan allowlist kosong agar penerima diambil dari database', () => {
    expect(
      validateEnv({
        ...baseEnv,
        WHATSAPP_ENABLED: 'true',
        EVOLUTION_API_KEY: 'secret-api-key-123',
        WHATSAPP_ALLOWED_RECIPIENTS: '',
      }),
    ).toMatchObject({ WHATSAPP_ENABLED: true, WHATSAPP_ALLOWED_RECIPIENTS: '' });
  });

  it('menerima konfigurasi staging yang aman', () => {
    expect(
      validateEnv({
        ...baseEnv,
        WHATSAPP_ENABLED: 'true',
        EVOLUTION_API_BASE_URL: 'https://evolution.example.test',
        EVOLUTION_API_KEY: 'secret-api-key-123',
        EVOLUTION_API_INSTANCE: 'sop-staging',
        WHATSAPP_ALLOWED_RECIPIENTS: '628111111111',
        WHATSAPP_REMINDER_INTERVAL_MINUTES: '1',
      }),
    ).toMatchObject({
      WHATSAPP_ENABLED: true,
      EVOLUTION_API_INSTANCE: 'sop-staging',
      WHATSAPP_REMINDER_INTERVAL_MINUTES: 1,
    });
  });
});
