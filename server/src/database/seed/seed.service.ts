import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import type { Prisma } from '../../generated/prisma';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  BagianSOP,
  HasilEvaluasi,
  JenisDokumenTte,
  JenisLangkahProsedur,
  JenisPengajuanEvaluasi,
  PeranPengguna,
  SatuanWaktu,
  StatusKomentar,
  StatusPengajuanEvaluasi,
  StatusSOP,
} from '../../generated/prisma';

const BCRYPT_SALT_ROUNDS = 10;
const DEFAULT_SEED_PASSWORD = '@Password123:)';

/** Identitas OPD — dipakai sebagai kunci lookup di SEED_USERS */
const SEED_OPD_PJ_EVALUATOR = 'Biro Organisasi Sekretariat Daerah';
const SEED_OPD_DINKES = 'Dinas Kesehatan Provinsi';
const SEED_OPD_DISKOMINFO = 'Dinas Komunikasi dan Informatika';
const SEED_OPD_DISDIK = 'Dinas Pendidikan Provinsi';

// ─── Types ─────────────────────────────────────────────────────────────────

interface SeedUserInput {
  readonly email: string;
  readonly nama: string;
  readonly peran: PeranPengguna;
  readonly nip: string;
  readonly jabatan: string;
  readonly pangkat: string;
  readonly nohp: string;
  readonly opdKey: string;
}

interface SeedPeraturanInput {
  readonly nomor: string;
  readonly tahun: number;
  readonly nama: string;
  readonly tentang: string;
}

interface SeedUserRecord extends Omit<SeedUserInput, 'opdKey'> {
  readonly penggunaId: string;
  readonly opdId: string;
}

// ─── Static Seed Data ───────────────────────────────────────────────────────

const SEED_USERS: ReadonlyArray<SeedUserInput> = [
  // ── Biro Organisasi (isPjEvaluatorOrganisasi = true) ──────────────────
  {
    email: 'pjevaluator@gmail.com',
    nama: 'PJ Evaluator (seed)',
    peran: PeranPengguna.PJ_EVALUATOR,
    nip: '198501012009011000',
    jabatan: 'Koordinator Evaluasi SOP',
    pangkat: 'Pembina',
    nohp: '081234567890',
    opdKey: SEED_OPD_PJ_EVALUATOR,
  },
  {
    email: 'evaluator1@gmail.com',
    nama: 'Evaluator 1 (seed)',
    peran: PeranPengguna.EVALUATOR,
    nip: '198501012009011001',
    jabatan: 'Evaluator Madya',
    pangkat: 'Pembina',
    nohp: '081234567891',
    opdKey: SEED_OPD_PJ_EVALUATOR,
  },
  {
    email: 'evaluator2@gmail.com',
    nama: 'Evaluator 2 (seed)',
    peran: PeranPengguna.EVALUATOR,
    nip: '198501012009011002',
    jabatan: 'Evaluator Muda',
    pangkat: 'Penata Tk. I',
    nohp: '081234567892',
    opdKey: SEED_OPD_PJ_EVALUATOR,
  },
  // ── Dinas Kesehatan ───────────────────────────────────────────────────
  {
    email: 'pjpenyusun.dinkes@gmail.com',
    nama: 'PJ Penyusun Dinkes (seed)',
    peran: PeranPengguna.PJ_PENYUSUN,
    nip: '198501012009011003',
    jabatan: 'Koordinator Penyusunan SOP Dinkes',
    pangkat: 'Pembina',
    nohp: '081234567893',
    opdKey: SEED_OPD_DINKES,
  },
  {
    email: 'penyusun.dinkes@gmail.com',
    nama: 'Penyusun Dinkes (seed)',
    peran: PeranPengguna.PENYUSUN,
    nip: '198501012009011004',
    jabatan: 'Analis SOP Dinkes',
    pangkat: 'Penata',
    nohp: '081234567894',
    opdKey: SEED_OPD_DINKES,
  },
  {
    email: 'kepalaopd.dinkes@gmail.com',
    nama: 'Kepala Dinkes (seed)',
    peran: PeranPengguna.KEPALA_OPD,
    nip: '198501012009011005',
    jabatan: 'Kepala OPD Dinkes',
    pangkat: 'Pembina Utama Muda',
    nohp: '081234567895',
    opdKey: SEED_OPD_DINKES,
  },
  // ── Dinas Komunikasi dan Informatika ──────────────────────────────────
  {
    email: 'pjpenyusun.diskominfo@gmail.com',
    nama: 'PJ Penyusun Diskominfo (seed)',
    peran: PeranPengguna.PJ_PENYUSUN,
    nip: '198501012009011006',
    jabatan: 'Koordinator Penyusunan SOP Diskominfo',
    pangkat: 'Pembina',
    nohp: '081234567896',
    opdKey: SEED_OPD_DISKOMINFO,
  },
  {
    email: 'penyusun.diskominfo@gmail.com',
    nama: 'Penyusun Diskominfo (seed)',
    peran: PeranPengguna.PENYUSUN,
    nip: '198501012009011007',
    jabatan: 'Analis SOP Diskominfo',
    pangkat: 'Penata',
    nohp: '081234567897',
    opdKey: SEED_OPD_DISKOMINFO,
  },
  {
    email: 'kepalaopd.diskominfo@gmail.com',
    nama: 'Kepala Diskominfo (seed)',
    peran: PeranPengguna.KEPALA_OPD,
    nip: '198501012009011008',
    jabatan: 'Kepala OPD Diskominfo',
    pangkat: 'Pembina Utama Muda',
    nohp: '081234567898',
    opdKey: SEED_OPD_DISKOMINFO,
  },
  // ── Dinas Pendidikan ──────────────────────────────────────────────────
  {
    email: 'pjpenyusun.disdik@gmail.com',
    nama: 'PJ Penyusun Disdik (seed)',
    peran: PeranPengguna.PJ_PENYUSUN,
    nip: '198501012009011009',
    jabatan: 'Koordinator Penyusunan SOP Disdik',
    pangkat: 'Pembina',
    nohp: '081234567899',
    opdKey: SEED_OPD_DISDIK,
  },
  {
    email: 'penyusun.disdik@gmail.com',
    nama: 'Penyusun Disdik (seed)',
    peran: PeranPengguna.PENYUSUN,
    nip: '198501012009011010',
    jabatan: 'Analis SOP Disdik',
    pangkat: 'Penata',
    nohp: '081234567800',
    opdKey: SEED_OPD_DISDIK,
  },
  {
    email: 'kepalaopd.disdik@gmail.com',
    nama: 'Kepala Disdik (seed)',
    peran: PeranPengguna.KEPALA_OPD,
    nip: '198501012009011011',
    jabatan: 'Kepala Dinas Pendidikan Provinsi',
    pangkat: 'Pembina Utama Muda',
    nohp: '081234567801',
    opdKey: SEED_OPD_DISDIK,
  },
];

const SEED_PERATURAN: ReadonlyArray<SeedPeraturanInput> = [
  {
    nomor: '12 Tahun 2024',
    tahun: 2024,
    nama: 'Peraturan Daerah Tata Kelola SOP',
    tentang: 'Pedoman tata kelola penyusunan dan evaluasi SOP di lingkungan pemerintah daerah.',
  },
  {
    nomor: '7 Tahun 2023',
    tahun: 2023,
    nama: 'Peraturan Gubernur Transformasi Layanan',
    tentang: 'Percepatan transformasi layanan publik berbasis prosedur baku dan digitalisasi.',
  },
  {
    nomor: '35 Tahun 2012',
    tahun: 2012,
    nama: 'Peraturan MenPAN-RB Nomor 35 Tahun 2012',
    tentang: 'Pedoman penyusunan standar operasional prosedur administrasi pemerintahan.',
  },
  {
    nomor: '15 Tahun 2022',
    tahun: 2022,
    nama: 'Peraturan Gubernur Pelayanan Publik Berkualitas',
    tentang: 'Penyelenggaraan pelayanan publik berkualitas dan berorientasi pada kepuasan masyarakat.',
  },
];

// ─── Service ────────────────────────────────────────────────────────────────

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // ── Entrypoint ─────────────────────────────────────────────────────────

  async run(): Promise<void> {
    const plainPassword = this.config.get<string>('SEED_DEFAULT_PASSWORD', DEFAULT_SEED_PASSWORD);
    const hashedPassword = await bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);

    await this.prisma.$transaction(async (tx) => {
      // 1. OPD
      const opdPjEvaluator = await this.ensureOpd(tx, SEED_OPD_PJ_EVALUATOR, true);
      const opdDinkes = await this.ensureOpd(tx, SEED_OPD_DINKES, false);
      const opdDiskominfo = await this.ensureOpd(tx, SEED_OPD_DISKOMINFO, false);
      const opdDisdik = await this.ensureOpd(tx, SEED_OPD_DISDIK, false);

      const opdIdMap: Record<string, string> = {
        [SEED_OPD_PJ_EVALUATOR]: opdPjEvaluator.opdId,
        [SEED_OPD_DINKES]: opdDinkes.opdId,
        [SEED_OPD_DISKOMINFO]: opdDiskominfo.opdId,
        [SEED_OPD_DISDIK]: opdDisdik.opdId,
      };

      // 2. Pengguna
      const u = await this.seedUsers(tx, hashedPassword, opdIdMap);

      // 3. Kepala & PJ Penyusun per OPD (setelah user terbuat; trigger DB mensyaratkan peran KEPALA_OPD / PJ_PENYUSUN + opdId sama)
      await this.ensureOpdLeadership(tx, {
        opdDinkesId: opdDinkes.opdId,
        kepalaDinkesId: u['kepalaopd.dinkes@gmail.com'].penggunaId,
        pjPenyusunDinkesId: u['pjpenyusun.dinkes@gmail.com'].penggunaId,
        opdDiskominfoId: opdDiskominfo.opdId,
        kepalaDiskominfoId: u['kepalaopd.diskominfo@gmail.com'].penggunaId,
        pjPenyusunDiskominfoId: u['pjpenyusun.diskominfo@gmail.com'].penggunaId,
        opdDisdikId: opdDisdik.opdId,
        kepalaDisdikId: u['kepalaopd.disdik@gmail.com'].penggunaId,
        pjPenyusunDisdikId: u['pjpenyusun.disdik@gmail.com'].penggunaId,
      });

      // 4. Riwayat OPD (jejak pindah OPD per pengguna)
      await this.seedRiwayatOpd(tx, Object.values(u));

      // 5. Peraturan
      const p = await this.seedPeraturan(tx, u['pjpenyusun.dinkes@gmail.com'].penggunaId);

      // 6. OPD ↔ Peraturan
      await this.seedOpdPeraturan(tx, {
        opdDinkesId: opdDinkes.opdId,
        opdDiskominfoId: opdDiskominfo.opdId,
        opdDisdikId: opdDisdik.opdId,
        peraturanDaerahId: p['12 Tahun 2024'].peraturanId,
        pergubTransformasiId: p['7 Tahun 2023'].peraturanId,
        permenpanId: p['35 Tahun 2012'].peraturanId,
        pergubLayananId: p['15 Tahun 2022'].peraturanId,
      });

      // 7. Pelaksana
      const pel = await this.seedPelaksana(tx, {
        opdDinkesId: opdDinkes.opdId,
        opdDiskominfoId: opdDiskominfo.opdId,
        opdDisdikId: opdDisdik.opdId,
      });

      // 8. SOP & DetailSOP — mencakup SEMUA 11 StatusSOP
      const d = await this.seedSopDanDetail(tx, {
        opdDinkesId: opdDinkes.opdId,
        opdDiskominfoId: opdDiskominfo.opdId,
        opdDisdikId: opdDisdik.opdId,
        penyusunDinkesId: u['penyusun.dinkes@gmail.com'].penggunaId,
        penyusunDiskominfoId: u['penyusun.diskominfo@gmail.com'].penggunaId,
        penyusunDisdikId: u['penyusun.disdik@gmail.com'].penggunaId,
      });

      // 9. Dasar Hukum & SOP Terkait
      await this.seedDasarHukumDanRelasi(tx, {
        d,
        p,
      });

      // 10. Swimlane (DetailSOPPelaksana) & LangkahSOP — mencakup SEMUA SatuanWaktu & JenisLangkahProsedur
      await this.seedSwimlaneDanLangkah(tx, { d, pel });

      // 11. Lampiran (semua 4 tipe) untuk beberapa SOP
      await this.seedLampiran(tx, { d });

      // 12. Kolaborasi: Komentar & LogEditSOP — mencakup SEMUA BagianSOP & StatusKomentar
      await this.seedKolaborasi(tx, {
        d,
        evaluator1Id: u['evaluator1@gmail.com'].penggunaId,
        evaluator2Id: u['evaluator2@gmail.com'].penggunaId,
        penyusunDinkesId: u['penyusun.dinkes@gmail.com'].penggunaId,
        pjPenyusunDinkesId: u['pjpenyusun.dinkes@gmail.com'].penggunaId,
        penyusunDiskominfoId: u['penyusun.diskominfo@gmail.com'].penggunaId,
      });

      // 13. PengajuanEvaluasi & NilaiEvaluasi — mencakup SEMUA 6 StatusPengajuanEvaluasi
      const pe = await this.seedPengajuanDanNilaiEvaluasi(tx, {
        d,
        opdDinkesId: opdDinkes.opdId,
        opdDiskominfoId: opdDiskominfo.opdId,
        opdDisdikId: opdDisdik.opdId,
        evaluator1Id: u['evaluator1@gmail.com'].penggunaId,
        evaluator2Id: u['evaluator2@gmail.com'].penggunaId,
        pjEvaluatorId: u['pjevaluator@gmail.com'].penggunaId,
        pjPenyusunDinkesId: u['pjpenyusun.dinkes@gmail.com'].penggunaId,
        pjPenyusunDiskominfoId: u['pjpenyusun.diskominfo@gmail.com'].penggunaId,
        pjPenyusunDisdikId: u['pjpenyusun.disdik@gmail.com'].penggunaId,
      });

      // 14. Log Nilai Evaluasi
      await this.seedLogNilaiEvaluasi(tx, { d, pe, evaluator1Id: u['evaluator1@gmail.com'].penggunaId, evaluator2Id: u['evaluator2@gmail.com'].penggunaId });

      // 15. DokumenTTE — JenisDokumenTte: SOP_BERLAKU, BERITA_ACARA_EVALUASI
      const dok = await this.seedDokumenTte(tx, { d, pe });

      // 16. PIN TTE di `Pengguna` & RiwayatTandaTangan
      await this.seedKredensialDanRiwayatTtd(tx, {
        u,
        dok,
        pjPenyusunDinkesId: u['pjpenyusun.dinkes@gmail.com'].penggunaId,
        kepalaDinkesId: u['kepalaopd.dinkes@gmail.com'].penggunaId,
        pjPenyusunDiskominfoId: u['pjpenyusun.diskominfo@gmail.com'].penggunaId,
        kepalaDiskominfoId: u['kepalaopd.diskominfo@gmail.com'].penggunaId,
        pjPenyusunDisdikId: u['pjpenyusun.disdik@gmail.com'].penggunaId,
        kepalaDisdikId: u['kepalaopd.disdik@gmail.com'].penggunaId,
        pjEvaluatorId: u['pjevaluator@gmail.com'].penggunaId,
      });
    });

    this.logger.log(
      [
        'Seed selesai.',
        'Cakupan: 4 OPD, 12 pengguna (semua PeranPengguna),',
        '4 peraturan, 13 DetailSOP (semua 11 StatusSOP),',
        '6 PengajuanEvaluasi (semua 6 StatusPengajuanEvaluasi),',
        'semua SatuanWaktu, JenisLangkahProsedur, BagianSOP,',
        'JenisDokumenTte, StatusKomentar, HasilEvaluasi.',
        'Invariant DB (CHECK/trigger): lihat migrasi 20260515120000_invariant_dokumentte_sop_terkait_pelaksana_opd_slots.',
      ].join(' '),
    );
    this.logger.warn(
      `Atur SEED_DEFAULT_PASSWORD di .env. Nilai default (${DEFAULT_SEED_PASSWORD}) hanya untuk pengembangan lokal.`,
    );
  }

  // ── MODUL 1: Master & Akses ─────────────────────────────────────────────

  private async ensureOpd(
    tx: Prisma.TransactionClient,
    nama: string,
    isPjEvaluatorOrganisasi: boolean,
  ): Promise<{ opdId: string }> {
    const existing = await tx.oPD.findFirst({
      where: { nama },
      select: { opdId: true, isPjEvaluatorOrganisasi: true },
    });
    if (existing !== null) {
      if (existing.isPjEvaluatorOrganisasi !== isPjEvaluatorOrganisasi) {
        return tx.oPD.update({
          where: { opdId: existing.opdId },
          data: { isPjEvaluatorOrganisasi },
          select: { opdId: true },
        });
      }
      return existing;
    }
    return tx.oPD.create({
      data: { nama, isPjEvaluatorOrganisasi },
      select: { opdId: true },
    });
  }

  private async seedUsers(
    tx: Prisma.TransactionClient,
    hashedPassword: string,
    opdIdMap: Record<string, string>,
  ): Promise<Record<string, SeedUserRecord>> {
    const result: Record<string, SeedUserRecord> = {};
    for (const user of SEED_USERS) {
      const opdId = opdIdMap[user.opdKey];
      const persisted = await tx.pengguna.upsert({
        where: { email: user.email },
        create: {
          email: user.email,
          opdId,
          nama: user.nama,
          kataSandi: hashedPassword,
          peran: user.peran,
          nip: user.nip,
          jabatan: user.jabatan,
          pangkat: user.pangkat,
          nohp: user.nohp,
        },
        update: {
          opdId,
          nama: user.nama,
          kataSandi: hashedPassword,
          peran: user.peran,
          nip: user.nip,
          jabatan: user.jabatan,
          pangkat: user.pangkat,
          nohp: user.nohp,
          deletedAt: null,
        },
        select: {
          penggunaId: true,
          opdId: true,
          email: true,
          nama: true,
          peran: true,
          nip: true,
          jabatan: true,
          pangkat: true,
          nohp: true,
        },
      });
      result[user.email] = persisted;
    }
    return result;
  }

  /** Slot `OPD.kepalaPenggunaId` / `pjPenyusunPenggunaId` — harus pengguna dengan peran & opdId yang cocok (trigger `trg_opd_kepala_pj_konsisten_*`). */
  private async ensureOpdLeadership(
    tx: Prisma.TransactionClient,
    params: {
      opdDinkesId: string;
      kepalaDinkesId: string;
      pjPenyusunDinkesId: string;
      opdDiskominfoId: string;
      kepalaDiskominfoId: string;
      pjPenyusunDiskominfoId: string;
      opdDisdikId: string;
      kepalaDisdikId: string;
      pjPenyusunDisdikId: string;
    },
  ): Promise<void> {
    await tx.oPD.update({
      where: { opdId: params.opdDinkesId },
      data: {
        kepalaPenggunaId: params.kepalaDinkesId,
        pjPenyusunPenggunaId: params.pjPenyusunDinkesId,
      },
    });
    await tx.oPD.update({
      where: { opdId: params.opdDiskominfoId },
      data: {
        kepalaPenggunaId: params.kepalaDiskominfoId,
        pjPenyusunPenggunaId: params.pjPenyusunDiskominfoId,
      },
    });
    await tx.oPD.update({
      where: { opdId: params.opdDisdikId },
      data: {
        kepalaPenggunaId: params.kepalaDisdikId,
        pjPenyusunPenggunaId: params.pjPenyusunDisdikId,
      },
    });
  }

  private async seedRiwayatOpd(
    tx: Prisma.TransactionClient,
    users: ReadonlyArray<SeedUserRecord>,
  ): Promise<void> {
    for (const user of users) {
      await tx.riwayatOpdPengguna.upsert({
        where: { penggunaId_opdId: { penggunaId: user.penggunaId, opdId: user.opdId } },
        create: { penggunaId: user.penggunaId, opdId: user.opdId },
        update: {},
      });
    }
  }

  // ── MODUL 1: Regulasi ──────────────────────────────────────────────────

  private async seedPeraturan(
    tx: Prisma.TransactionClient,
    lastEditedById: string,
  ): Promise<Record<string, { peraturanId: string }>> {
    const result: Record<string, { peraturanId: string }> = {};
    for (const p of SEED_PERATURAN) {
      const persisted = await tx.peraturan.upsert({
        where: { nomor_tahun: { nomor: p.nomor, tahun: p.tahun } },
        create: { nama: p.nama, nomor: p.nomor, tahun: p.tahun, tentang: p.tentang, lastEditedById },
        update: { nama: p.nama, tentang: p.tentang, lastEditedById },
        select: { peraturanId: true },
      });
      result[p.nomor] = persisted;
    }
    return result;
  }

  private async seedOpdPeraturan(
    tx: Prisma.TransactionClient,
    params: {
      opdDinkesId: string;
      opdDiskominfoId: string;
      opdDisdikId: string;
      peraturanDaerahId: string;
      pergubTransformasiId: string;
      permenpanId: string;
      pergubLayananId: string;
    },
  ): Promise<void> {
    const pairs: Array<{ opdId: string; peraturanId: string }> = [
      // Dinkes: Perda tata kelola + MenPAN-RB
      { opdId: params.opdDinkesId, peraturanId: params.peraturanDaerahId },
      { opdId: params.opdDinkesId, peraturanId: params.permenpanId },
      // Diskominfo: Pergub transformasi + Pergub layanan
      { opdId: params.opdDiskominfoId, peraturanId: params.pergubTransformasiId },
      { opdId: params.opdDiskominfoId, peraturanId: params.pergubLayananId },
      // Disdik: Perda tata kelola + Pergub layanan
      { opdId: params.opdDisdikId, peraturanId: params.peraturanDaerahId },
      { opdId: params.opdDisdikId, peraturanId: params.pergubLayananId },
    ];
    for (const pair of pairs) {
      await tx.oPDPeraturan.upsert({
        where: { opdId_peraturanId: pair },
        create: pair,
        update: {},
      });
    }
  }

  // ── MODUL 2: Authoring SOP ─────────────────────────────────────────────

  private async seedPelaksana(
    tx: Prisma.TransactionClient,
    params: { opdDinkesId: string; opdDiskominfoId: string; opdDisdikId: string },
  ): Promise<Record<string, { pelaksanaId: string }>> {
    const result: Record<string, { pelaksanaId: string }> = {};
    const entries: Array<{ key: string; opdId: string; nama: string }> = [
      { key: 'FRONT_OFFICE_DINKES', opdId: params.opdDinkesId, nama: 'Front Office Dinkes' },
      { key: 'KASUBAG_DINKES', opdId: params.opdDinkesId, nama: 'Kasubag Pelayanan Dinkes' },
      { key: 'DOKTER_DINKES', opdId: params.opdDinkesId, nama: 'Dokter Pemeriksa' },
      { key: 'TIM_LAYANAN_DISKOMINFO', opdId: params.opdDiskominfoId, nama: 'Tim Layanan Informasi Diskominfo' },
      { key: 'TIM_MEDIA_DISKOMINFO', opdId: params.opdDiskominfoId, nama: 'Tim Media Sosial Diskominfo' },
      { key: 'TIM_PPDB_DISDIK', opdId: params.opdDisdikId, nama: 'Tim Penerimaan PPDB Disdik' },
      { key: 'SEKSI_AKREDITASI_DISDIK', opdId: params.opdDisdikId, nama: 'Seksi Akreditasi Disdik' },
    ];
    for (const entry of entries) {
      result[entry.key] = await this.upsertPelaksanaByNama(tx, entry.opdId, entry.nama);
    }
    return result;
  }

  private async upsertPelaksanaByNama(
    tx: Prisma.TransactionClient,
    opdId: string,
    nama: string,
  ): Promise<{ pelaksanaId: string }> {
    const existing = await tx.pelaksana.findFirst({
      where: { opdId, nama },
      select: { pelaksanaId: true },
    });
    if (existing !== null) return existing;
    return tx.pelaksana.create({ data: { opdId, nama }, select: { pelaksanaId: true } });
  }

  /**
   * Membuat SOP & DetailSOP mencakup SEMUA 11 nilai StatusSOP:
   * DRAFT, SEDANG_DISUSUN, SIAP_DIEVALUASI, DIAJUKAN_EVALUASI,
   * SEDANG_DIEVALUASI, REVISI_DARI_EVALUATOR, SIAP_DIVERIFIKASI,
   * DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI, BERLAKU, DIGANTIKAN, DICABUT.
   */
  private async seedSopDanDetail(
    tx: Prisma.TransactionClient,
    params: {
      opdDinkesId: string;
      opdDiskominfoId: string;
      opdDisdikId: string;
      penyusunDinkesId: string;
      penyusunDiskominfoId: string;
      penyusunDisdikId: string;
    },
  ): Promise<Record<string, { detailSopId: string }>> {
    // SOP parents
    const sopSuratSehat = await this.findOrCreateSop(tx, params.opdDinkesId, 'Pelayanan Surat Keterangan Sehat');
    const sopImunisasi = await this.findOrCreateSop(tx, params.opdDinkesId, 'Imunisasi Rutin');
    const sopSurveilans = await this.findOrCreateSop(tx, params.opdDinkesId, 'Surveilans Epidemiologi');
    const sopGiziBuruk = await this.findOrCreateSop(tx, params.opdDinkesId, 'Penanganan Gizi Buruk');
    const sopRawatInap = await this.findOrCreateSop(tx, params.opdDinkesId, 'Pelayanan Rawat Inap');
    const sopFarmasi = await this.findOrCreateSop(tx, params.opdDinkesId, 'Manajemen Farmasi Puskesmas');
    const sopInfoPublik = await this.findOrCreateSop(tx, params.opdDiskominfoId, 'Permohonan Informasi Publik');
    const sopMediaSosial = await this.findOrCreateSop(tx, params.opdDiskominfoId, 'Pengelolaan Media Sosial Pemerintah');
    const sopAduanMasy = await this.findOrCreateSop(tx, params.opdDiskominfoId, 'Penanganan Aduan Masyarakat Digital');
    const sopPPDB = await this.findOrCreateSop(tx, params.opdDisdikId, 'Penerimaan Peserta Didik Baru (PPDB)');
    const sopAkreditasi = await this.findOrCreateSop(tx, params.opdDisdikId, 'Akreditasi Sekolah');

    const d: Record<string, { detailSopId: string }> = {};

    // ── Dinkes ─────────────────────────────────────────────────────────

    // StatusSOP.BERLAKU — versi aktif yang sah
    d['DINKES_001_V1'] = await this.upsertDetailSop(tx, {
      nomorSOP: 'SOP-DINKES-001-V1',
      sopId: sopSuratSehat.sopId,
      versi: 1,
      status: StatusSOP.BERLAKU,
      namaLembaga: 'Dinas Kesehatan Provinsi',
      dibuatOlehId: params.penyusunDinkesId,
      terakhirDieditOlehId: params.penyusunDinkesId,
      tanggalEfektif: new Date('2024-07-01T00:00:00.000Z'),
    });

    // StatusSOP.SEDANG_DIEVALUASI — sedang dalam proses evaluasi
    d['DINKES_001_V2'] = await this.upsertDetailSop(tx, {
      nomorSOP: 'SOP-DINKES-001-V2',
      sopId: sopSuratSehat.sopId,
      versi: 2,
      status: StatusSOP.SEDANG_DIEVALUASI,
      namaLembaga: 'Dinas Kesehatan Provinsi',
      dibuatOlehId: params.penyusunDinkesId,
      terakhirDieditOlehId: params.penyusunDinkesId,
      tanggalRevisi: new Date('2026-02-01T00:00:00.000Z'),
    });

    // StatusSOP.DRAFT — baru dibuat, belum disusun
    d['DINKES_002_V1'] = await this.upsertDetailSop(tx, {
      nomorSOP: 'SOP-DINKES-002-V1',
      sopId: sopImunisasi.sopId,
      versi: 1,
      status: StatusSOP.DRAFT,
      namaLembaga: 'Dinas Kesehatan Provinsi',
      dibuatOlehId: params.penyusunDinkesId,
      terakhirDieditOlehId: params.penyusunDinkesId,
    });

    // StatusSOP.SEDANG_DISUSUN — proses penyusunan aktif
    d['DINKES_003_V1'] = await this.upsertDetailSop(tx, {
      nomorSOP: 'SOP-DINKES-003-V1',
      sopId: sopSurveilans.sopId,
      versi: 1,
      status: StatusSOP.SEDANG_DISUSUN,
      namaLembaga: 'Dinas Kesehatan Provinsi',
      dibuatOlehId: params.penyusunDinkesId,
      terakhirDieditOlehId: params.penyusunDinkesId,
    });

    // StatusSOP.SIAP_DIEVALUASI — penyusunan selesai, menunggu pengajuan evaluasi
    d['DINKES_004_V1'] = await this.upsertDetailSop(tx, {
      nomorSOP: 'SOP-DINKES-004-V1',
      sopId: sopGiziBuruk.sopId,
      versi: 1,
      status: StatusSOP.SIAP_DIEVALUASI,
      namaLembaga: 'Dinas Kesehatan Provinsi',
      dibuatOlehId: params.penyusunDinkesId,
      terakhirDieditOlehId: params.penyusunDinkesId,
    });

    // StatusSOP.DIAJUKAN_EVALUASI — sudah diajukan, evaluasi belum dimulai
    d['DINKES_005_V1'] = await this.upsertDetailSop(tx, {
      nomorSOP: 'SOP-DINKES-005-V1',
      sopId: sopRawatInap.sopId,
      versi: 1,
      status: StatusSOP.DIAJUKAN_EVALUASI,
      namaLembaga: 'Dinas Kesehatan Provinsi',
      dibuatOlehId: params.penyusunDinkesId,
      terakhirDieditOlehId: params.penyusunDinkesId,
    });

    // StatusSOP.REVISI_DARI_EVALUATOR — perlu perbaikan dari evaluator
    d['DINKES_006_V1'] = await this.upsertDetailSop(tx, {
      nomorSOP: 'SOP-DINKES-006-V1',
      sopId: sopFarmasi.sopId,
      versi: 1,
      status: StatusSOP.REVISI_DARI_EVALUATOR,
      namaLembaga: 'Dinas Kesehatan Provinsi',
      dibuatOlehId: params.penyusunDinkesId,
      terakhirDieditOlehId: params.penyusunDinkesId,
    });

    // ── Diskominfo ───────────────────────────────────────────────────────

    // StatusSOP.SIAP_DIEVALUASI (Diskominfo)
    d['DISKOMINFO_001_V1'] = await this.upsertDetailSop(tx, {
      nomorSOP: 'SOP-DISKOMINFO-001-V1',
      sopId: sopInfoPublik.sopId,
      versi: 1,
      status: StatusSOP.SIAP_DIEVALUASI,
      namaLembaga: 'Dinas Komunikasi dan Informatika',
      dibuatOlehId: params.penyusunDiskominfoId,
      terakhirDieditOlehId: params.penyusunDiskominfoId,
    });

    // StatusSOP.SIAP_DIVERIFIKASI — evaluasi selesai, menunggu verifikasi PJ Evaluator
    d['DISKOMINFO_002_V1'] = await this.upsertDetailSop(tx, {
      nomorSOP: 'SOP-DISKOMINFO-002-V1',
      sopId: sopMediaSosial.sopId,
      versi: 1,
      status: StatusSOP.SIAP_DIVERIFIKASI,
      namaLembaga: 'Dinas Komunikasi dan Informatika',
      dibuatOlehId: params.penyusunDiskominfoId,
      terakhirDieditOlehId: params.penyusunDiskominfoId,
    });

    // StatusSOP.DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI — diverifikasi, menunggu pengesahan akhir
    d['DISKOMINFO_003_V1'] = await this.upsertDetailSop(tx, {
      nomorSOP: 'SOP-DISKOMINFO-003-V1',
      sopId: sopAduanMasy.sopId,
      versi: 1,
      status: StatusSOP.DIVERIFIKASI_PJ_EVALUATOR_ORGANISASI,
      namaLembaga: 'Dinas Komunikasi dan Informatika',
      dibuatOlehId: params.penyusunDiskominfoId,
      terakhirDieditOlehId: params.penyusunDiskominfoId,
    });

    // ── Dinas Pendidikan ─────────────────────────────────────────────────

    // StatusSOP.DIGANTIKAN — versi lama yang telah digantikan versi baru
    d['DISDIK_001_V1'] = await this.upsertDetailSop(tx, {
      nomorSOP: 'SOP-DISDIK-001-V1',
      sopId: sopPPDB.sopId,
      versi: 1,
      status: StatusSOP.DIGANTIKAN,
      namaLembaga: 'Dinas Pendidikan Provinsi',
      dibuatOlehId: params.penyusunDisdikId,
      terakhirDieditOlehId: params.penyusunDisdikId,
      tanggalEfektif: new Date('2023-06-01T00:00:00.000Z'),
    });

    // StatusSOP.BERLAKU — versi baru pengganti (constraint: 1 BERLAKU per SOP)
    d['DISDIK_001_V2'] = await this.upsertDetailSop(tx, {
      nomorSOP: 'SOP-DISDIK-001-V2',
      sopId: sopPPDB.sopId,
      versi: 2,
      status: StatusSOP.BERLAKU,
      namaLembaga: 'Dinas Pendidikan Provinsi',
      dibuatOlehId: params.penyusunDisdikId,
      terakhirDieditOlehId: params.penyusunDisdikId,
      tanggalEfektif: new Date('2024-06-01T00:00:00.000Z'),
      tanggalRevisi: new Date('2024-05-01T00:00:00.000Z'),
    });

    // StatusSOP.DICABUT — SOP yang sudah dicabut/tidak berlaku lagi
    d['DISDIK_002_V1'] = await this.upsertDetailSop(tx, {
      nomorSOP: 'SOP-DISDIK-002-V1',
      sopId: sopAkreditasi.sopId,
      versi: 1,
      status: StatusSOP.DICABUT,
      namaLembaga: 'Dinas Pendidikan Provinsi',
      dibuatOlehId: params.penyusunDisdikId,
      terakhirDieditOlehId: params.penyusunDisdikId,
      tanggalEfektif: new Date('2022-01-01T00:00:00.000Z'),
    });

    return d;
  }

  private async upsertDetailSop(
    tx: Prisma.TransactionClient,
    data: {
      nomorSOP: string;
      sopId: string;
      versi: number;
      status: StatusSOP;
      namaLembaga: string;
      dibuatOlehId: string;
      terakhirDieditOlehId: string;
      tanggalEfektif?: Date;
      tanggalRevisi?: Date;
    },
  ): Promise<{ detailSopId: string }> {
    return tx.detailSOP.upsert({
      where: { nomorSOP: data.nomorSOP },
      create: data,
      update: {
        status: data.status,
        namaLembaga: data.namaLembaga,
        terakhirDieditOlehId: data.terakhirDieditOlehId,
        tanggalEfektif: data.tanggalEfektif,
        tanggalRevisi: data.tanggalRevisi,
      },
      select: { detailSopId: true },
    });
  }

  private async findOrCreateSop(
    tx: Prisma.TransactionClient,
    opdId: string,
    judul: string,
  ): Promise<{ sopId: string }> {
    const existing = await tx.sOP.findFirst({
      where: { opdId, judul },
      select: { sopId: true },
    });
    if (existing !== null) return existing;
    return tx.sOP.create({ data: { opdId, judul }, select: { sopId: true } });
  }

  private async seedDasarHukumDanRelasi(
    tx: Prisma.TransactionClient,
    params: {
      d: Record<string, { detailSopId: string }>;
      p: Record<string, { peraturanId: string }>;
    },
  ): Promise<void> {
    const { d, p } = params;
    const dasarHukumPairs: Array<{ detailSopId: string; peraturanId: string }> = [
      { detailSopId: d['DINKES_001_V1'].detailSopId, peraturanId: p['12 Tahun 2024'].peraturanId },
      { detailSopId: d['DINKES_001_V1'].detailSopId, peraturanId: p['35 Tahun 2012'].peraturanId },
      { detailSopId: d['DINKES_001_V2'].detailSopId, peraturanId: p['12 Tahun 2024'].peraturanId },
      { detailSopId: d['DINKES_004_V1'].detailSopId, peraturanId: p['35 Tahun 2012'].peraturanId },
      { detailSopId: d['DISKOMINFO_001_V1'].detailSopId, peraturanId: p['7 Tahun 2023'].peraturanId },
      { detailSopId: d['DISKOMINFO_001_V1'].detailSopId, peraturanId: p['15 Tahun 2022'].peraturanId },
      { detailSopId: d['DISDIK_001_V2'].detailSopId, peraturanId: p['12 Tahun 2024'].peraturanId },
      { detailSopId: d['DISDIK_001_V2'].detailSopId, peraturanId: p['15 Tahun 2022'].peraturanId },
    ];

    for (const pair of dasarHukumPairs) {
      await tx.dasarHukum.upsert({
        where: { detailSopId_peraturanId: pair },
        create: pair,
        update: {},
      });
    }

    // SopTerkait — relasi antar DetailSOP (satu arah; tidak boleh self-loop atau pasangan terbalik `(B,A)` bila `(A,B)` ada — trigger `trg_sop_terkait_*`)
    const relasiPairs: Array<{ detailSopId: string; detailSopTerkaitId: string }> = [
      { detailSopId: d['DINKES_001_V1'].detailSopId, detailSopTerkaitId: d['DISKOMINFO_001_V1'].detailSopId },
      { detailSopId: d['DINKES_001_V1'].detailSopId, detailSopTerkaitId: d['DISDIK_001_V2'].detailSopId },
      { detailSopId: d['DISDIK_001_V1'].detailSopId, detailSopTerkaitId: d['DISDIK_001_V2'].detailSopId },
    ];

    for (const pair of relasiPairs) {
      await tx.sopTerkait.upsert({
        where: { detailSopId_detailSopTerkaitId: pair },
        create: pair,
        update: {},
      });
    }
  }

  /**
   * Swimlane & LangkahSOP — mencakup:
   * - Semua JenisLangkahProsedur: AWAL_AKHIR (start & end), KEGIATAN, KEPUTUSAN
   * - Semua SatuanWaktu: m, h, d, w, mo, y
   * - Percabangan langkah (Ya/Tidak) pada KEPUTUSAN
   * `Pelaksana` harus `opdId` sama dengan SOP pemilik DetailSOP (trigger `trg_detailsoppelaksana_*` / `trg_langkahsop_*`).
   */
  private async seedSwimlaneDanLangkah(
    tx: Prisma.TransactionClient,
    params: {
      d: Record<string, { detailSopId: string }>;
      pel: Record<string, { pelaksanaId: string }>;
    },
  ): Promise<void> {
    const { d, pel } = params;

    // ── Swimlane: SOP-DINKES-001-V1 ───────────────────────────────────
    await this.upsertSwimlane(tx, d['DINKES_001_V1'].detailSopId, pel['FRONT_OFFICE_DINKES'].pelaksanaId, 1);
    await this.upsertSwimlane(tx, d['DINKES_001_V1'].detailSopId, pel['KASUBAG_DINKES'].pelaksanaId, 2);
    await this.upsertSwimlane(tx, d['DINKES_001_V1'].detailSopId, pel['DOKTER_DINKES'].pelaksanaId, 3);

    // ── LangkahSOP: SOP-DINKES-001-V1 (alur AWAL→KEGIATAN→KEPUTUSAN→AWAL) ──
    const dinkesV1Id = d['DINKES_001_V1'].detailSopId;
    const lD1Start = await this.upsertLangkah(tx, {
      detailSopId: dinkesV1Id,
      kegiatan: 'Mulai: Pemohon datang ke loket pelayanan.',
      jenis: JenisLangkahProsedur.AWAL_AKHIR,
      urutan: 1,
      kelengkapan: '-',
      keluaran: 'Pemohon terdaftar',
      waktu: 15,
      satuanWaktu: SatuanWaktu.m, // m = menit
      keterangan: 'Titik awal alur pelayanan surat keterangan sehat.',
      pelaksanaId: pel['FRONT_OFFICE_DINKES'].pelaksanaId,
    });
    const lD1TerimaData = await this.upsertLangkah(tx, {
      detailSopId: dinkesV1Id,
      kegiatan: 'Menerima dan mencatat berkas permohonan.',
      jenis: JenisLangkahProsedur.KEGIATAN,
      urutan: 2,
      kelengkapan: 'Formulir permohonan, KTP, surat pengantar',
      keluaran: 'Berkas tercatat di sistem',
      waktu: 30,
      satuanWaktu: SatuanWaktu.m, // m = menit
      keterangan: 'Petugas front office melakukan input data ke sistem.',
      pelaksanaId: pel['FRONT_OFFICE_DINKES'].pelaksanaId,
    });
    const lD1Verifikasi = await this.upsertLangkah(tx, {
      detailSopId: dinkesV1Id,
      kegiatan: 'Apakah berkas pemohon lengkap dan valid?',
      jenis: JenisLangkahProsedur.KEPUTUSAN,
      urutan: 3,
      kelengkapan: 'Checklist kelengkapan dokumen',
      keluaran: 'Status berkas: lengkap / tidak lengkap',
      waktu: 2,
      satuanWaktu: SatuanWaktu.h, // h = jam
      keterangan: 'Kasubag memverifikasi dokumen secara administratif.',
      pelaksanaId: pel['KASUBAG_DINKES'].pelaksanaId,
    });
    const lD1Pemeriksaan = await this.upsertLangkah(tx, {
      detailSopId: dinkesV1Id,
      kegiatan: 'Melakukan pemeriksaan medis terhadap pemohon.',
      jenis: JenisLangkahProsedur.KEGIATAN,
      urutan: 4,
      kelengkapan: 'Berkas lengkap tervalidasi',
      keluaran: 'Hasil pemeriksaan medis',
      waktu: 1,
      satuanWaktu: SatuanWaktu.d, // d = hari
      keterangan: 'Dokter melakukan pemeriksaan fisik dan mencatat hasil.',
      pelaksanaId: pel['DOKTER_DINKES'].pelaksanaId,
    });
    const lD1Terbit = await this.upsertLangkah(tx, {
      detailSopId: dinkesV1Id,
      kegiatan: 'Selesai: Menerbitkan surat keterangan sehat kepada pemohon.',
      jenis: JenisLangkahProsedur.AWAL_AKHIR,
      urutan: 5,
      kelengkapan: 'Hasil pemeriksaan dan cap dinas',
      keluaran: 'Surat keterangan sehat resmi',
      waktu: 1,
      satuanWaktu: SatuanWaktu.d, // d = hari
      keterangan: 'Titik akhir: surat diserahkan kepada pemohon.',
      pelaksanaId: pel['KASUBAG_DINKES'].pelaksanaId,
    });

    // Hubungkan alur: Start → TerimaData → Verifikasi (Ya→Pemeriksaan, Tidak→TerimaData) → Pemeriksaan → Terbit
    await tx.langkahSOP.update({
      where: { langkahSopId: lD1Start.langkahSopId },
      data: { langkahSelanjutnyaYaId: lD1TerimaData.langkahSopId },
    });
    await tx.langkahSOP.update({
      where: { langkahSopId: lD1TerimaData.langkahSopId },
      data: { langkahSelanjutnyaYaId: lD1Verifikasi.langkahSopId },
    });
    await tx.langkahSOP.update({
      where: { langkahSopId: lD1Verifikasi.langkahSopId },
      data: {
        langkahSelanjutnyaYaId: lD1Pemeriksaan.langkahSopId,   // berkas lengkap
        langkahSelanjutnyaTidakId: lD1TerimaData.langkahSopId, // berkas tidak lengkap → kembali
      },
    });
    await tx.langkahSOP.update({
      where: { langkahSopId: lD1Pemeriksaan.langkahSopId },
      data: { langkahSelanjutnyaYaId: lD1Terbit.langkahSopId },
    });

    // ── Swimlane & LangkahSOP: SOP-DISKOMINFO-001-V1 ──────────────────
    await this.upsertSwimlane(tx, d['DISKOMINFO_001_V1'].detailSopId, pel['TIM_LAYANAN_DISKOMINFO'].pelaksanaId, 1);

    const diskoV1Id = d['DISKOMINFO_001_V1'].detailSopId;
    const lDsk1Start = await this.upsertLangkah(tx, {
      detailSopId: diskoV1Id,
      kegiatan: 'Mulai: Menerima permohonan informasi dari pemohon.',
      jenis: JenisLangkahProsedur.AWAL_AKHIR,
      urutan: 1,
      kelengkapan: 'Formulir permohonan informasi',
      keluaran: 'Permohonan terdaftar',
      waktu: 30,
      satuanWaktu: SatuanWaktu.m, // m = menit
      keterangan: 'Mulai alur permohonan informasi publik.',
      pelaksanaId: pel['TIM_LAYANAN_DISKOMINFO'].pelaksanaId,
    });
    const lDsk1Telusuri = await this.upsertLangkah(tx, {
      detailSopId: diskoV1Id,
      kegiatan: 'Menelusuri dan mengumpulkan data informasi yang diminta.',
      jenis: JenisLangkahProsedur.KEGIATAN,
      urutan: 2,
      kelengkapan: 'Identitas permohonan',
      keluaran: 'Draft informasi yang akan diberikan',
      waktu: 2,
      satuanWaktu: SatuanWaktu.h, // h = jam
      keterangan: 'Tim mencari data di sistem arsip digital.',
      pelaksanaId: pel['TIM_LAYANAN_DISKOMINFO'].pelaksanaId,
    });
    const lDsk1Kategori = await this.upsertLangkah(tx, {
      detailSopId: diskoV1Id,
      kegiatan: 'Apakah informasi termasuk dalam kategori dikecualikan?',
      jenis: JenisLangkahProsedur.KEPUTUSAN,
      urutan: 3,
      kelengkapan: 'Daftar informasi dikecualikan',
      keluaran: 'Keputusan: informasi publik / dikecualikan',
      waktu: 3,
      satuanWaktu: SatuanWaktu.d, // d = hari
      keterangan: 'Mengacu pada UU Keterbukaan Informasi Publik.',
      pelaksanaId: pel['TIM_LAYANAN_DISKOMINFO'].pelaksanaId,
    });
    const lDsk1Serahkan = await this.upsertLangkah(tx, {
      detailSopId: diskoV1Id,
      kegiatan: 'Selesai: Menyerahkan informasi kepada pemohon.',
      jenis: JenisLangkahProsedur.AWAL_AKHIR,
      urutan: 4,
      kelengkapan: 'Informasi terverifikasi',
      keluaran: 'Informasi publik diterima pemohon',
      waktu: 1,
      satuanWaktu: SatuanWaktu.w, // w = minggu (SLA penyerahan maksimal 1 minggu)
      keterangan: 'Informasi diserahkan sesuai SLA keterbukaan informasi.',
      pelaksanaId: pel['TIM_LAYANAN_DISKOMINFO'].pelaksanaId,
    });
    const lDsk1Tolak = await this.upsertLangkah(tx, {
      detailSopId: diskoV1Id,
      kegiatan: 'Menyampaikan surat penolakan pemberian informasi.',
      jenis: JenisLangkahProsedur.KEGIATAN,
      urutan: 5,
      kelengkapan: 'Surat penolakan bermaterai',
      keluaran: 'Surat penolakan diterima pemohon',
      waktu: 1,
      satuanWaktu: SatuanWaktu.mo, // mo = bulan (proses keberatan)
      keterangan: 'Pemohon berhak mengajukan keberatan dalam 30 hari.',
      pelaksanaId: pel['TIM_LAYANAN_DISKOMINFO'].pelaksanaId,
    });

    await tx.langkahSOP.update({
      where: { langkahSopId: lDsk1Start.langkahSopId },
      data: { langkahSelanjutnyaYaId: lDsk1Telusuri.langkahSopId },
    });
    await tx.langkahSOP.update({
      where: { langkahSopId: lDsk1Telusuri.langkahSopId },
      data: { langkahSelanjutnyaYaId: lDsk1Kategori.langkahSopId },
    });
    await tx.langkahSOP.update({
      where: { langkahSopId: lDsk1Kategori.langkahSopId },
      data: {
        langkahSelanjutnyaYaId: lDsk1Tolak.langkahSopId,    // dikecualikan → tolak
        langkahSelanjutnyaTidakId: lDsk1Serahkan.langkahSopId, // tidak dikecualikan → serahkan
      },
    });

    // ── Swimlane & LangkahSOP: SOP-DISDIK-001-V2 (dengan SatuanWaktu w, mo, y) ──
    await this.upsertSwimlane(tx, d['DISDIK_001_V2'].detailSopId, pel['TIM_PPDB_DISDIK'].pelaksanaId, 1);

    const disdikV2Id = d['DISDIK_001_V2'].detailSopId;
    const lDdk2Start = await this.upsertLangkah(tx, {
      detailSopId: disdikV2Id,
      kegiatan: 'Mulai: Membuka masa pendaftaran PPDB secara online.',
      jenis: JenisLangkahProsedur.AWAL_AKHIR,
      urutan: 1,
      kelengkapan: 'Pengumuman resmi PPDB',
      keluaran: 'Sistem pendaftaran aktif',
      waktu: 2,
      satuanWaktu: SatuanWaktu.w, // w = minggu
      keterangan: 'Masa pendaftaran dibuka selama 2 minggu.',
      pelaksanaId: pel['TIM_PPDB_DISDIK'].pelaksanaId,
    });
    const lDdk2Verifikasi = await this.upsertLangkah(tx, {
      detailSopId: disdikV2Id,
      kegiatan: 'Memverifikasi berkas dan dokumen pendaftar.',
      jenis: JenisLangkahProsedur.KEGIATAN,
      urutan: 2,
      kelengkapan: 'Akta kelahiran, rapor, KK',
      keluaran: 'Daftar pendaftar terverifikasi',
      waktu: 1,
      satuanWaktu: SatuanWaktu.mo, // mo = bulan
      keterangan: 'Verifikasi dilakukan selama 1 bulan setelah penutupan pendaftaran.',
      pelaksanaId: pel['TIM_PPDB_DISDIK'].pelaksanaId,
    });
    const lDdk2Keputusan = await this.upsertLangkah(tx, {
      detailSopId: disdikV2Id,
      kegiatan: 'Apakah pendaftar memenuhi syarat penerimaan?',
      jenis: JenisLangkahProsedur.KEPUTUSAN,
      urutan: 3,
      kelengkapan: 'Hasil verifikasi berkas',
      keluaran: 'Keputusan diterima / tidak diterima',
      waktu: 3,
      satuanWaktu: SatuanWaktu.d, // d = hari
      keterangan: 'Berdasarkan nilai dan zonasi sesuai peraturan.',
      pelaksanaId: pel['TIM_PPDB_DISDIK'].pelaksanaId,
    });
    const lDdk2Pengumuman = await this.upsertLangkah(tx, {
      detailSopId: disdikV2Id,
      kegiatan: 'Selesai: Mengumumkan hasil PPDB dan melakukan daftar ulang.',
      jenis: JenisLangkahProsedur.AWAL_AKHIR,
      urutan: 4,
      kelengkapan: 'Daftar siswa diterima',
      keluaran: 'Siswa baru terdaftar resmi',
      waktu: 1,
      satuanWaktu: SatuanWaktu.y, // y = tahun (siklus tahunan PPDB)
      keterangan: 'Proses PPDB berlangsung satu kali per tahun ajaran.',
      pelaksanaId: pel['TIM_PPDB_DISDIK'].pelaksanaId,
    });

    await tx.langkahSOP.update({
      where: { langkahSopId: lDdk2Start.langkahSopId },
      data: { langkahSelanjutnyaYaId: lDdk2Verifikasi.langkahSopId },
    });
    await tx.langkahSOP.update({
      where: { langkahSopId: lDdk2Verifikasi.langkahSopId },
      data: { langkahSelanjutnyaYaId: lDdk2Keputusan.langkahSopId },
    });
    await tx.langkahSOP.update({
      where: { langkahSopId: lDdk2Keputusan.langkahSopId },
      data: {
        langkahSelanjutnyaYaId: lDdk2Pengumuman.langkahSopId,    // diterima
        langkahSelanjutnyaTidakId: lDdk2Verifikasi.langkahSopId, // tidak diterima → kembali verifikasi
      },
    });

    // ── Swimlane: SOP Dinkes versi lain ───────────────────────────────
    await this.upsertSwimlane(tx, d['DINKES_001_V2'].detailSopId, pel['FRONT_OFFICE_DINKES'].pelaksanaId, 1);
    await this.upsertSwimlane(tx, d['DINKES_001_V2'].detailSopId, pel['KASUBAG_DINKES'].pelaksanaId, 2);
    await this.upsertSwimlane(tx, d['DISKOMINFO_002_V1'].detailSopId, pel['TIM_MEDIA_DISKOMINFO'].pelaksanaId, 1);
    await this.upsertSwimlane(tx, d['DISDIK_001_V1'].detailSopId, pel['TIM_PPDB_DISDIK'].pelaksanaId, 1);
  }

  private async upsertSwimlane(
    tx: Prisma.TransactionClient,
    detailSopId: string,
    pelaksanaId: string,
    urutan: number,
  ): Promise<void> {
    await tx.detailSOPPelaksana.upsert({
      where: { detailSopId_pelaksanaId: { detailSopId, pelaksanaId } },
      create: { detailSopId, pelaksanaId, urutan },
      update: { urutan },
    });
  }

  private async upsertLangkah(
    tx: Prisma.TransactionClient,
    data: {
      detailSopId: string;
      kegiatan: string;
      jenis: JenisLangkahProsedur;
      urutan: number;
      kelengkapan: string;
      keluaran: string;
      waktu: number;
      satuanWaktu: SatuanWaktu;
      keterangan: string;
      pelaksanaId: string;
    },
  ): Promise<{ langkahSopId: string }> {
    return tx.langkahSOP.upsert({
      where: { detailSopId_urutan: { detailSopId: data.detailSopId, urutan: data.urutan } },
      create: data,
      update: {
        kegiatan: data.kegiatan,
        jenis: data.jenis,
        kelengkapan: data.kelengkapan,
        keluaran: data.keluaran,
        waktu: data.waktu,
        satuanWaktu: data.satuanWaktu,
        keterangan: data.keterangan,
        pelaksanaId: data.pelaksanaId,
      },
      select: { langkahSopId: true },
    });
  }

  /** Lampiran 4 tipe untuk beberapa DetailSOP */
  private async seedLampiran(
    tx: Prisma.TransactionClient,
    params: { d: Record<string, { detailSopId: string }> },
  ): Promise<void> {
    const { d } = params;
    const targetIds = [
      d['DINKES_001_V1'].detailSopId,
      d['DINKES_001_V2'].detailSopId,
      d['DISKOMINFO_001_V1'].detailSopId,
      d['DISDIK_001_V2'].detailSopId,
    ];

    // Hapus dulu agar seed idempoten
    await tx.lampiranPeringatan.deleteMany({ where: { detailSopId: { in: targetIds } } });
    await tx.lampiranKualifikasiPelaksanaan.deleteMany({ where: { detailSopId: { in: targetIds } } });
    await tx.lampiranPeralatanPerlengkapan.deleteMany({ where: { detailSopId: { in: targetIds } } });
    await tx.lampiranPencatatanPendataan.deleteMany({ where: { detailSopId: { in: targetIds } } });

    await tx.lampiranPeringatan.createMany({
      data: [
        { detailSopId: d['DINKES_001_V1'].detailSopId, teks: 'Pemohon wajib membawa dokumen asli saat verifikasi lapangan.' },
        { detailSopId: d['DINKES_001_V2'].detailSopId, teks: 'Surat keterangan hanya berlaku 30 hari sejak diterbitkan.' },
        { detailSopId: d['DISKOMINFO_001_V1'].detailSopId, teks: 'Informasi dikecualikan mengikuti ketentuan keterbukaan informasi publik.' },
        { detailSopId: d['DISDIK_001_V2'].detailSopId, teks: 'Berkas yang tidak lengkap dalam 3 hari dinyatakan gugur seleksi.' },
      ],
    });

    await tx.lampiranKualifikasiPelaksanaan.createMany({
      data: [
        { detailSopId: d['DINKES_001_V1'].detailSopId, teks: 'Petugas memiliki sertifikasi pelayanan kesehatan dasar.' },
        { detailSopId: d['DINKES_001_V1'].detailSopId, teks: 'Dokter memiliki SIP aktif dari Dinas Kesehatan.' },
        { detailSopId: d['DISKOMINFO_001_V1'].detailSopId, teks: 'Tim layanan memiliki sertifikasi pengelolaan informasi publik.' },
        { detailSopId: d['DISDIK_001_V2'].detailSopId, teks: 'Panitia PPDB telah mendapat pelatihan sistem PPDB Online.' },
        { detailSopId: d['DISDIK_001_V2'].detailSopId, teks: 'Petugas verifikasi memahami regulasi zonasi terkini.' },
      ],
    });

    await tx.lampiranPeralatanPerlengkapan.createMany({
      data: [
        { detailSopId: d['DINKES_001_V1'].detailSopId, teks: 'Komputer, printer, scanner, formulir pemeriksaan standar.' },
        { detailSopId: d['DINKES_001_V1'].detailSopId, teks: 'Alat pemeriksaan medis (tensi, termometer, stetoskop).' },
        { detailSopId: d['DISKOMINFO_001_V1'].detailSopId, teks: 'Dashboard ticketing, email layanan publik, arsip digital.' },
        { detailSopId: d['DISDIK_001_V2'].detailSopId, teks: 'Aplikasi PPDB Online, scanner berkas, komputer panitia.' },
      ],
    });

    await tx.lampiranPencatatanPendataan.createMany({
      data: [
        { detailSopId: d['DINKES_001_V1'].detailSopId, teks: 'Data dicatat di register layanan harian dan arsip bulanan Dinkes.' },
        { detailSopId: d['DISKOMINFO_001_V1'].detailSopId, teks: 'Seluruh permohonan dicatat di SIPD dan sistem informasi publik.' },
        { detailSopId: d['DISDIK_001_V2'].detailSopId, teks: 'Data pendaftar tersimpan di sistem PPDB Online provinsi.' },
        { detailSopId: d['DISDIK_001_V2'].detailSopId, teks: 'Laporan rekapitulasi dikirim ke Kemendikbud setiap semester.' },
      ],
    });
  }

  // ── MODUL 3: Kolaborasi ─────────────────────────────────────────────────

  /**
   * Komentar & LogEditSOP — mencakup:
   * - StatusKomentar.TERBUKA & SELESAI
   * - Semua BagianSOP: HEADER, LANGKAH, STATUS, KOMENTAR, EVALUASI
   */
  private async seedKolaborasi(
    tx: Prisma.TransactionClient,
    params: {
      d: Record<string, { detailSopId: string }>;
      evaluator1Id: string;
      evaluator2Id: string;
      penyusunDinkesId: string;
      pjPenyusunDinkesId: string;
      penyusunDiskominfoId: string;
    },
  ): Promise<void> {
    const { d, evaluator1Id, evaluator2Id, penyusunDinkesId, pjPenyusunDinkesId, penyusunDiskominfoId } = params;
    const targetIds = [
      d['DINKES_001_V1'].detailSopId,
      d['DINKES_001_V2'].detailSopId,
      d['DISKOMINFO_001_V1'].detailSopId,
    ];

    // Idempoten: hapus dulu
    await tx.komentar.deleteMany({ where: { detailSopId: { in: targetIds } } });
    await tx.logEditSOP.deleteMany({ where: { detailSopId: { in: targetIds } } });

    await tx.komentar.createMany({
      data: [
        // StatusKomentar.TERBUKA — belum ditindaklanjuti
        {
          detailSopId: d['DINKES_001_V1'].detailSopId,
          userId: evaluator1Id,
          isi: 'Tambahkan indikator SLA pada langkah keputusan agar evaluasi lebih terukur.',
          status: StatusKomentar.TERBUKA,
        },
        {
          detailSopId: d['DINKES_001_V2'].detailSopId,
          userId: evaluator1Id,
          isi: 'Versi revisi: perlu sinkronisasi waktu pemeriksaan dengan kapasitas klinik.',
          status: StatusKomentar.TERBUKA,
        },
        {
          detailSopId: d['DISKOMINFO_001_V1'].detailSopId,
          userId: evaluator2Id,
          isi: 'Tambahkan mekanisme banding apabila permohonan ditolak.',
          status: StatusKomentar.TERBUKA,
        },
        // StatusKomentar.SELESAI — sudah ditindaklanjuti
        {
          detailSopId: d['DINKES_001_V1'].detailSopId,
          userId: penyusunDinkesId,
          isi: 'Catatan evaluator sudah ditindaklanjuti pada versi revisi (V2).',
          status: StatusKomentar.SELESAI,
        },
        {
          detailSopId: d['DISKOMINFO_001_V1'].detailSopId,
          userId: penyusunDiskominfoId,
          isi: 'Mekanisme banding sudah ditambahkan pada langkah 5.',
          status: StatusKomentar.SELESAI,
        },
      ],
    });

    await tx.logEditSOP.createMany({
      data: [
        // BagianSOP.HEADER
        {
          detailSopId: d['DINKES_001_V1'].detailSopId,
          userId: penyusunDinkesId,
          bagian: BagianSOP.HEADER,
          keterangan: 'Memperbarui nama lembaga dan tanggal efektif pada header SOP.',
          meta: { fields: ['namaLembaga', 'tanggalEfektif'], count: 2 },
          closedAt: new Date('2024-06-15T08:00:00.000Z'),
        },
        // BagianSOP.LANGKAH
        {
          detailSopId: d['DINKES_001_V1'].detailSopId,
          userId: penyusunDinkesId,
          bagian: BagianSOP.LANGKAH,
          keterangan: 'Menambahkan langkah pemeriksaan medis oleh dokter (langkah 4).',
          meta: { fields: ['kegiatan', 'waktu', 'satuanWaktu'], count: 3 },
          closedAt: new Date('2024-06-20T09:00:00.000Z'),
        },
        // BagianSOP.STATUS
        {
          detailSopId: d['DINKES_001_V1'].detailSopId,
          userId: pjPenyusunDinkesId,
          bagian: BagianSOP.STATUS,
          keterangan: 'Status SOP diubah dari SIAP_DIEVALUASI menjadi BERLAKU setelah pengesahan.',
          meta: { fields: ['status'], count: 1 },
          closedAt: new Date('2024-07-01T10:00:00.000Z'),
        },
        // BagianSOP.KOMENTAR
        {
          detailSopId: d['DINKES_001_V1'].detailSopId,
          userId: evaluator1Id,
          bagian: BagianSOP.KOMENTAR,
          targetEntityId: null,
          keterangan: 'Menambahkan komentar terkait SLA pada langkah keputusan.',
          meta: { fields: ['isi'], count: 1 },
          closedAt: new Date('2026-03-01T09:30:00.000Z'),
        },
        // BagianSOP.EVALUASI
        {
          detailSopId: d['DINKES_001_V1'].detailSopId,
          userId: evaluator1Id,
          bagian: BagianSOP.EVALUASI,
          keterangan: 'Menambahkan catatan hasil evaluasi awal: dokumen lengkap.',
          meta: { fields: ['catatan', 'hasil'], count: 2 },
          closedAt: new Date('2026-03-01T10:00:00.000Z'),
        },
        // Log untuk Diskominfo
        {
          detailSopId: d['DISKOMINFO_001_V1'].detailSopId,
          userId: penyusunDiskominfoId,
          bagian: BagianSOP.LANGKAH,
          keterangan: 'Menambahkan langkah penolakan informasi (langkah 5) sesuai masukan evaluator.',
          meta: { fields: ['kegiatan', 'keterangan'], count: 2 },
          closedAt: new Date('2026-04-10T14:00:00.000Z'),
        },
        // Log dengan sesi terbuka (closedAt null) — simulasi pengeditan aktif
        {
          detailSopId: d['DINKES_001_V2'].detailSopId,
          userId: penyusunDinkesId,
          bagian: BagianSOP.HEADER,
          keterangan: null,
          meta: { fields: ['tanggalRevisi'], count: 1 },
          closedAt: null, // sesi masih terbuka
        },
      ],
    });
  }

  // ── MODUL 5: Evaluasi ──────────────────────────────────────────────────

  /**
   * PengajuanEvaluasi & NilaiEvaluasi — mencakup status alur:
   * SEDANG_DIEVALUASI, SELESAI_DIEVALUASI, DIVERIFIKASI_PJ_EVALUATOR,
   * DITANDATANGANI_PJ_PENYUSUN, SELESAI.
   */
  private async seedPengajuanDanNilaiEvaluasi(
    tx: Prisma.TransactionClient,
    params: {
      d: Record<string, { detailSopId: string }>;
      opdDinkesId: string;
      opdDiskominfoId: string;
      opdDisdikId: string;
      evaluator1Id: string;
      evaluator2Id: string;
      pjEvaluatorId: string;
      pjPenyusunDinkesId: string;
      pjPenyusunDiskominfoId: string;
      pjPenyusunDisdikId: string;
    },
  ): Promise<Record<string, { pengajuanEvaluasiId: string }>> {
    const { d } = params;
    const pe: Record<string, { pengajuanEvaluasiId: string }> = {};

    // 1. SEDANG_DIEVALUASI — mandiri, nilai belum diisi (null)
    pe['DINKES_MANDIRI'] = await this.findOrCreatePengajuan(tx, 'BA-DINKES-2026-002', {
      opdId: params.opdDinkesId,
      jenis: JenisPengajuanEvaluasi.MANDIRI,
      status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
      tanggalPermintaan: new Date('2026-04-15T00:00:00.000Z'),
      tanggalEvaluasi: new Date('2026-04-15T00:00:00.000Z'),
      nilaiOPD: null,
      diverifikasiOlehUserId: null,
      ditandatanganiOlehPjPenyusunUserId: null,
      tanggalTTDBaPjPenyusun: null,
      diselesaikanOlehId: null,
      tanggalDiselesaikan: null,
    });

    // 2. SEDANG_DIEVALUASI — evaluasi sedang berlangsung
    pe['DISKOMINFO_MANDIRI'] = await this.findOrCreatePengajuan(tx, 'BA-DISKOMINFO-2026-001', {
      opdId: params.opdDiskominfoId,
      jenis: JenisPengajuanEvaluasi.MANDIRI,
      status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
      tanggalPermintaan: new Date('2026-04-01T00:00:00.000Z'),
      tanggalEvaluasi: new Date('2026-04-04T00:00:00.000Z'),
      nilaiOPD: null,
      diverifikasiOlehUserId: null,
      ditandatanganiOlehPjPenyusunUserId: null,
      tanggalTTDBaPjPenyusun: null,
      diselesaikanOlehId: params.evaluator2Id,
      tanggalDiselesaikan: null,
    });

    // 3. SELESAI_DIEVALUASI — evaluasi selesai, menunggu verifikasi PJ Evaluator
    pe['DISDIK_TERJADWAL'] = await this.findOrCreatePengajuan(tx, 'BA-DISDIK-2026-001', {
      opdId: params.opdDisdikId,
      jenis: JenisPengajuanEvaluasi.TERJADWAL,
      status: StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
      tanggalPermintaan: new Date('2026-01-10T00:00:00.000Z'),
      tanggalEvaluasi: new Date('2026-01-15T00:00:00.000Z'),
      nilaiOPD: 78,
      diverifikasiOlehUserId: null,
      ditandatanganiOlehPjPenyusunUserId: null,
      tanggalTTDBaPjPenyusun: null,
      diselesaikanOlehId: params.evaluator2Id,
      tanggalDiselesaikan: new Date('2026-01-20T00:00:00.000Z'),
    });

    // 4. DIVERIFIKASI_PJ_EVALUATOR — telah diverifikasi, menunggu tanda tangan PJ Penyusun
    pe['DISKOMINFO_TERJADWAL'] = await this.findOrCreatePengajuan(tx, 'BA-DISKOMINFO-2026-002', {
      opdId: params.opdDiskominfoId,
      jenis: JenisPengajuanEvaluasi.TERJADWAL,
      status: StatusPengajuanEvaluasi.DIVERIFIKASI_PJ_EVALUATOR,
      tanggalPermintaan: new Date('2026-02-01T00:00:00.000Z'),
      tanggalEvaluasi: new Date('2026-02-05T00:00:00.000Z'),
      nilaiOPD: 82,
      diverifikasiOlehUserId: params.pjEvaluatorId,
      ditandatanganiOlehPjPenyusunUserId: null,
      tanggalTTDBaPjPenyusun: null,
      diselesaikanOlehId: params.evaluator1Id,
      tanggalDiselesaikan: new Date('2026-02-10T00:00:00.000Z'),
    });

    // 5. DITANDATANGANI_PJ_PENYUSUN — PJ Penyusun sudah tanda tangan BA
    pe['DINKES_TERJADWAL'] = await this.findOrCreatePengajuan(tx, 'BA-DINKES-2026-001', {
      opdId: params.opdDinkesId,
      jenis: JenisPengajuanEvaluasi.TERJADWAL,
      status: StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN,
      tanggalPermintaan: new Date('2026-03-01T00:00:00.000Z'),
      tanggalEvaluasi: new Date('2026-03-05T00:00:00.000Z'),
      nilaiOPD: 87,
      diverifikasiOlehUserId: params.pjEvaluatorId,
      ditandatanganiOlehPjPenyusunUserId: params.pjPenyusunDinkesId,
      tanggalTTDBaPjPenyusun: new Date('2026-03-10T00:00:00.000Z'),
      diselesaikanOlehId: params.evaluator1Id,
      tanggalDiselesaikan: new Date('2026-03-08T00:00:00.000Z'),
    });

    // 6. SELESAI — seluruh alur selesai, SOP mendapat status BERLAKU
    pe['DISDIK_MANDIRI'] = await this.findOrCreatePengajuan(tx, 'BA-DISDIK-2026-002', {
      opdId: params.opdDisdikId,
      jenis: JenisPengajuanEvaluasi.MANDIRI,
      status: StatusPengajuanEvaluasi.SELESAI,
      tanggalPermintaan: new Date('2023-10-01T00:00:00.000Z'),
      tanggalEvaluasi: new Date('2023-10-15T00:00:00.000Z'),
      nilaiOPD: 91,
      diverifikasiOlehUserId: params.pjEvaluatorId,
      ditandatanganiOlehPjPenyusunUserId: params.pjPenyusunDisdikId,
      tanggalTTDBaPjPenyusun: new Date('2023-10-25T00:00:00.000Z'),
      diselesaikanOlehId: params.evaluator1Id,
      tanggalDiselesaikan: new Date('2023-10-22T00:00:00.000Z'),
    });

    // ── NilaiEvaluasi (mencakup null, SESUAI, PERLU_PERBAIKAN) ─────────────

    // Pengajuan SEDANG_DIEVALUASI (Dinkes mandiri): nilai belum ada (null)
    await this.upsertNilai(tx, {
      pengajuanEvaluasiId: pe['DINKES_MANDIRI'].pengajuanEvaluasiId,
      detailSopId: d['DINKES_005_V1'].detailSopId,
      hasil: null,
      catatan: null,
      dinilaiOlehId: null,
    });

    // Pengajuan SEDANG_DIEVALUASI: sebagian terisi
    await this.upsertNilai(tx, {
      pengajuanEvaluasiId: pe['DISKOMINFO_MANDIRI'].pengajuanEvaluasiId,
      detailSopId: d['DISKOMINFO_001_V1'].detailSopId,
      hasil: null,
      catatan: null,
      dinilaiOlehId: null,
    });

    // Pengajuan SELESAI_DIEVALUASI: semua terisi
    await this.upsertNilai(tx, {
      pengajuanEvaluasiId: pe['DISDIK_TERJADWAL'].pengajuanEvaluasiId,
      detailSopId: d['DISDIK_001_V1'].detailSopId,
      hasil: HasilEvaluasi.SESUAI,
      catatan: 'Dokumen PPDB versi lama lengkap dan sesuai regulasi saat itu.',
      dinilaiOlehId: params.evaluator2Id,
    });

    // Pengajuan DIVERIFIKASI_PJ_EVALUATOR
    await this.upsertNilai(tx, {
      pengajuanEvaluasiId: pe['DISKOMINFO_TERJADWAL'].pengajuanEvaluasiId,
      detailSopId: d['DISKOMINFO_002_V1'].detailSopId,
      hasil: HasilEvaluasi.SESUAI,
      catatan: 'SOP Pengelolaan Media Sosial sesuai panduan KPI Humas Pemerintah.',
      dinilaiOlehId: params.evaluator1Id,
    });

    // Pengajuan DITANDATANGANI (Dinkes V1 SESUAI, V2 PERLU_PERBAIKAN)
    await this.upsertNilai(tx, {
      pengajuanEvaluasiId: pe['DINKES_TERJADWAL'].pengajuanEvaluasiId,
      detailSopId: d['DINKES_001_V1'].detailSopId,
      hasil: HasilEvaluasi.SESUAI,
      catatan: 'Dokumen lengkap dan implementasi konsisten di lapangan.',
      dinilaiOlehId: params.evaluator1Id,
    });
    await this.upsertNilai(tx, {
      pengajuanEvaluasiId: pe['DINKES_TERJADWAL'].pengajuanEvaluasiId,
      detailSopId: d['DINKES_001_V2'].detailSopId,
      hasil: HasilEvaluasi.PERLU_PERBAIKAN,
      catatan: 'Perlu perjelas SLA pada langkah keputusan dan kapasitas dokter.',
      dinilaiOlehId: params.evaluator1Id,
    });

    // Pengajuan SELESAI (Disdik V2 SESUAI — SOP mendapat status BERLAKU)
    await this.upsertNilai(tx, {
      pengajuanEvaluasiId: pe['DISDIK_MANDIRI'].pengajuanEvaluasiId,
      detailSopId: d['DISDIK_001_V2'].detailSopId,
      hasil: HasilEvaluasi.SESUAI,
      catatan: 'SOP PPDB versi baru sesuai regulasi zonasi terkini. Layak berlaku.',
      dinilaiOlehId: params.evaluator1Id,
    });

    return pe;
  }

  private async upsertNilai(
    tx: Prisma.TransactionClient,
    data: {
      pengajuanEvaluasiId: string;
      detailSopId: string;
      hasil: HasilEvaluasi | null;
      catatan: string | null;
      dinilaiOlehId: string | null;
    },
  ): Promise<void> {
    await tx.nilaiEvaluasi.upsert({
      where: {
        pengajuanEvaluasiId_detailSopId: {
          pengajuanEvaluasiId: data.pengajuanEvaluasiId,
          detailSopId: data.detailSopId,
        },
      },
      create: data,
      update: { hasil: data.hasil, catatan: data.catatan, dinilaiOlehId: data.dinilaiOlehId },
    });
  }

  private async findOrCreatePengajuan(
    tx: Prisma.TransactionClient,
    nomorBA: string,
    data: Omit<Prisma.PengajuanEvaluasiUncheckedCreateInput, 'nomorBA'>,
  ): Promise<{ pengajuanEvaluasiId: string }> {
    const existing = await tx.pengajuanEvaluasi.findFirst({
      where: { nomorBA },
      select: { pengajuanEvaluasiId: true },
    });
    if (existing !== null) {
      return tx.pengajuanEvaluasi.update({
        where: { pengajuanEvaluasiId: existing.pengajuanEvaluasiId },
        data,
        select: { pengajuanEvaluasiId: true },
      });
    }
    return tx.pengajuanEvaluasi.create({
      data: { nomorBA, ...data },
      select: { pengajuanEvaluasiId: true },
    });
  }

  private async seedLogNilaiEvaluasi(
    tx: Prisma.TransactionClient,
    params: {
      d: Record<string, { detailSopId: string }>;
      pe: Record<string, { pengajuanEvaluasiId: string }>;
      evaluator1Id: string;
      evaluator2Id: string;
    },
  ): Promise<void> {
    const { d, pe, evaluator1Id, evaluator2Id } = params;

    await tx.logNilaiEvaluasi.deleteMany({
      where: {
        pengajuanEvaluasiId: {
          in: Object.values(pe).map((p) => p.pengajuanEvaluasiId),
        },
      },
    });

    await tx.logNilaiEvaluasi.createMany({
      data: [
        // Dinkes Terjadwal: V1 — null → SESUAI
        {
          pengajuanEvaluasiId: pe['DINKES_TERJADWAL'].pengajuanEvaluasiId,
          detailSopId: d['DINKES_001_V1'].detailSopId,
          evaluatorId: evaluator1Id,
          hasilSebelum: null,
          hasilSesudah: HasilEvaluasi.SESUAI,
          catatanSebelum: null,
          catatanSesudah: 'Dokumen lengkap dan implementasi konsisten di lapangan.',
        },
        // Dinkes Terjadwal: V2 — null → PERLU_PERBAIKAN
        {
          pengajuanEvaluasiId: pe['DINKES_TERJADWAL'].pengajuanEvaluasiId,
          detailSopId: d['DINKES_001_V2'].detailSopId,
          evaluatorId: evaluator1Id,
          hasilSebelum: null,
          hasilSesudah: HasilEvaluasi.PERLU_PERBAIKAN,
          catatanSebelum: null,
          catatanSesudah: 'Perlu perjelas SLA pada langkah keputusan dan kapasitas dokter.',
        },
        // Dinkes Terjadwal: V2 — koreksi dari PERLU_PERBAIKAN tetap PERLU_PERBAIKAN (dengan catatan diperbarui)
        {
          pengajuanEvaluasiId: pe['DINKES_TERJADWAL'].pengajuanEvaluasiId,
          detailSopId: d['DINKES_001_V2'].detailSopId,
          evaluatorId: evaluator1Id,
          hasilSebelum: HasilEvaluasi.PERLU_PERBAIKAN,
          hasilSesudah: HasilEvaluasi.PERLU_PERBAIKAN,
          catatanSebelum: 'Perlu perjelas SLA pada langkah keputusan dan kapasitas dokter.',
          catatanSesudah: 'SLA perlu diperjelas; kapasitas dokter dan jadwal pemeriksaan harus dicantumkan.',
        },
        // Diskominfo Mandiri: belum dinilai (null → null, log awal penugasan)
        {
          pengajuanEvaluasiId: pe['DISKOMINFO_MANDIRI'].pengajuanEvaluasiId,
          detailSopId: d['DISKOMINFO_001_V1'].detailSopId,
          evaluatorId: evaluator2Id,
          hasilSebelum: null,
          hasilSesudah: null,
          catatanSebelum: null,
          catatanSesudah: null,
        },
        // Disdik Terjadwal: V1 SESUAI
        {
          pengajuanEvaluasiId: pe['DISDIK_TERJADWAL'].pengajuanEvaluasiId,
          detailSopId: d['DISDIK_001_V1'].detailSopId,
          evaluatorId: evaluator2Id,
          hasilSebelum: null,
          hasilSesudah: HasilEvaluasi.SESUAI,
          catatanSebelum: null,
          catatanSesudah: 'Dokumen PPDB versi lama lengkap dan sesuai regulasi saat itu.',
        },
        // Diskominfo Terjadwal: V2 SESUAI
        {
          pengajuanEvaluasiId: pe['DISKOMINFO_TERJADWAL'].pengajuanEvaluasiId,
          detailSopId: d['DISKOMINFO_002_V1'].detailSopId,
          evaluatorId: evaluator1Id,
          hasilSebelum: null,
          hasilSesudah: HasilEvaluasi.SESUAI,
          catatanSebelum: null,
          catatanSesudah: 'SOP Pengelolaan Media Sosial sesuai panduan KPI Humas Pemerintah.',
        },
        // Disdik Mandiri: V2 SESUAI
        {
          pengajuanEvaluasiId: pe['DISDIK_MANDIRI'].pengajuanEvaluasiId,
          detailSopId: d['DISDIK_001_V2'].detailSopId,
          evaluatorId: evaluator1Id,
          hasilSebelum: null,
          hasilSesudah: HasilEvaluasi.SESUAI,
          catatanSebelum: null,
          catatanSesudah: 'SOP PPDB versi baru sesuai regulasi zonasi terkini. Layak berlaku.',
        },
      ],
    });
  }

  // ── MODUL 6: TTE ───────────────────────────────────────────────────────

  /**
   * DokumenTte seed: jenis SOP_BERLAKU dan BERITA_ACARA_EVALUASI saja.
   * Invariant: tepat satu parent — `detailSopId` XOR `pengajuanEvaluasiId` (CHECK `chk_dokumentte_satu_orang_tua`);
   * pada `update` eksplisit nullkan FK lawan agar re-seed idempoten setelah data kotor.
   */
  private async seedDokumenTte(
    tx: Prisma.TransactionClient,
    params: {
      d: Record<string, { detailSopId: string }>;
      pe: Record<string, { pengajuanEvaluasiId: string }>;
    },
  ): Promise<Record<string, { dokumenTteId: string }>> {
    const { d, pe } = params;
    const dok: Record<string, { dokumenTteId: string }> = {};

    // JenisDokumenTte.SOP_BERLAKU — dokumen SOP Dinkes yang sudah berlaku
    dok['SOP_BERLAKU_DINKES'] = await tx.dokumenTte.upsert({
      where: { detailSopId: d['DINKES_001_V1'].detailSopId },
      create: {
        nomorDokumen: 'DOC-SOP-DINKES-2024-001',
        jenisDokumen: JenisDokumenTte.SOP_BERLAKU,
        judulDokumen: 'SOP Berlaku Pelayanan Surat Keterangan Sehat',
        hashDokumen: 'sha256-sop-dinkes-berlaku-v1-2024',
        versiDokumen: 1,
        metodeKanonikalisasi: 'PDF-C14N',
        detailSopId: d['DINKES_001_V1'].detailSopId,
      },
      update: {
        hashDokumen: 'sha256-sop-dinkes-berlaku-v1-2024',
        jenisDokumen: JenisDokumenTte.SOP_BERLAKU,
        judulDokumen: 'SOP Berlaku Pelayanan Surat Keterangan Sehat',
        pengajuanEvaluasiId: null,
      },
      select: { dokumenTteId: true },
    });

    // JenisDokumenTte.BERITA_ACARA_EVALUASI — BA evaluasi Dinkes terjadwal
    dok['BA_EVALUASI_DINKES'] = await tx.dokumenTte.upsert({
      where: { pengajuanEvaluasiId: pe['DINKES_TERJADWAL'].pengajuanEvaluasiId },
      create: {
        nomorDokumen: 'DOC-BA-DINKES-2026-001',
        jenisDokumen: JenisDokumenTte.BERITA_ACARA_EVALUASI,
        judulDokumen: 'Berita Acara Evaluasi SOP Dinkes Terjadwal 2026',
        hashDokumen: 'sha256-ba-dinkes-terjadwal-2026-001',
        versiDokumen: 1,
        metodeKanonikalisasi: 'PDF-C14N',
        pengajuanEvaluasiId: pe['DINKES_TERJADWAL'].pengajuanEvaluasiId,
      },
      update: {
        hashDokumen: 'sha256-ba-dinkes-terjadwal-2026-001',
        jenisDokumen: JenisDokumenTte.BERITA_ACARA_EVALUASI,
        judulDokumen: 'Berita Acara Evaluasi SOP Dinkes Terjadwal 2026',
        detailSopId: null,
      },
      select: { dokumenTteId: true },
    });

    // JenisDokumenTte.SOP_BERLAKU — dokumen SOP Disdik V2 yang sudah berlaku
    dok['SOP_BERLAKU_DISDIK'] = await tx.dokumenTte.upsert({
      where: { detailSopId: d['DISDIK_001_V2'].detailSopId },
      create: {
        nomorDokumen: 'DOC-SOP-DISDIK-2024-001',
        jenisDokumen: JenisDokumenTte.SOP_BERLAKU,
        judulDokumen: 'SOP Berlaku PPDB Dinas Pendidikan Provinsi',
        hashDokumen: 'sha256-sop-disdik-ppdb-berlaku-v2-2024',
        versiDokumen: 2,
        metodeKanonikalisasi: 'PDF-C14N',
        detailSopId: d['DISDIK_001_V2'].detailSopId,
      },
      update: {
        hashDokumen: 'sha256-sop-disdik-ppdb-berlaku-v2-2024',
        jenisDokumen: JenisDokumenTte.SOP_BERLAKU,
        judulDokumen: 'SOP Berlaku PPDB Dinas Pendidikan Provinsi',
        pengajuanEvaluasiId: null,
      },
      select: { dokumenTteId: true },
    });

    // JenisDokumenTte.BERITA_ACARA_EVALUASI — BA evaluasi Disdik selesai
    dok['BA_EVALUASI_DISDIK'] = await tx.dokumenTte.upsert({
      where: { pengajuanEvaluasiId: pe['DISDIK_MANDIRI'].pengajuanEvaluasiId },
      create: {
        nomorDokumen: 'DOC-BA-DISDIK-2023-001',
        jenisDokumen: JenisDokumenTte.BERITA_ACARA_EVALUASI,
        judulDokumen: 'Berita Acara Evaluasi SOP PPDB Disdik 2023',
        hashDokumen: 'sha256-ba-disdik-mandiri-2023-001',
        versiDokumen: 1,
        metodeKanonikalisasi: 'PDF-C14N',
        pengajuanEvaluasiId: pe['DISDIK_MANDIRI'].pengajuanEvaluasiId,
      },
      update: {
        hashDokumen: 'sha256-ba-disdik-mandiri-2023-001',
        jenisDokumen: JenisDokumenTte.BERITA_ACARA_EVALUASI,
        judulDokumen: 'Berita Acara Evaluasi SOP PPDB Disdik 2023',
        detailSopId: null,
      },
      select: { dokumenTteId: true },
    });

    return dok;
  }

  /**
   * PIN TTE (`Pengguna.ttePinHash`) & RiwayatTandaTangan:
   * - Beberapa pengguna seed memiliki PIN; PJ Penyusun Disdik sama (siap tanda tangan).
   * - RiwayatTandaTangan mencakup peran PJ_PENYUSUN & KEPALA_OPD pada berbagai dokumen
   * Hanya mengubah kolom PIN — tidak mengubah `peran` (selaras `trg_pengguna_peran_slot_konsisten_update`).
   */
  private async seedKredensialDanRiwayatTtd(
    tx: Prisma.TransactionClient,
    params: {
      u: Record<string, SeedUserRecord>;
      dok: Record<string, { dokumenTteId: string }>;
      pjPenyusunDinkesId: string;
      kepalaDinkesId: string;
      pjPenyusunDiskominfoId: string;
      kepalaDiskominfoId: string;
      pjPenyusunDisdikId: string;
      kepalaDisdikId: string;
      pjEvaluatorId: string;
    },
  ): Promise<void> {
    const { dok } = params;
    const tteSekarang = new Date('2026-01-15T10:00:00.000Z');

    const pinUsers: Array<{ userId: string; hashPin: string }> = [
      { userId: params.pjPenyusunDinkesId, hashPin: 'bcrypt-hash-pin-pj-penyusun-dinkes' },
      { userId: params.kepalaDinkesId, hashPin: 'bcrypt-hash-pin-kepala-dinkes' },
      { userId: params.pjPenyusunDiskominfoId, hashPin: 'bcrypt-hash-pin-pj-penyusun-diskominfo' },
      { userId: params.kepalaDiskominfoId, hashPin: 'bcrypt-hash-pin-kepala-diskominfo' },
      { userId: params.pjEvaluatorId, hashPin: 'bcrypt-hash-pin-pj-evaluator' },
      { userId: params.kepalaDisdikId, hashPin: 'bcrypt-hash-pin-kepala-disdik' },
      { userId: params.pjPenyusunDisdikId, hashPin: 'bcrypt-hash-pin-pj-penyusun-disdik' },
    ];
    for (const u of pinUsers) {
      await tx.pengguna.update({
        where: { penggunaId: u.userId },
        data: { ttePinHash: u.hashPin, ttePinSetAt: tteSekarang },
      });
    }

    // ── RiwayatTandaTangan ─────────────────────────────────────────────

    const ttdEntries: Array<{
      userId: string;
      dokumenTteId: string;
      peran: PeranPengguna;
      signatureValue: string;
      keyId: string;
      certSerialNumber: string;
      certSubject: string;
      ditandatanganiPada: Date;
    }> = [
      // SOP Berlaku Dinkes: ditanda tangani PJ Penyusun
      {
        userId: params.pjPenyusunDinkesId,
        dokumenTteId: dok['SOP_BERLAKU_DINKES'].dokumenTteId,
        peran: PeranPengguna.PJ_PENYUSUN,
        signatureValue: 'sig-pj-penyusun-dinkes-sop-berlaku-2024',
        keyId: 'key-pj-penyusun-dinkes',
        certSerialNumber: 'SERIAL-PJP-DINKES-001',
        certSubject: 'PJ Penyusun Dinas Kesehatan Provinsi',
        ditandatanganiPada: new Date('2024-07-01T10:00:00.000Z'),
      },
      // BA Evaluasi Dinkes: ditanda tangani Kepala OPD
      {
        userId: params.kepalaDinkesId,
        dokumenTteId: dok['BA_EVALUASI_DINKES'].dokumenTteId,
        peran: PeranPengguna.KEPALA_OPD,
        signatureValue: 'sig-kepala-dinkes-ba-evaluasi-2026',
        keyId: 'key-kepala-dinkes',
        certSerialNumber: 'SERIAL-KEPALA-DINKES-001',
        certSubject: 'Kepala Dinas Kesehatan Provinsi',
        ditandatanganiPada: new Date('2026-03-10T09:00:00.000Z'),
      },
      // SOP Berlaku Disdik: ditanda tangani Kepala OPD
      {
        userId: params.kepalaDisdikId,
        dokumenTteId: dok['SOP_BERLAKU_DISDIK'].dokumenTteId,
        peran: PeranPengguna.KEPALA_OPD,
        signatureValue: 'sig-kepala-disdik-sop-berlaku-2024',
        keyId: 'key-kepala-disdik',
        certSerialNumber: 'SERIAL-KEPALA-DISDIK-001',
        certSubject: 'Kepala Dinas Pendidikan Provinsi',
        ditandatanganiPada: new Date('2024-06-01T11:00:00.000Z'),
      },
      // BA Evaluasi Disdik: ditanda tangani PJ Evaluator
      {
        userId: params.pjEvaluatorId,
        dokumenTteId: dok['BA_EVALUASI_DISDIK'].dokumenTteId,
        peran: PeranPengguna.PJ_EVALUATOR,
        signatureValue: 'sig-pj-evaluator-ba-disdik-2023',
        keyId: 'key-pj-evaluator',
        certSerialNumber: 'SERIAL-PJE-001',
        certSubject: 'PJ Evaluator Biro Organisasi',
        ditandatanganiPada: new Date('2023-10-25T14:00:00.000Z'),
      },
    ];

    for (const ttd of ttdEntries) {
      await tx.riwayatTandaTangan.upsert({
        where: { dokumenTteId_peran: { dokumenTteId: ttd.dokumenTteId, peran: ttd.peran } },
        create: {
          userId: ttd.userId,
          dokumenTteId: ttd.dokumenTteId,
          peran: ttd.peran,
          signatureValue: ttd.signatureValue,
          signatureAlgorithm: 'RSA-SHA256',
          signatureFormat: 'CMS',
          keyId: ttd.keyId,
          certSerialNumber: ttd.certSerialNumber,
          certIssuer: 'Balai Sertifikasi Elektronik (BSrE) BSSN',
          certSubject: ttd.certSubject,
          certFingerprint: `fp-${ttd.certSerialNumber.toLowerCase()}`,
          certValidFrom: new Date('2024-01-01T00:00:00.000Z'),
          certValidTo: new Date('2027-01-01T00:00:00.000Z'),
          ditandatanganiPada: ttd.ditandatanganiPada,
        },
        update: {
          userId: ttd.userId,
          signatureValue: ttd.signatureValue,
          signatureAlgorithm: 'RSA-SHA256',
          signatureFormat: 'CMS',
        },
      });
    }
  }
}
