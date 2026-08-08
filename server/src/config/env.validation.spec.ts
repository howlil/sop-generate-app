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

  it('mengaktifkan notifikasi in-app secara default tanpa konfigurasi eksternal', () => {
    expect(validateEnv(baseEnv)).toMatchObject({
      NOTIFICATION_IN_APP_ENABLED: true,
      NOTIFICATION_RECONCILE_INTERVAL_SECONDS: 10,
    });
  });

  it('mewajibkan host dan from SMTP ketika email notification aktif', () => {
    expect(() => validateEnv({ ...baseEnv, EMAIL_NOTIFICATIONS_ENABLED: 'true' })).toThrow(
      /SMTP_HOST/,
    );
  });

  it('menerima konfigurasi SMTP lengkap ketika email notification aktif', () => {
    expect(
      validateEnv({
        ...baseEnv,
        EMAIL_NOTIFICATIONS_ENABLED: 'true',
        SMTP_HOST: 'smtp.example.test',
        SMTP_PORT: '587',
        SMTP_FROM: 'SOPFlow <noreply@example.test>',
        EMAIL_NOTIFICATIONS_REMINDER_INTERVAL_MINUTES: '5',
      }),
    ).toMatchObject({
      EMAIL_NOTIFICATIONS_ENABLED: true,
      SMTP_HOST: 'smtp.example.test',
      SMTP_PORT: 587,
      EMAIL_NOTIFICATIONS_REMINDER_INTERVAL_MINUTES: 5,
    });
  });

  it('menerima konfigurasi staging berbasis in-app dan email', () => {
    expect(
      validateEnv({
        ...baseEnv,
        NOTIFICATION_IN_APP_ENABLED: 'true',
        EMAIL_NOTIFICATIONS_ENABLED: 'true',
        SMTP_HOST: 'smtp.example.test',
        SMTP_FROM: 'SOPFlow <noreply@example.test>',
        EMAIL_NOTIFICATIONS_REMINDER_INTERVAL_MINUTES: '1',
      }),
    ).toMatchObject({
      NOTIFICATION_IN_APP_ENABLED: true,
      EMAIL_NOTIFICATIONS_ENABLED: true,
      EMAIL_NOTIFICATIONS_REMINDER_INTERVAL_MINUTES: 1,
    });
  });
});
