import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import { StatusSOP } from '../../src/generated/prisma';
import {
  assertSafeIntegrationDatabase,
  pingIntegrationDatabase,
  resetIntegrationDatabase,
} from './helpers/integration-database.util';
import { isIntegrationEnabled } from './helpers/integration-runtime.util';

const describeIntegration = isIntegrationEnabled() ? describe : describe.skip;

type MigrationCountRow = {
  total: bigint;
};

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
    const rows = await prisma.$queryRawUnsafe<MigrationCountRow[]>(
      'SELECT COUNT(*) AS total FROM `_prisma_migrations` WHERE `finished_at` IS NOT NULL',
    );

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
});
