/**
 * Integration Test: Evaluasi Edge Cases
 *
 * Menguji skenario evaluasi yang sulit diuji di unit test:
 *  - Evaluasi MANDIRI vs TERJADWAL (nilaiOPD)
 *  - Loop evaluasi: PERLU_PERBAIKAN → revisi → kirim ulang → SESUAI
 *  - False cases: duplikasi pengajuan, nilai di luar pengajuan, stale version
 *  - Worst cases: kirim ulang sebelum revisi selesai, selesai dengan status salah
 *  - Edge cases: sopDetailIds duplikat, status bukan SIAP_DIEVALUASI
 *
 * CATATAN DESAIN: Setiap describe group menggunakan OPD TERPISAH untuk menghindari
 * konflik bisnis — pengajuan yg SELESAI_DIEVALUASI masih memblokir pengajuan baru
 * pada OPD yang sama sampai proses TTE selesai.
 */
import { VersioningType, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request, { type Agent } from 'supertest';
import * as bcrypt from 'bcrypt';
import { createDefaultValidationPipe } from '../../src/common';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import {
  assertSafeIntegrationDatabase,
  pingIntegrationDatabase,
  resetIntegrationDatabase,
} from './helpers/integration-database.util';
import { isIntegrationEnabled } from './helpers/integration-runtime.util';
import {
  HasilEvaluasi,
  JenisLangkahProsedur,
  JenisPengajuanEvaluasi,
  PeranPengguna,
  SatuanWaktu,
  StatusSOP,
} from '../../src/generated/prisma';

const describeIntegration = isIntegrationEnabled() ? describe : describe.skip;
const API = '/api/v1';
const PASSWORD = 'EvaluasiTest123!';

type EvalGroupContext = {
  opdId: string;
  pjEvaluatorAgent: Agent;
  evaluatorAgent: Agent;
  pjPenyusunAgent: Agent;
  penyusunAgent: Agent;
  pelaksanaId: string;
  peraturanId: string;
  relatedSopId: string;
};

// Utility: login agent helper
async function loginAgent(app: INestApplication, email: string): Promise<Agent> {
  const agent = request.agent(app.getHttpServer());
  const res = await agent.post(`${API}/auth/login`).send({ email, password: PASSWORD }).expect(201);
  const raw = res.headers['set-cookie'];
  const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
  if (arr.length > 0) agent.set('Cookie', arr.map((c: string) => c.split(';')[0]).join('; '));
  return agent;
}

/** Seed OPD + 4 users dan kembalikan agents */
async function seedGroupOpdAndAgents(
  prisma: PrismaService,
  app: INestApplication,
  opdNama: string,
  prefix: string,
): Promise<EvalGroupContext> {
  const opd = await prisma.oPD.create({ data: { nama: opdNama } });
  const opdId = opd.opdId;

  const makeUser = async (email: string, nama: string, nip: string, peran: PeranPengguna) => {
    await prisma.pengguna.create({
      data: {
        email,
        nama,
        nip,
        opdId,
        peran,
        kataSandi: await bcrypt.hash(PASSWORD, 10),
        jabatan: 'Staf',
        pangkat: 'Pembina',
        nohp: '08' + Math.floor(Math.random() * 9000000000 + 1000000000),
        riwayatOpd: { create: { opdId, isAktif: true } },
      },
    });
  };

  await makeUser(
    `pje.${prefix}@example.test`,
    `PJ Eval ${prefix}`,
    `${prefix}-PJE`,
    PeranPengguna.PJ_EVALUATOR,
  );
  await makeUser(
    `ev.${prefix}@example.test`,
    `Eval ${prefix}`,
    `${prefix}-EV`,
    PeranPengguna.EVALUATOR,
  );
  await makeUser(
    `pjp.${prefix}@example.test`,
    `PJ Pen ${prefix}`,
    `${prefix}-PJP`,
    PeranPengguna.PJ_PENYUSUN,
  );
  await makeUser(
    `pen.${prefix}@example.test`,
    `Pen ${prefix}`,
    `${prefix}-PEN`,
    PeranPengguna.PENYUSUN,
  );

  const penyusunAgent = await loginAgent(app, `pen.${prefix}@example.test`);
  const pelaksana = await penyusunAgent
    .post(`${API}/pelaksana`)
    .send({ namaPelaksana: `Pelaksana ${prefix}` })
    .expect(201);
  const peraturan = await penyusunAgent
    .post(`${API}/peraturan`)
    .send({
      namaPeraturan: `Peraturan ${prefix}`,
      nomor: `EE-${prefix}`,
      tahun: 2026,
      tentang: `Test ${prefix}`,
    })
    .expect(201);
  const related = await penyusunAgent
    .post(`${API}/sop`)
    .send({
      judul: `SOP Terkait ${prefix}`,
      nomorSop: `EE-SOP-REL-${prefix}`,
      namaLembaga: opdNama,
    })
    .expect(201);

  return {
    opdId,
    pjEvaluatorAgent: await loginAgent(app, `pje.${prefix}@example.test`),
    evaluatorAgent: await loginAgent(app, `ev.${prefix}@example.test`),
    pjPenyusunAgent: await loginAgent(app, `pjp.${prefix}@example.test`),
    penyusunAgent,
    pelaksanaId: pelaksana.body.data.id,
    peraturanId: peraturan.body.data.id,
    relatedSopId: related.body.data.detailSopId,
  };
}

/** Buat SOP lengkap dengan status SIAP_DIEVALUASI */
async function buildMinimalReadySop(
  penyusunAgent: Agent,
  pelaksanaId: string,
  peraturanId: string,
  relatedDetailSopId: string,
  opts: { judul: string; nomorSop: string; namaLembaga: string },
): Promise<string> {
  const sopRes = await penyusunAgent
    .post(`${API}/sop`)
    .send({ judul: opts.judul, nomorSop: opts.nomorSop, namaLembaga: opts.namaLembaga })
    .expect(201);
  const detailSopId: string = sopRes.body.data.detailSopId;

  await penyusunAgent
    .patch(`${API}/sop/header/${detailSopId}`)
    .send({
      judul: opts.judul,
      namaLembaga: opts.namaLembaga,
      dasarHukumPeraturanIds: [peraturanId],
      sopTerkaitDetailIds: [relatedDetailSopId],
      lampiran: {
        peringatan: ['Test.'],
        kualifikasiPelaksanaan: ['Test.'],
        peralatanPerlengkapan: ['Test.'],
        pencatatanPendataan: ['Test.'],
      },
    })
    .expect(200);

  await penyusunAgent
    .patch(`${API}/sop/langkah/${detailSopId}`)
    .send({
      pelaksana: [{ pelaksanaId }],
      langkah: [
        {
          tempId: 'step-1',
          jenis: JenisLangkahProsedur.AWAL_AKHIR,
          kegiatan: 'Kegiatan Test',
          kelengkapan: 'Dokumen Test',
          keluaran: 'Hasil Test',
          waktu: 1,
          satuanWaktu: SatuanWaktu.d,
          keterangan: 'Keterangan',
          pelaksanaId,
        },
      ],
    })
    .expect(200);

  await penyusunAgent
    .patch(`${API}/sop/diagram/${detailSopId}`)
    .send({ jenis: 'FLOWCHART', layoutSeed: 1, pathOverrides: { edges: {}, labels: {} } })
    .expect(200);

  await penyusunAgent
    .patch(`${API}/sop/status/${detailSopId}`)
    .send({ status: StatusSOP.SIAP_DIEVALUASI })
    .expect(200);

  return detailSopId;
}

describeIntegration('Evaluasi Edge Cases — skenario evaluasi komprehensif', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Per-group resources (OPD terpisah untuk isolasi)
  let falseCaseGroup: EvalGroupContext;
  let mandiriGroup: EvalGroupContext;
  let loopGroup: EvalGroupContext;
  let terjadwalGroup: EvalGroupContext;

  beforeAll(async () => {
    assertSafeIntegrationDatabase();
    const { AppModule } = await import('../../src/app.module');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(createDefaultValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);
    await pingIntegrationDatabase(prisma);
    await resetIntegrationDatabase(prisma);

    // Seed 4 OPD terpisah untuk isolasi antar describe group
    falseCaseGroup = await seedGroupOpdAndAgents(prisma, app, 'OPD False Case', 'ee-fc');
    mandiriGroup = await seedGroupOpdAndAgents(prisma, app, 'OPD Mandiri', 'ee-md');
    loopGroup = await seedGroupOpdAndAgents(prisma, app, 'OPD Loop Revisi', 'ee-lp');
    terjadwalGroup = await seedGroupOpdAndAgents(prisma, app, 'OPD Terjadwal', 'ee-tj');
  });

  afterAll(async () => {
    try {
      if (prisma) await resetIntegrationDatabase(prisma);
    } finally {
      if (app) await app.close();
    }
  });

  // ============================
  // FALSE CASES (OPD: falseCaseGroup)
  // ============================

  describe('False Cases — input tidak valid atau kondisi bisnis dilanggar', () => {
    let draftSopId: string;

    beforeAll(async () => {
      // Buat satu SOP SIAP_DIEVALUASI untuk test yang membutuhkan
      draftSopId = await buildMinimalReadySop(
        falseCaseGroup.penyusunAgent,
        falseCaseGroup.pelaksanaId,
        falseCaseGroup.peraturanId,
        falseCaseGroup.relatedSopId,
        { judul: 'SOP False Case', nomorSop: 'EE-SOP-FC-001', namaLembaga: 'OPD False Case' },
      );
    });

    it('POST /evaluasi dengan sopDetailIds yang kosong → 400 (False Case)', async () => {
      const res = await falseCaseGroup.pjPenyusunAgent
        .post(`${API}/evaluasi`)
        .send({ jenis: JenisPengajuanEvaluasi.MANDIRI, sopDetailIds: [] });
      expect([400, 409]).toContain(res.status);
    });

    it('POST /evaluasi dengan sopDetailIds berisi UUID duplikat → 400 (Edge Case)', async () => {
      const res = await falseCaseGroup.pjPenyusunAgent
        .post(`${API}/evaluasi`)
        .send({ jenis: JenisPengajuanEvaluasi.MANDIRI, sopDetailIds: [draftSopId, draftSopId] });
      expect([400, 409]).toContain(res.status);
    });

    it('POST /evaluasi dengan SOP berstatus DRAFT (bukan SIAP_DIEVALUASI) → 409 (False Case)', async () => {
      // sharedRelatedSopId masih berstatus DRAFT
      const res = await falseCaseGroup.pjPenyusunAgent
        .post(`${API}/evaluasi`)
        .send({
          jenis: JenisPengajuanEvaluasi.MANDIRI,
          sopDetailIds: [falseCaseGroup.relatedSopId],
        });
      expect([400, 409]).toContain(res.status);
    });

    it('POST /evaluasi dengan jenis tidak valid → 400 (False Case)', async () => {
      const res = await falseCaseGroup.pjPenyusunAgent
        .post(`${API}/evaluasi`)
        .send({ jenis: 'TIDAK_ADA', sopDetailIds: [draftSopId] });
      expect([400]).toContain(res.status);
    });
  });

  // ============================
  // MANDIRI WORKFLOW (OPD: mandiriGroup)
  // ============================

  describe('Pengajuan MANDIRI — workflow evaluasi tanpa nilaiOPD', () => {
    let sopUtamaId: string;
    let pengajuanId: string;

    beforeAll(async () => {
      sopUtamaId = await buildMinimalReadySop(
        mandiriGroup.penyusunAgent,
        mandiriGroup.pelaksanaId,
        mandiriGroup.peraturanId,
        mandiriGroup.relatedSopId,
        { judul: 'SOP Mandiri Edge', nomorSop: 'EE-SOP-MD-001', namaLembaga: 'OPD Mandiri' },
      );
    });

    it('POST /evaluasi MANDIRI — berhasil dibuat (Success Case)', async () => {
      const res = await mandiriGroup.pjPenyusunAgent
        .post(`${API}/evaluasi`)
        .send({ jenis: JenisPengajuanEvaluasi.MANDIRI, sopDetailIds: [sopUtamaId] })
        .expect(201);
      expect(res.body.success).toBe(true);
      const pengajuan = await prisma.pengajuanEvaluasi.findFirstOrThrow({
        where: { opdId: mandiriGroup.opdId },
        orderBy: { createdAt: 'desc' },
      });
      pengajuanId = pengajuan.pengajuanEvaluasiId;
    });

    it('POST /evaluasi duplikasi (masih ada pengajuan aktif) → 409 (Worst Case)', async () => {
      const res = await mandiriGroup.pjPenyusunAgent
        .post(`${API}/evaluasi`)
        .send({ jenis: JenisPengajuanEvaluasi.MANDIRI, sopDetailIds: [sopUtamaId] });
      expect([409, 400]).toContain(res.status);
    });

    it('PATCH nilai tanpa catatan saat PERLU_PERBAIKAN → 400 (False Case)', async () => {
      const res = await mandiriGroup.evaluatorAgent
        .patch(`${API}/evaluasi/${pengajuanId}/nilai/${sopUtamaId}`)
        .send({ hasil: HasilEvaluasi.PERLU_PERBAIKAN }); // tanpa catatan
      expect([400]).toContain(res.status);
    });

    it('PATCH nilai SOP di luar pengajuan → 403/404 (False Case)', async () => {
      const fakeDetailSopId = '00000000-0000-4000-8000-000000009001';
      const res = await mandiriGroup.evaluatorAgent
        .patch(`${API}/evaluasi/${pengajuanId}/nilai/${fakeDetailSopId}`)
        .send({ hasil: HasilEvaluasi.SESUAI });
      expect([403, 404]).toContain(res.status);
    });

    it('PATCH /evaluasi/:id/selesai dengan nilaiOPD pada MANDIRI → 400 (False Case)', async () => {
      const nilai = await prisma.nilaiEvaluasi.findUniqueOrThrow({
        where: {
          pengajuanEvaluasiId_detailSopId: {
            pengajuanEvaluasiId: pengajuanId,
            detailSopId: sopUtamaId,
          },
        },
      });
      await mandiriGroup.evaluatorAgent
        .patch(`${API}/evaluasi/${pengajuanId}/nilai/${sopUtamaId}`)
        .send({ hasil: HasilEvaluasi.SESUAI, version: nilai.version })
        .expect(200);

      const res = await mandiriGroup.evaluatorAgent
        .patch(`${API}/evaluasi/${pengajuanId}/selesai`)
        .send({ nilaiOPD: 5 }); // MANDIRI tidak boleh ada nilaiOPD
      expect([400]).toContain(res.status);
    });

    it('PATCH /evaluasi/:id/selesai tanpa nilaiOPD pada MANDIRI → 200 (Success Case)', async () => {
      await mandiriGroup.evaluatorAgent
        .patch(`${API}/evaluasi/${pengajuanId}/selesai`)
        .send({})
        .expect(200);
    });
  });

  // ============================
  // LOOP PERLU PERBAIKAN (OPD: loopGroup — TERPISAH dari MANDIRI)
  // ============================

  describe('Loop PERLU_PERBAIKAN — revisi dan kirim ulang evaluasi', () => {
    let sopLoopId: string;
    let pengajuanId: string;

    beforeAll(async () => {
      sopLoopId = await buildMinimalReadySop(
        loopGroup.penyusunAgent,
        loopGroup.pelaksanaId,
        loopGroup.peraturanId,
        loopGroup.relatedSopId,
        { judul: 'SOP Loop Revisi', nomorSop: 'EE-SOP-LP-001', namaLembaga: 'OPD Loop Revisi' },
      );

      const res = await loopGroup.pjPenyusunAgent
        .post(`${API}/evaluasi`)
        .send({ jenis: JenisPengajuanEvaluasi.MANDIRI, sopDetailIds: [sopLoopId] })
        .expect(201);
      const pengajuan = await prisma.pengajuanEvaluasi.findFirstOrThrow({
        where: { opdId: loopGroup.opdId },
        orderBy: { createdAt: 'desc' },
      });
      pengajuanId = pengajuan.pengajuanEvaluasiId;
    });

    it('evaluator memberi nilai PERLU_PERBAIKAN dengan catatan (Success Case)', async () => {
      const nilai = await prisma.nilaiEvaluasi.findUniqueOrThrow({
        where: {
          pengajuanEvaluasiId_detailSopId: {
            pengajuanEvaluasiId: pengajuanId,
            detailSopId: sopLoopId,
          },
        },
      });
      await loopGroup.evaluatorAgent
        .patch(`${API}/evaluasi/${pengajuanId}/nilai/${sopLoopId}`)
        .send({
          hasil: HasilEvaluasi.PERLU_PERBAIKAN,
          catatan: 'Perbaiki langkah 1.',
          version: nilai.version,
        })
        .expect(200);
    });

    it('kirim ulang evaluasi sebelum tindak lanjut selesai → 409 (Worst Case)', async () => {
      const res = await loopGroup.pjPenyusunAgent.post(
        `${API}/sop/penyusun-workbench/${sopLoopId}/kirim-ulang-evaluasi`,
      );
      expect([409, 400]).toContain(res.status);
    });

    it('penyusun menyelesaikan tindak lanjut (Success Case)', async () => {
      await loopGroup.penyusunAgent
        .patch(`${API}/evaluasi/${pengajuanId}/nilai/${sopLoopId}/tindak-lanjut-selesai`)
        .expect(200);
    });

    it('PJ Penyusun kirim ulang evaluasi setelah revisi selesai (Success Case)', async () => {
      await loopGroup.pjPenyusunAgent
        .post(`${API}/sop/penyusun-workbench/${sopLoopId}/kirim-ulang-evaluasi`)
        .expect(200);
    });

    it('PATCH nilai stale version → 409 (Worst Case)', async () => {
      const res = await loopGroup.evaluatorAgent
        .patch(`${API}/evaluasi/${pengajuanId}/nilai/${sopLoopId}`)
        .send({ hasil: HasilEvaluasi.SESUAI, version: 999 }); // version stale
      expect([409, 400]).toContain(res.status);
    });
  });

  // ============================
  // TERJADWAL WORKFLOW (OPD: terjadwalGroup — TERPISAH)
  // ============================

  describe('Pengajuan TERJADWAL — wajib nilaiOPD saat selesai', () => {
    let sopTerjadwalId: string;
    let pengajuanTerjadwalId: string;

    beforeAll(async () => {
      sopTerjadwalId = await buildMinimalReadySop(
        terjadwalGroup.penyusunAgent,
        terjadwalGroup.pelaksanaId,
        terjadwalGroup.peraturanId,
        terjadwalGroup.relatedSopId,
        { judul: 'SOP Terjadwal Edge', nomorSop: 'EE-SOP-TJ-001', namaLembaga: 'OPD Terjadwal' },
      );

      await terjadwalGroup.pjPenyusunAgent
        .post(`${API}/evaluasi`)
        .send({ jenis: JenisPengajuanEvaluasi.TERJADWAL, sopDetailIds: [sopTerjadwalId] })
        .expect(201);

      const pengajuan = await prisma.pengajuanEvaluasi.findFirstOrThrow({
        where: { opdId: terjadwalGroup.opdId },
        orderBy: { createdAt: 'desc' },
      });
      pengajuanTerjadwalId = pengajuan.pengajuanEvaluasiId;

      // Nilai dulu agar bisa test selesai
      const nilai = await prisma.nilaiEvaluasi.findUniqueOrThrow({
        where: {
          pengajuanEvaluasiId_detailSopId: {
            pengajuanEvaluasiId: pengajuanTerjadwalId,
            detailSopId: sopTerjadwalId,
          },
        },
      });
      await terjadwalGroup.evaluatorAgent
        .patch(`${API}/evaluasi/${pengajuanTerjadwalId}/nilai/${sopTerjadwalId}`)
        .send({ hasil: HasilEvaluasi.SESUAI, version: nilai.version })
        .expect(200);
    });

    it('PATCH selesai tanpa nilaiOPD pada TERJADWAL → 400 (False Case)', async () => {
      const res = await terjadwalGroup.evaluatorAgent
        .patch(`${API}/evaluasi/${pengajuanTerjadwalId}/selesai`)
        .send({}); // tanpa nilaiOPD untuk TERJADWAL
      expect([400]).toContain(res.status);
    });

    it('PATCH selesai dengan nilaiOPD di luar range 1-5 → 400 (Edge Case)', async () => {
      const res = await terjadwalGroup.evaluatorAgent
        .patch(`${API}/evaluasi/${pengajuanTerjadwalId}/selesai`)
        .send({ nilaiOPD: 10 }); // di luar range
      expect([400]).toContain(res.status);
    });

    it('PATCH selesai dengan nilaiOPD valid pada TERJADWAL → 200 (Success Case)', async () => {
      await terjadwalGroup.evaluatorAgent
        .patch(`${API}/evaluasi/${pengajuanTerjadwalId}/selesai`)
        .send({ nilaiOPD: 4 })
        .expect(200);

      const result = await prisma.pengajuanEvaluasi.findUniqueOrThrow({
        where: { pengajuanEvaluasiId: pengajuanTerjadwalId },
      });
      expect(result.nilaiOPD).toBe(4);
    });
  });
});
