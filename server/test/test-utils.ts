import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/common/prisma/prisma.service';

/**
 * Creates a test application instance with test-specific configuration
 */
export async function createTestApp(): Promise<{
  app: INestApplication;
  prisma: PrismaService;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  
  // Apply global pipes same as production
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

  await app.init();

  const prisma = app.get(PrismaService);
  
  return { app, prisma };
}

/**
 * Creates auth headers for authenticated requests
 */
export function createAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Sleep utility for rate limiting tests
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
