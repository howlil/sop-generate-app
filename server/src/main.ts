import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { WinstonModule } from 'nest-winston';
import { createServer } from 'node:net';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { WinstonLoggerConfig } from './common/logger/winston.config';
import { createDefaultValidationPipe } from './common';
import { JSON_BODY_LIMIT, URLENCODED_BODY_LIMIT } from './common/http/request-body-limits';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from './modules/core/auth/helpers/auth.shared';

const DEFAULT_PORT = 3000;
const CORS_MAX_AGE_SECONDS = 3600;

function buildCorsOptions(configService: ConfigService): CorsOptions {
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const allowedOriginsRaw = configService.get<string>('ALLOWED_ORIGINS', '').trim();
  const allowAllOrigins =
    nodeEnv !== 'production' ||
    allowedOriginsRaw === '' ||
    allowedOriginsRaw === '*' ||
    allowedOriginsRaw.toLowerCase() === 'all';
  const allowedOrigins = allowedOriginsRaw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return {
    origin: allowAllOrigins
      ? true
      : (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
          }
          callback(new Error('CORS policy violation'));
        },
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

async function bootstrap() {
  const logger = WinstonModule.createLogger(WinstonLoggerConfig);
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger,
    bodyParser: false,
  });
  const configService = app.get(ConfigService);

  app.useBodyParser('json', { limit: JSON_BODY_LIMIT });
  app.useBodyParser('urlencoded', { extended: true, limit: URLENCODED_BODY_LIMIT });
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
      .addCookieAuth(REFRESH_TOKEN_COOKIE_NAME)
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
  if (!(await isPortAvailable(configuredPort))) {
    const recoveryHint =
      nodeEnv === 'development'
        ? ` Hentikan proses lain (PowerShell: netstat -ano | findstr :${configuredPort}, lalu taskkill /PID <pid> /F), lalu jalankan ulang pnpm start:dev.`
        : ' Server production tidak akan memilih port alternatif agar load balancer/service discovery tidak salah target.';
    logger.error(`Port ${configuredPort} sudah dipakai.${recoveryHint}`);
    process.exit(1);
  }

  await app.listen(configuredPort);
  logger.log(`🚀 Server running on http://localhost:${configuredPort}/api`);
  if (swaggerEnabled) {
    logger.log(`📚 Swagger docs: http://localhost:${configuredPort}/docs`);
  }
  logger.log(`💚 Health check: http://localhost:${configuredPort}/api/health`);
}

void bootstrap();
