import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { JwtAccessPayload } from '../../src/common';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import {
  JenisLangkahProsedur,
  PeranPengguna,
  SatuanWaktu,
  StatusSOP,
} from '../../src/generated/prisma';
import { SopCatalogService } from '../../src/modules/sop/catalog/sop-catalog.service';
import { SopProsedurService } from '../../src/modules/sop/prosedur/sop-prosedur.service';
import {
  assertSafeIntegrationDatabase,
  pingIntegrationDatabase,
  resetIntegrationDatabase,
} from './helpers/integration-database.util';
import { isIntegrationEnabled } from './helpers/integration-runtime.util';

const describeIntegration = isIntegrationEnabled() ? describe : describe.skip;
const TEST_PASSWORD_HASH = 'x'.repeat(60);

interface FixtureUser {
  penggunaId: string;
  email: string;
  peran: PeranPengguna;
}

interface AutosaveFixture {
  detailSopId: string;
  pelaksanaId: string;
  penyusun: JwtAccessPayload;
  pjPenyusun: JwtAccessPayload;
}

function toJwt(user: FixtureUser): JwtAccessPayload {
  return {
    sub: user.penggunaId,
    email: user.email,
    peran: user.peran,
  } as JwtAccessPayload;
}

async function createFixture(prisma: PrismaService, suffix: string): Promise<AutosaveFixture> {
  const opd = await prisma.oPD.create({ data: { nama: `OPD Conc ${suffix}`.slice(0, 28) } });
  const [penyusun, pjPenyusun] = await Promise.all([
    prisma.pengguna.create({
      data: {
        email: `conc-p-${suffix}@t.local`.slice(0, 31),
        opdId: opd.opdId,
        nama: 'Penyusun Conc',
        kataSandi: TEST_PASSWORD_HASH,
        peran: PeranPengguna.PENYUSUN,
        nip: `91${suffix}`.padEnd(18, '0').slice(0, 18),
        jabatan: 'Penyusun SOP',
        pangkat: 'Penata',
        nohp: '6281111111111',
      },
    }),
    prisma.pengguna.create({
      data: {
        email: `conc-pj-${suffix}@t.local`.slice(0, 31),
        opdId: opd.opdId,
        nama: 'PJ Penyusun',
        kataSandi: TEST_PASSWORD_HASH,
        peran: PeranPengguna.PJ_PENYUSUN,
        nip: `92${suffix}`.padEnd(18, '0').slice(0, 18),
        jabatan: 'PJ Penyusun SOP',
        pangkat: 'Penata',
        nohp: '6282222222222',
      },
    }),
  ]);
  const sop = await prisma.sOP.create({
    data: { opdId: opd.opdId, judul: `SOP Conc ${suffix}`.slice(0, 42) },
  });
  const detail = await prisma.detailSOP.create({
    data: {
      sopId: sop.sopId,
      status: StatusSOP.DRAFT,
      versi: 1,
      nomorSOP: `CONC-${suffix}`.slice(0, 24),
      namaLembaga: 'Biro Organisasi Sumbar',
      dibuatOlehId: penyusun.penggunaId,
      terakhirDieditOlehId: penyusun.penggunaId,
    },
  });
  const pelaksana = await prisma.pelaksana.create({
    data: {
      opdId: opd.opdId,
      nama: 'Pelaksana Conc',
    },
  });

  return {
    detailSopId: detail.detailSopId,
    pelaksanaId: pelaksana.pelaksanaId,
    penyusun: toJwt(penyusun),
    pjPenyusun: toJwt(pjPenyusun),
  };
}

describeIntegration('SOP autosave concurrency', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let catalog: SopCatalogService;
  let prosedur: SopProsedurService;

  beforeAll(async () => {
    assertSafeIntegrationDatabase();
    const { AppModule } = await import('../../src/app.module');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    catalog = app.get(SopCatalogService);
    prosedur = app.get(SopProsedurService);
    await pingIntegrationDatabase(prisma);
  });

  beforeEach(async () => {
    await resetIntegrationDatabase(prisma);
  });

  afterAll(async () => {
    try {
      if (prisma !== undefined) await resetIntegrationDatabase(prisma);
    } finally {
      if (app !== undefined) await app.close();
    }
  });

  it('mempertahankan dua update header paralel pada field berbeda tanpa lost update', async () => {
    const fixture = await createFixture(prisma, 'HDR');
    const namaLembaga = 'Biro Organisasi Concurrent';
    const peringatan = 'Peringatan autosave paralel';

    await Promise.all([
      catalog.updatePenyusunHeader(fixture.penyusun, fixture.detailSopId, { namaLembaga }),
      catalog.updatePenyusunHeader(fixture.pjPenyusun, fixture.detailSopId, {
        lampiran: { peringatan: [peringatan] },
      }),
    ]);

    const finalWorkbench = await catalog.getPenyusunWorkbench(
      fixture.penyusun,
      fixture.detailSopId,
    );
    expect(finalWorkbench.detail.namaLembaga).toBe(namaLembaga);
    expect(finalWorkbench.detail.lampiran?.peringatan.map((item) => item.teks)).toContain(
      peringatan,
    );
    expect(finalWorkbench.logEdit.some((log) => log.bagian === 'HEADER')).toBe(true);
  });

  it('menjaga replace-all prosedur tetap atomik saat dua autosave berjalan paralel', async () => {
    const fixture = await createFixture(prisma, 'STEP');
    const payloadA = buildLangkahPayload(fixture.pelaksanaId, 'A');
    const payloadB = buildLangkahPayload(fixture.pelaksanaId, 'B');

    await Promise.all([
      prosedur.updateProsedur(fixture.penyusun, fixture.detailSopId, payloadA),
      prosedur.updateProsedur(fixture.pjPenyusun, fixture.detailSopId, payloadB),
    ]);

    const finalWorkbench = await catalog.getPenyusunWorkbench(
      fixture.penyusun,
      fixture.detailSopId,
    );
    const finalActivities = finalWorkbench.langkah.map((step) => step.kegiatan);
    const expectedA = payloadA.langkah.map((step) => step.kegiatan);
    const expectedB = payloadB.langkah.map((step) => step.kegiatan);

    expect(finalWorkbench.langkah).toHaveLength(2);
    expect([expectedA, expectedB]).toContainEqual(finalActivities);
    expect(finalActivities).not.toEqual(expect.arrayContaining([...expectedA, ...expectedB]));
    expect(finalWorkbench.logEdit.some((log) => log.bagian === 'LANGKAH')).toBe(true);
  });
});

function buildLangkahPayload(pelaksanaId: string, marker: string) {
  return {
    pelaksana: [{ pelaksanaId }],
    langkah: [
      {
        tempId: `${marker}-mulai`,
        jenis: JenisLangkahProsedur.AWAL_AKHIR,
        kegiatan: `Mulai ${marker}`,
        kelengkapan: `Berkas awal ${marker}`,
        keluaran: `Dokumen diterima ${marker}`,
        keterangan: `Awal concurrency ${marker}`,
        waktu: 5,
        satuanWaktu: SatuanWaktu.m,
        pelaksanaId,
      },
      {
        tempId: `${marker}-selesai`,
        jenis: JenisLangkahProsedur.AWAL_AKHIR,
        kegiatan: `Selesai ${marker}`,
        kelengkapan: `Berkas akhir ${marker}`,
        keluaran: `Dokumen selesai ${marker}`,
        keterangan: `Akhir concurrency ${marker}`,
        waktu: 5,
        satuanWaktu: SatuanWaktu.m,
        pelaksanaId,
      },
    ],
  };
}
