import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('OPD API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testOpdId: string;

  const biroUser = {
    email: 'biro-opd-e2e@example.com',
    kataSandi: 'password123',
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

    // Create Biro user
    const hashedPassword = await bcrypt.hash(biroUser.kataSandi, 10);
    await prisma.pengguna.create({
      data: {
        email: biroUser.email,
        nama: 'Biro OPD E2E',
        peran: 'BIRO_ORGANISASI',
        nip: 'NIP888888890',
        jabatan: 'Staff Biro',
        pangkat: 'Penata Muda',
        nohp: '081234567900',
        kataSandi: hashedPassword,
      },
    });

    // Login
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/login')
      .send(biroUser);
    
    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    if (testOpdId) {
      await prisma.oPD.delete({ where: { id: testOpdId } }).catch(() => {});
    }
    await prisma.pengguna.delete({ where: { email: biroUser.email } }).catch(() => {});
    await app.close();
  });

  describe('POST /api/v1/opd', () => {
    const createOpdDto = {
      nama: 'OPD E2E Test',
    };

    it('should create OPD successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/opd')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createOpdDto)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toHaveProperty('id');
          expect(body.nama).toBe(createOpdDto.nama);
          testOpdId = body.id;
        });
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/opd')
        .send(createOpdDto)
        .expect(401);
    });
  });

  describe('GET /api/v1/opd', () => {
    it('should return list of OPDs', () => {
      return request(app.getHttpServer())
        .get('/api/v1/opd')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
          expect(body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /api/v1/opd/:id', () => {
    it('should return OPD by ID', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/opd/${testOpdId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(({ body }) => {
          expect(body.id).toBe(testOpdId);
        });
    });

    it('should return 404 for non-existent OPD', () => {
      return request(app.getHttpServer())
        .get('/api/v1/opd/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/v1/opd/:id', () => {
    it('should update OPD nama', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/opd/${testOpdId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nama: 'Updated OPD Name' })
        .expect(200)
        .expect(({ body }) => {
          expect(body.nama).toBe('Updated OPD Name');
        });
    });
  });

  describe('DELETE /api/v1/opd/:id', () => {
    it('should delete OPD successfully', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/opd/${testOpdId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
