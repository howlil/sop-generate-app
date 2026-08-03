import { validateEnv } from './env.validation';

const baseEnv = {
  NODE_ENV: 'test',
  JWT_SECRET: '12345678901234567890123456789012',
  DATABASE_HOST: 'localhost',
  DATABASE_PORT: '3306',
  DATABASE_USER: 'test',
  DATABASE_PASSWORD: 'test',
  DATABASE_NAME: 'test',
  DATABASE_URL: 'mysql://test:test@localhost:3306/test',
};

describe('WhatsApp environment validation', () => {
  it('membolehkan WhatsApp nonaktif tanpa kredensial WAHA', () => {
    expect(validateEnv(baseEnv)).toMatchObject({ WHATSAPP_ENABLED: false });
  });

  it('mewajibkan URL, API key, dan allowlist ketika WhatsApp aktif', () => {
    expect(() => validateEnv({ ...baseEnv, WHATSAPP_ENABLED: 'true' })).toThrow(
      /WAHA_BASE_URL.*WAHA_API_KEY.*WHATSAPP_ALLOWED_RECIPIENTS/,
    );
  });

  it('menerima konfigurasi staging yang aman', () => {
    expect(
      validateEnv({
        ...baseEnv,
        WHATSAPP_ENABLED: 'true',
        WAHA_BASE_URL: 'http://waha:3000',
        WAHA_API_KEY: '1234567890123456',
        WHATSAPP_ALLOWED_RECIPIENTS: '628111111111',
        WHATSAPP_REMINDER_INTERVAL_MINUTES: '1',
      }),
    ).toMatchObject({
      WHATSAPP_ENABLED: true,
      WHATSAPP_REMINDER_INTERVAL_MINUTES: 1,
    });
  });
});
