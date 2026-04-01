import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUserId: string;

  const testUser = {
    email: 'e2e-test@example.com',
    kataSandi: 'password123',
    nama: 'E2E Test User',
    peran: 'TIM_PENYUSUN',
    nip: 'NIP999999999',
    jabatan: 'Staff Test',
    pangkat: 'Penata Muda',
    nohp: '081234567899',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    // Create test user
    const hashedPassword = await bcrypt.hash(testUser.kataSandi, 10);
    const created = await prisma.pengguna.create({
      data: {
        email: testUser.email,
        nama: testUser.nama,
        peran: testUser.peran as any,
        nip: testUser.nip,
        jabatan: testUser.jabatan,
        pangkat: testUser.pangkat,
        nohp: testUser.nohp,
        kataSandi: hashedPassword,
      },
    });
    testUserId = created.id;
  });

  afterAll(async () => {
    // Cleanup test user
    if (testUserId) {
      await prisma.pengguna.delete({ where: { id: testUserId } });
    }
    await app.close();
  });

  describe('POST /api/v1/login', () => {
    it('should login successfully with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/v1/login')
        .send({
          email: testUser.email,
          kataSandi: testUser.kataSandi,
        })
        .expect(201)
        .expect(({ body }) => {
          expect(body).toHaveProperty('accessToken');
          expect(body).toHaveProperty('tokenType', 'Bearer');
          expect(body.user).toMatchObject({
            email: testUser.email,
            nama: testUser.nama,
            peran: testUser.peran,
          });
        });
    });

    it('should return 401 for non-existent user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/login')
        .send({
          email: 'nonexistent@example.com',
          kataSandi: 'password123',
        })
        .expect(401)
        .expect(({ body }) => {
          expect(body.success).toBe(false);
          expect(body.message).toContain('Email atau kata sandi salah');
        });
    });

    it('should return 401 for wrong password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/login')
        .send({
          email: testUser.email,
          kataSandi: 'wrongpassword',
        })
        .expect(401)
        .expect(({ body }) => {
          expect(body.success).toBe(false);
          expect(body.message).toContain('Email atau kata sandi salah');
        });
    });

    it('should return 422 for invalid email format', () => {
      return request(app.getHttpServer())
        .post('/api/v1/login')
        .send({
          email: 'invalid-email',
          kataSandi: 'password123',
        })
        .expect(422);
    });

    it('should return 422 for missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/login')
        .send({})
        .expect(422);
    });
  });

  describe('PATCH /api/v1/change-password', () => {
    let authToken: string;

    beforeAll(async () => {
      // Login to get token
      const response = await request(app.getHttpServer())
        .post('/api/v1/login')
        .send({
          email: testUser.email,
          kataSandi: testUser.kataSandi,
        });
      authToken = response.body.accessToken;
    });

    it('should change password successfully', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          kataSandiLama: testUser.kataSandi,
          kataSandiBaru: 'newpassword456',
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body.success).toBe(true);
        });
    });

    it('should login with new password after change', () => {
      return request(app.getHttpServer())
        .post('/api/v1/login')
        .send({
          email: testUser.email,
          kataSandi: 'newpassword456',
        })
        .expect(201);
    });

    it('should return 401 for wrong old password', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          kataSandiLama: 'wrongoldpassword',
          kataSandiBaru: 'anotherpassword',
        })
        .expect(401);
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .patch('/api/v1/change-password')
        .send({
          kataSandiLama: testUser.kataSandi,
          kataSandiBaru: 'newpassword',
        })
        .expect(401);
    });
  });
});
