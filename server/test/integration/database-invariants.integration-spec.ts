import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import { PeranPengguna, StatusSOP } from '../../src/generated/prisma';
import {
  assertSafeIntegrationDatabase,
  pingIntegrationDatabase,
  resetIntegrationDatabase,
} from './helpers/integration-database.util';
import { isIntegrationEnabled } from './helpers/integration-runtime.util';

const describeIntegration = isIntegrationEnabled() ? describe : describe.skip;

type CountRow = {
  total: bigint;
};

const TEST_PASSWORD_HASH = 'x'.repeat(60);

async function createTestUser(prisma: PrismaService, opdId: string, suffix: string) {
  return prisma.pengguna.create({
    data: {
      email: `db-${suffix}@test.local`,
      opdId,
      nama: `User DB ${suffix}`,
      kataSandi: TEST_PASSWORD_HASH,
      peran: PeranPengguna.PENYUSUN,
      nip: suffix.padEnd(18, '0').slice(0, 18),
      jabatan: 'Penyusun',
      pangkat: 'Penata',
      nohp: `628${suffix.replace(/\D/g, '').padEnd(10, '0').slice(0, 10)}`,
    },
  });
}

describeIntegration('Database migration invariants', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    assertSafeIntegrationDatabase();

    const { AppModule } = await import('../../src/app.module');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    await pingIntegrationDatabase(prisma);
  });

  beforeEach(async () => {
    await resetIntegrationDatabase(prisma);
  });

  afterAll(async () => {
    try {
      if (prisma !== undefined) {
        await resetIntegrationDatabase(prisma);
      }
    } finally {
      if (app !== undefined) {
        await app.close();
      }
    }
  });

  it('menjalankan migration chain Prisma, bukan hanya db push', async () => {
    const rows = await prisma.$queryRawUnsafe<CountRow[]>(
      'SELECT COUNT(*) AS total FROM `_prisma_migrations` WHERE `finished_at` IS NOT NULL',
    );

    expect(Number(rows[0]?.total ?? 0)).toBeGreaterThan(0);
  });

  it('memasang index operasional DetailSOP dari migration', async () => {
    const rows = await prisma.$queryRawUnsafe<CountRow[]>(`
      SELECT COUNT(*) AS total
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
        AND LOWER(TABLE_NAME) = LOWER('DetailSOP')
        AND INDEX_NAME = 'DetailSOP_sopId_status_idx'
    `);

    expect(Number(rows[0]?.total ?? 0)).toBeGreaterThan(0);
  });

  it('menolak dua versi BERLAKU untuk SOP yang sama melalui invariant database', async () => {
    const opd = await prisma.oPD.create({ data: { nama: 'OPD DB Invariant' } });
    const sop = await prisma.sOP.create({
      data: {
        opdId: opd.opdId,
        judul: 'SOP DB Invariant',
      },
    });

    await prisma.detailSOP.create({
      data: {
        sopId: sop.sopId,
        status: StatusSOP.BERLAKU,
        versi: 1,
        nomorSOP: 'DB-INV-001',
        namaLembaga: opd.nama,
      },
    });

    await expect(
      prisma.detailSOP.create({
        data: {
          sopId: sop.sopId,
          status: StatusSOP.BERLAKU,
          versi: 2,
          nomorSOP: 'DB-INV-002',
          namaLembaga: opd.nama,
        },
      }),
    ).rejects.toThrow();
  });

  it('menolak foreign key DetailSOP yang menunjuk SOP tidak valid', async () => {
    await expect(
      prisma.detailSOP.create({
        data: {
          sopId: '00000000-0000-4000-8000-000000000000',
          status: StatusSOP.DRAFT,
          versi: 1,
          nomorSOP: 'DB-INV-FK-001',
          namaLembaga: 'OPD DB Invariant',
        },
      }),
    ).rejects.toThrow();
  });

  it('menolak nilai enum StatusSOP yang tidak valid di level database', async () => {
    const opd = await prisma.oPD.create({ data: { nama: 'OPD DB Enum' } });
    const sop = await prisma.sOP.create({
      data: {
        opdId: opd.opdId,
        judul: 'SOP DB Enum',
      },
    });

    await expect(
      prisma.$executeRawUnsafe(`
        INSERT INTO \`DetailSOP\`
          (\`detailSopId\`, \`sopId\`, \`status\`, \`versi\`, \`nomorSOP\`, \`namaLembaga\`, \`createdAt\`, \`updatedAt\`)
        VALUES
          (UUID(), '${sop.sopId}', 'STATUS_TIDAK_VALID', 1, 'DB-INV-ENUM-001', '${opd.nama}', NOW(3), NOW(3))
      `),
    ).rejects.toThrow();
  });

  it('menghapus DetailSOP secara cascade ketika SOP induk dihapus', async () => {
    const opd = await prisma.oPD.create({ data: { nama: 'OPD DB Cascade' } });
    const sop = await prisma.sOP.create({
      data: {
        opdId: opd.opdId,
        judul: 'SOP DB Cascade',
      },
    });
    const detail = await prisma.detailSOP.create({
      data: {
        sopId: sop.sopId,
        status: StatusSOP.DRAFT,
        versi: 1,
        nomorSOP: 'DB-INV-CASCADE-001',
        namaLembaga: opd.nama,
      },
    });

    await prisma.sOP.delete({ where: { sopId: sop.sopId } });

    await expect(
      prisma.detailSOP.findUnique({ where: { detailSopId: detail.detailSopId } }),
    ).resolves.toBeNull();
  });

  it('menegakkan Restrict ketika OPD masih direferensikan Pengguna', async () => {
    const opd = await prisma.oPD.create({ data: { nama: 'OPD DB Restrict' } });
    await createTestUser(prisma, opd.opdId, '101');

    await expect(prisma.oPD.delete({ where: { opdId: opd.opdId } })).rejects.toThrow();
  });

  it('menjalankan SetNull ketika Pengguna editor Peraturan dihapus', async () => {
    const opd = await prisma.oPD.create({ data: { nama: 'OPD DB SetNull' } });
    const user = await createTestUser(prisma, opd.opdId, '202');
    const peraturan = await prisma.peraturan.create({
      data: {
        nama: 'Peraturan DB SetNull',
        nomor: 'DB-SETNULL-202',
        tahun: 2026,
        tentang: 'Verifikasi referential action SetNull',
        lastEditedById: user.penggunaId,
      },
    });

    await prisma.pengguna.delete({ where: { penggunaId: user.penggunaId } });

    const reloaded = await prisma.peraturan.findUnique({
      where: { peraturanId: peraturan.peraturanId },
      select: { lastEditedById: true },
    });

    expect(reloaded?.lastEditedById).toBeNull();
  });
});
