import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('SOP API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testSopId: string;
  let testOpdId: string;

  const biroUser = {
    email: 'biro-sop-e2e@example.com',
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
        nama: 'Biro E2E Test',
        peran: 'BIRO_ORGANISASI',
        nip: 'NIP888888889',
        jabatan: 'Staff Biro',
        pangkat: 'Penata Muda',
        nohp: '081234567899',
        kataSandi: hashedPassword,
      },
    });

    // Create OPD
    const opd = await prisma.oPD.create({
      data: { nama: 'Test OPD SOP E2E' },
    });
    testOpdId = opd.id;

    // Login
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/login')
      .send(biroUser);
    
    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    if (testSopId) {
      await prisma.sOP.delete({ where: { id: testSopId } }).catch(() => {});
    }
    await prisma.oPD.delete({ where: { id: testOpdId } }).catch(() => {});
    await prisma.pengguna.delete({ where: { email: biroUser.email } }).catch(() => {});
    await app.close();
  });

  describe('POST /api/v1/sop', () => {
    const createSopDto = {
      judul: 'SOP E2E Test',
      opdId: testOpdId,
      logoInstansi: 'https://example.com/logo.png',
      namaLembaga: 'Test Institution',
    };

    it('should create SOP successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/sop')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createSopDto)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toHaveProperty('id');
          expect(body.judul).toBe(createSopDto.judul);
          testSopId = body.id;
        });
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/sop')
        .send(createSopDto)
        .expect(401);
    });
  });

  describe('GET /api/v1/sop', () => {
    it('should return list of SOPs', () => {
      return request(app.getHttpServer())
        .get('/api/v1/sop')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(({ body }) => {
          expect(Array.isArray(body)).toBe(true);
        });
    });
  });

  describe('GET /api/v1/sop/:id', () => {
    it('should return SOP by ID', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/sop/${testSopId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(({ body }) => {
          expect(body.id).toBe(testSopId);
        });
    });

    it('should return 404 for non-existent SOP', () => {
      return request(app.getHttpServer())
        .get('/api/v1/sop/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/v1/sop/:id', () => {
    it('should update SOP judul', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/sop/${testSopId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ judul: 'Updated SOP Title' })
        .expect(200)
        .expect(({ body }) => {
          expect(body.judul).toBe('Updated SOP Title');
        });
    });
  });

  describe('DELETE /api/v1/sop/:id', () => {
    it('should delete SOP successfully', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/sop/${testSopId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });
});
