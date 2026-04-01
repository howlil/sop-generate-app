import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('Users API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testUserId: string;
  let testOpdId: string;

  const biroUser = {
    email: 'biro-e2e@example.com',
    kataSandi: 'password123',
    nama: 'Biro Test User',
    peran: 'BIRO_ORGANISASI',
    nip: 'NIP888888888',
    jabatan: 'Staff Biro',
    pangkat: 'Penata Muda',
    nohp: '081234567898',
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

    // Create Biro Organisasi user for auth
    const hashedPassword = await bcrypt.hash(biroUser.kataSandi, 10);
    const biro = await prisma.pengguna.create({
      data: {
        email: biroUser.email,
        nama: biroUser.nama,
        peran: biroUser.peran as any,
        nip: biroUser.nip,
        jabatan: biroUser.jabatan,
        pangkat: biroUser.pangkat,
        nohp: biroUser.nohp,
        kataSandi: hashedPassword,
      },
    });

    // Create test OPD
    const opd = await prisma.oPD.create({
      data: { nama: 'Test OPD E2E' },
    });
    testOpdId = opd.id;

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/login')
      .send({ email: biroUser.email, kataSandi: biroUser.kataSandi });
    
    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    if (testUserId) {
      await prisma.pengguna.delete({ where: { id: testUserId } }).catch(() => {});
    }
    await prisma.oPD.delete({ where: { id: testOpdId } }).catch(() => {});
    await prisma.pengguna.delete({ where: { email: biroUser.email } }).catch(() => {});
    await app.close();
  });

  describe('POST /api/v1/users', () => {
    const createUserDto = {
      email: 'newuser@example.com',
      nama: 'New User',
      kataSandi: 'password123',
      peran: 'TIM_PENYUSUN',
      opdId: testOpdId,
      nip: 'NIP777777777',
      jabatan: 'Staff',
      pangkat: 'Penata Muda',
      nohp: '081234567897',
    };

    it('should create user successfully (BIRO_ORGANISASI)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createUserDto)
        .expect(201)
        .expect(({ body }) => {
          expect(body).toHaveProperty('id');
          expect(body.email).toBe(createUserDto.email);
          expect(body.nama).toBe(createUserDto.nama);
          expect(body.peran).toBe(createUserDto.peran);
          testUserId = body.id;
        });
    });

    it('should return 409 for duplicate email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...createUserDto,
          email: 'newuser@example.com', // Same as created above
          nip: 'NIP999999999',
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('sudah terdaftar');
    });

    it('should return 409 for duplicate NIP', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...createUserDto,
          email: 'anotheruser@example.com',
          nip: createUserDto.nip, // Same as created above
        })
        .expect(409);

      expect(response.body.success).toBe(false);
    });

    it('should return 422 for missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'incomplete@example.com' })
        .expect(422);
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .send(createUserDto)
        .expect(401);
    });
  });

  describe('GET /api/v1/users', () => {
    it('should return paginated users', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(({ body }) => {
          expect(body).toHaveProperty('data');
          expect(body).toHaveProperty('total');
          expect(Array.isArray(body.data)).toBe(true);
        });
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users')
        .expect(401);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should return user by ID', async () => {
      // First get the user ID from the list
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`);
      
      const userId = listResponse.body.data[0]?.id;
      if (!userId) return;

      return request(app.getHttpServer())
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(({ body }) => {
          expect(body.id).toBe(userId);
          expect(body).toHaveProperty('email');
          expect(body).toHaveProperty('nama');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/api/v1/users/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/v1/users/:id', () => {
    it('should update user successfully', async () => {
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`);
      
      const userId = listResponse.body.data[0]?.id;
      if (!userId) return;

      return request(app.getHttpServer())
        .patch(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nama: 'Updated Name' })
        .expect(200)
        .expect(({ body }) => {
          expect(body.nama).toBe('Updated Name');
        });
    });

    it('should return 409 for duplicate email update', async () => {
      const listResponse = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`);
      
      const users = listResponse.body.data;
      if (users.length < 2) return;

      // Try to update user[0] with email of user[1]
      return request(app.getHttpServer())
        .patch(`/api/v1/users/${users[0].id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: users[1].email })
        .expect(409);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should delete user successfully (soft delete)', async () => {
      // Create a user to delete
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'todelete@example.com',
          nama: 'To Delete',
          kataSandi: 'password123',
          peran: 'TIM_PENYUSUN',
          opdId: testOpdId,
          nip: 'NIP666666666',
          jabatan: 'Staff',
          pangkat: 'Penata Muda',
          nohp: '081234567896',
        });

      const userIdToDelete = createResponse.body.id;

      return request(app.getHttpServer())
        .delete(`/api/v1/users/${userIdToDelete}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect(({ body }) => {
          expect(body.success).toBe(true);
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/users/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
