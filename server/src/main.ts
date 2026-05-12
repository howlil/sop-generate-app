import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { WinstonModule } from 'nest-winston';
import { createServer } from 'node:net';
import { AppModule } from './app.module';
import { WinstonLoggerConfig } from './common/logger/winston.config';
import { createDefaultValidationPipe } from './common';
import { ACCESS_TOKEN_COOKIE_NAME } from './modules/core/auth/helpers/auth.shared';

const DEFAULT_PORT = 3000;
const CORS_MAX_AGE_SECONDS = 3600;
const MAX_PORT_ATTEMPTS = 20;

function buildCorsOptions(configService: ConfigService): CorsOptions {
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const allowedOrigins = configService
    .get<string>('ALLOWED_ORIGINS', '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return {
    origin:
      nodeEnv === 'production'
        ? (
            origin: string | undefined,
            callback: (error: Error | null, allow?: boolean) => void,
          ) => {
            if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
              return;
            }
            callback(new Error('CORS policy violation'));
          }
        : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    credentials: true,
    maxAge: CORS_MAX_AGE_SECONDS,
  };
}

async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '::');
  });
}

async function resolveAvailablePort(preferredPort: number): Promise<number> {
  for (let attempt = 0; attempt < MAX_PORT_ATTEMPTS; attempt += 1) {
    const candidatePort = preferredPort + attempt;
    if (await isPortAvailable(candidatePort)) {
      return candidatePort;
    }
  }
  throw new Error(
    `Tidak ada port tersedia mulai dari ${preferredPort} hingga ${preferredPort + MAX_PORT_ATTEMPTS - 1}.`,
  );
}

async function bootstrap() {
  const logger = WinstonModule.createLogger(WinstonLoggerConfig);
  const app = await NestFactory.create(AppModule, { logger });
  const configService = app.get(ConfigService);

  app.use(cookieParser());

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
  });
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
  });

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  /** Satu instance pipa validasi untuk seluruh aplikasi (sesuai dokumentasi Nest). */
  app.useGlobalPipes(createDefaultValidationPipe());

  app.enableCors(buildCorsOptions(configService));

  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const swaggerEnabled = configService.get<boolean>('SWAGGER_ENABLED', nodeEnv !== 'production');
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('SOP Biro Organisasi API')
      .setDescription('API untuk Sistem Manajemen SOP Biro Organisasi')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth(ACCESS_TOKEN_COOKIE_NAME)
      .addTag('Auth', 'Authentication endpoints')
      .addTag('OPD', 'Master organisasi perangkat daerah')
      .addTag('Tim Evaluasi', 'Anggota tim evaluasi (Evaluator Biro)')
      .addTag('Users', 'User management')
      .addTag('Health', 'Health check')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  app.enableShutdownHooks();

  const configuredPort = configService.get<number>('PORT', DEFAULT_PORT);
  const resolvedPort = await resolveAvailablePort(configuredPort);
  if (resolvedPort !== configuredPort) {
    logger.warn(
      `Port ${configuredPort} sedang dipakai. Server dialihkan ke port ${resolvedPort}.`,
    );
  }

  await app.listen(resolvedPort);
  logger.log(`🚀 Server running on http://localhost:${resolvedPort}/api`);
  if (swaggerEnabled) {
    logger.log(`📚 Swagger docs: http://localhost:${resolvedPort}/docs`);
  }
  logger.log(`💚 Health check: http://localhost:${resolvedPort}/health`);
  logger.log(`🔐 Auth (login): http://localhost:${resolvedPort}/api/v1/auth/login`);
  logger.log(`🔐 Auth (me): http://localhost:${resolvedPort}/api/v1/auth/me`);
}

void bootstrap();
