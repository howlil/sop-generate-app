import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import type { Prisma } from '../../generated/prisma';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PeranPengguna } from '../../generated/prisma';

/** Salt rounds konsisten dengan pola hashing aplikasi (bcrypt default). */
const BCRYPT_SALT_ROUNDS = 10;

/** Kunci bisnis seed (bukan UUID) — dipakai untuk mencari baris yang sudah ada. */
const SEED_OPD_BIRO_NAMA = 'Biro Organisasi Sekretariat Daerah';
const SEED_OPD_CONTOH_NAMA = 'OPD Contoh (seed)';
const SEED_PERATURAN_NOMOR = '12 Tahun 2024';
const SEED_PERATURAN_TAHUN = 2024;
const SEED_PJ_EVALUATOR_EMAIL = 'pj.evaluator@gmail.com';

/**
 * Mengisi data master (OPD, peraturan, relasi) dan satu pengguna PJ_EVALUATOR untuk pengembangan.
 * Operasi idempotent: aman dijalankan ulang.
 */
@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Menjalankan seluruh langkah seed dalam satu transaksi.
   */
  async run(): Promise<void> {
    const plainPassword: string = this.config.get<string>(
      'SEED_PJ_EVALUATOR_PASSWORD',
      'DevPjEvaluator123!',
    );
    const hashedPassword: string = await bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);
    await this.prisma.$transaction(async (tx) => {
      const opdBiro = await this.ensureOpdMaster(tx, {
        nama: SEED_OPD_BIRO_NAMA,
        isBiroOrganisasi: true,
      });
      const opdContoh = await this.ensureOpdMaster(tx, {
        nama: SEED_OPD_CONTOH_NAMA,
        isBiroOrganisasi: false,
      });
      const peraturan = await tx.peraturan.upsert({
        where: {
          nomor_tahun: {
            nomor: SEED_PERATURAN_NOMOR,
            tahun: SEED_PERATURAN_TAHUN,
          },
        },
        create: {
          nama: 'Peraturan Daerah Contoh',
          nomor: SEED_PERATURAN_NOMOR,
          tahun: SEED_PERATURAN_TAHUN,
          tentang: 'Tata kelola penyusunan dan evaluasi standar operasional prosedur (seed).',
        },
        update: {
          nama: 'Peraturan Daerah Contoh',
          tentang: 'Tata kelola penyusunan dan evaluasi standar operasional prosedur (seed).',
        },
      });
      await tx.oPDPeraturan.upsert({
        where: {
          opdId_peraturanId: {
            opdId: opdBiro.opdId,
            peraturanId: peraturan.peraturanId,
          },
        },
        create: {
          opdId: opdBiro.opdId,
          peraturanId: peraturan.peraturanId,
        },
        update: {},
      });
      await tx.oPDPeraturan.upsert({
        where: {
          opdId_peraturanId: {
            opdId: opdContoh.opdId,
            peraturanId: peraturan.peraturanId,
          },
        },
        create: {
          opdId: opdContoh.opdId,
          peraturanId: peraturan.peraturanId,
        },
        update: {},
      });
      await tx.pengguna.upsert({
        where: { email: SEED_PJ_EVALUATOR_EMAIL },
        create: {
          email: SEED_PJ_EVALUATOR_EMAIL,
          opdId: opdBiro.opdId,
          nama: 'PJ Evaluator (seed)',
          kataSandi: hashedPassword,
          peran: PeranPengguna.PJ_EVALUATOR,
          nip: '198501012009011001',
          jabatan: 'Kepala Bidang Evaluasi',
          pangkat: 'Pembina',
          nohp: '081234567890',
        },
        update: {
          nama: 'PJ Evaluator (seed)',
          opdId: opdBiro.opdId,
          kataSandi: hashedPassword,
          peran: PeranPengguna.PJ_EVALUATOR,
          nip: '198501012009011001',
          jabatan: 'Kepala Bidang Evaluasi',
          pangkat: 'Pembina',
          nohp: '081234567890',
          deletedAt: null,
        },
      });
    });
    this.logger.log(
      `Seed selesai: OPD biro+contoh, Peraturan, OPDPeraturan, Pengguna PJ_EVALUATOR (${SEED_PJ_EVALUATOR_EMAIL}). Singleton PJ dijamin oleh trigger pada kolom peran.`,
    );
    this.logger.warn(
      'Atur SEED_PJ_EVALUATOR_PASSWORD di .env; jika tidak diisi, nilai default khusus pengembangan dipakai (jangan untuk produksi).',
    );
  }

  /**
   * Find-or-create OPD master berdasarkan nama, sekaligus menyelaraskan flag isBiroOrganisasi.
   * Trigger DB akan menolak bila ada lebih dari satu OPD dengan isBiroOrganisasi = TRUE.
   */
  private async ensureOpdMaster(
    tx: Prisma.TransactionClient,
    params: { nama: string; isBiroOrganisasi: boolean },
  ): Promise<{ opdId: string; isBiroOrganisasi: boolean }> {
    const { nama, isBiroOrganisasi } = params;
    const existing = await tx.oPD.findFirst({ where: { nama } });
    if (existing !== null) {
      if (existing.isBiroOrganisasi === isBiroOrganisasi) {
        return existing;
      }
      return tx.oPD.update({
        where: { opdId: existing.opdId },
        data: { isBiroOrganisasi },
      });
    }
    return tx.oPD.create({
      data: { nama, isBiroOrganisasi },
    });
  }
}
