import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import { WinstonLoggerConfig } from './common/logger/winston.config';

// Configuration constants
const CORS_MAX_AGE_SECONDS = 3600; // 1 hour
const DEFAULT_PORT = 3000;

async function bootstrap() {
  const logger = WinstonModule.createLogger(WinstonLoggerConfig);
  const app = await NestFactory.create(AppModule, { logger });

  // Error boundaries - unhandled exceptions
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
  });
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
  });

  app.setGlobalPrefix('api');

  // API Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Guards
  const reflector = app.get(Reflector);

  // Global Exception Filter

  // CORS Configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
              callback(null, true);
            } else {
              callback(new Error('CORS policy violation'));
            }
          }
        : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: CORS_MAX_AGE_SECONDS,
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('SOP Biro Organisasi API')
    .setDescription('API untuk Sistem Manajemen SOP Biro Organisasi')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('Health', 'Health check')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT ?? DEFAULT_PORT.toString();
  await app.listen(port);
  logger.log(`🚀 Server running on http://localhost:${port}/api`);
  logger.log(`📚 Swagger docs: http://localhost:${port}/docs`);
  logger.log(`💚 Health check: http://localhost:${port}/health`);
  logger.log(`🔐 Auth endpoint: http://localhost:${port}/api/v1/login`);
}

bootstrap();
