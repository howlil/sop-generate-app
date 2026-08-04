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

describe('WhatsApp environment validation', () => {
  it('tidak mewajibkan DATABASE_URL ketika DATABASE_* tersedia', () => {
    expect(validateEnv(baseEnv)).toMatchObject({
      DATABASE_HOST: 'localhost',
      DATABASE_USER: 'test',
      DATABASE_NAME: 'test',
    });
  });

  it('membolehkan WhatsApp nonaktif tanpa kredensial WAHA', () => {
    expect(validateEnv(baseEnv)).toMatchObject({
      WHATSAPP_ENABLED: false,
      WAHA_BASE_URL: 'https://waha.howlil.my.id',
      WAHA_SESSION: 'sop-staging',
    });
  });

  it('mewajibkan API key WAHA ketika WhatsApp aktif', () => {
    expect(() => validateEnv({ ...baseEnv, WHATSAPP_ENABLED: 'true' })).toThrow(/WAHA_API_KEY/);
  });

  it('menerima konfigurasi WAHA server sendiri', () => {
    expect(
      validateEnv({
        ...baseEnv,
        WHATSAPP_ENABLED: 'true',
        WAHA_BASE_URL: 'https://tugas-waha.example.test',
        WAHA_API_KEY: 'secret-api-key-123',
        WAHA_SESSION: 'sop-staging',
        WHATSAPP_ALLOWED_RECIPIENTS: '628111111111',
      }),
    ).toMatchObject({
      WHATSAPP_ENABLED: true,
      WAHA_BASE_URL: 'https://tugas-waha.example.test',
    });
  });

  it('menormalkan trailing slash URL WAHA eksternal', () => {
    expect(
      validateEnv({
        ...baseEnv,
        WAHA_BASE_URL: 'https://waha.howlil.my.id///',
      }),
    ).toMatchObject({ WAHA_BASE_URL: 'https://waha.howlil.my.id' });
  });

  it('menolak HTTP untuk WAHA aktif di production', () => {
    expect(() =>
      validateEnv({
        ...baseEnv,
        NODE_ENV: 'production',
        JWT_REFRESH_SECRET: 'abcdefghijklmnopqrstuvwxyz123456',
        WHATSAPP_ENABLED: 'true',
        WAHA_BASE_URL: 'http://waha.example.test',
        WAHA_API_KEY: 'secret-api-key-123',
      }),
    ).toThrow(/HTTPS/);
  });

  it('menolak kredensial di URL WAHA', () => {
    expect(() =>
      validateEnv({
        ...baseEnv,
        WAHA_BASE_URL: 'https://admin:secret@waha.example.test',
      }),
    ).toThrow(/username atau password/);
  });

  it('membolehkan allowlist kosong agar penerima diambil dari database', () => {
    expect(
      validateEnv({
        ...baseEnv,
        WHATSAPP_ENABLED: 'true',
        WAHA_API_KEY: 'secret-api-key-123',
        WHATSAPP_ALLOWED_RECIPIENTS: '',
      }),
    ).toMatchObject({ WHATSAPP_ENABLED: true, WHATSAPP_ALLOWED_RECIPIENTS: '' });
  });

  it('menerima konfigurasi staging yang aman', () => {
    expect(
      validateEnv({
        ...baseEnv,
        WHATSAPP_ENABLED: 'true',
        WAHA_BASE_URL: 'https://tugas-waha.example.test',
        WAHA_API_KEY: 'secret-api-key-123',
        WAHA_SESSION: 'sop-staging',
        WHATSAPP_ALLOWED_RECIPIENTS: '628111111111',
        WHATSAPP_REMINDER_INTERVAL_MINUTES: '1',
      }),
    ).toMatchObject({
      WHATSAPP_ENABLED: true,
      WAHA_SESSION: 'sop-staging',
      WHATSAPP_REMINDER_INTERVAL_MINUTES: 1,
    });
  });
});
