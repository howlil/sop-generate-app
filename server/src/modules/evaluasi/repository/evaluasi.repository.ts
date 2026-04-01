import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  JenisPengajuanEvaluasi,
  StatusPengajuanEvaluasi,
  HasilEvaluasi,
  StatusSOP,
} from '../../../generated/prisma';
import {
  CreatePengajuanEvaluasiDto,
  IsiNilaiEvaluasiDto,
} from '../dto/evaluasi.dto';

// Active = any status before SELESAI
const ACTIVE_STATUSES: StatusPengajuanEvaluasi[] = [
  StatusPengajuanEvaluasi.MENUNGGU_EVALUASI,
  StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
  StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
  StatusPengajuanEvaluasi.DIVERIFIKASI_BIRO,
  StatusPengajuanEvaluasi.DITANDATANGANI_KOORDINATOR,
];

const DONE_STATUSES: StatusPengajuanEvaluasi[] = [
  StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
  StatusPengajuanEvaluasi.DIVERIFIKASI_BIRO,
  StatusPengajuanEvaluasi.DITANDATANGANI_KOORDINATOR,
  StatusPengajuanEvaluasi.SELESAI,
];

const INCLUDE = {
  opd: { select: { id: true, nama: true } },
  nilaiEvaluasi: {
    include: {
      sopDetail: {
        include: { sop: { select: { nomor: true, judul: true } } },
      },
      dinilaiOleh: { select: { id: true, nama: true } },
    },
  },
  diselesaikanOleh: { select: { id: true, nama: true } },
};

@Injectable()
export class EvaluasiRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: {
    opdId?: string;
    status?: StatusPengajuanEvaluasi;
    jenis?: JenisPengajuanEvaluasi;
  }) {
    return this.prisma.pengajuanEvaluasi.findMany({
      where: {
        ...(filter.opdId && { opdId: filter.opdId }),
        ...(filter.status && { status: filter.status }),
        ...(filter.jenis && { jenis: filter.jenis }),
      },
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.pengajuanEvaluasi.findUnique({
      where: { id },
      include: INCLUDE,
    });
  }

  // EVL-02: check for existing active evaluation per OPD per jenis
  async findActiveByOpdAndJenis(opdId: string, jenis: JenisPengajuanEvaluasi) {
    return this.prisma.pengajuanEvaluasi.findFirst({
      where: { opdId, jenis, status: { in: ACTIVE_STATUSES } },
      select: { id: true },
    });
  }

  // Validate EVL-13 scope before creating
  async findSopDetails(sopDetailIds: string[]) {
    return this.prisma.detailSOP.findMany({
      where: { id: { in: sopDetailIds } },
      select: { id: true, status: true, sop: { select: { opdId: true } } },
    });
  }

  // EVL-01 + EVL-03: create pengajuan + update DetailSOP statuses atomically
  async create(dto: CreatePengajuanEvaluasiDto) {
    return this.prisma.$transaction(async (tx) => {
      const pengajuan = await tx.pengajuanEvaluasi.create({
        data: {
          opdId: dto.opdId,
          jenis: dto.jenis,
          catatan: dto.catatan ?? null,
          nomorBA: dto.nomorBA ?? null,
          tanggalPermintaan: dto.tanggalPermintaan
            ? new Date(dto.tanggalPermintaan)
            : null,
          tanggalEvaluasi: dto.tanggalEvaluasi
            ? new Date(dto.tanggalEvaluasi)
            : null,
          status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
          nilaiEvaluasi: {
            create: dto.sopDetailIds.map((sopDetailId) => ({ sopDetailId })),
          },
        },
        include: INCLUDE,
      });

      // EVL-03: transition all included DetailSOPs to SEDANG_DIEVALUASI
      await tx.detailSOP.updateMany({
        where: { id: { in: dto.sopDetailIds } },
        data: { status: StatusSOP.SEDANG_DIEVALUASI },
      });

      return pengajuan;
    });
  }

  // EVL-05 + EVL-10 (optimistic lock) + EVL-11 (audit log)
  async isiNilai(
    pengajuanId: string,
    sopDetailId: string,
    dto: IsiNilaiEvaluasiDto,
    evaluatorId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Load current state for audit log
      const current = await tx.nilaiEvaluasi.findUnique({
        where: {
          pengajuanEvaluasiId_sopDetailId: {
            pengajuanEvaluasiId: pengajuanId,
            sopDetailId,
          },
        },
      });
      if (!current) throw new NotFoundException('NilaiEvaluasi tidak ditemukan');

      // EVL-10: optimistic locking — only update if version matches
      const updated = await tx.nilaiEvaluasi.updateMany({
        where: {
          pengajuanEvaluasiId: pengajuanId,
          sopDetailId,
          version: dto.version,
        },
        data: {
          hasil: dto.hasil,
          catatan: dto.catatan ?? null,
          dinilaiOlehId: evaluatorId,
          version: { increment: 1 },
        },
      });

      if (updated.count === 0) {
        throw new ConflictException(
          'Konflik versi — data telah diubah orang lain, silakan refresh',
        );
      }

      // EVL-11: immutable audit log
      await tx.logNilaiEvaluasi.create({
        data: {
          pengajuanEvaluasiId: pengajuanId,
          sopDetailId,
          evaluatorId,
          hasilSebelum: current.hasil,
          hasilSesudah: dto.hasil,
          catatanSebelum: current.catatan,
          catatanSesudah: dto.catatan ?? null,
        },
      });

      return tx.nilaiEvaluasi.findUnique({
        where: {
          pengajuanEvaluasiId_sopDetailId: {
            pengajuanEvaluasiId: pengajuanId,
            sopDetailId,
          },
        },
      });
    });
  }

  // Check all NilaiEvaluasi are filled (no null hasil)
  async allNilaiIsi(pengajuanId: string): Promise<boolean> {
    const unfilled = await this.prisma.nilaiEvaluasi.count({
      where: { pengajuanEvaluasiId: pengajuanId, hasil: null },
    });
    return unfilled === 0;
  }

  // EVL-06 + EVL-07: finalize evaluation and transition DetailSOP statuses
  async selesai(
    id: string,
    nilaiOPD: number | null | undefined,
    userId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const nilaiList = await tx.nilaiEvaluasi.findMany({
        where: { pengajuanEvaluasiId: id },
        select: { sopDetailId: true, hasil: true },
      });

      for (const nilai of nilaiList) {
        const newStatus =
          nilai.hasil === HasilEvaluasi.SESUAI
            ? StatusSOP.SIAP_DIVERIFIKASI
            : StatusSOP.REVISI_DARI_TIM_EVALUASI;

        await tx.detailSOP.update({
          where: { id: nilai.sopDetailId },
          data: { status: newStatus },
        });
      }

      return tx.pengajuanEvaluasi.update({
        where: { id },
        data: {
          status: StatusPengajuanEvaluasi.SELESAI_DIEVALUASI,
          nilaiOPD: nilaiOPD ?? null,
          diselesaikanOlehId: userId,
          tanggalDiselesaikan: new Date(),
        },
        include: INCLUDE,
      });
    });
  }

  // EVL-09: annual recap per OPD
  async rekap(tahun: number) {
    const start = new Date(`${tahun}-01-01`);
    const end = new Date(`${tahun + 1}-01-01`);

    const list = await this.prisma.pengajuanEvaluasi.findMany({
      where: { createdAt: { gte: start, lt: end } },
      include: {
        opd: { select: { id: true, nama: true } },
        nilaiEvaluasi: { select: { hasil: true } },
      },
    });

    const byOpd = new Map<
      string,
      {
        opdId: string;
        opdNama: string;
        total: number;
        selesai: number;
        sesuai: number;
        tidakSesuai: number;
      }
    >();

    for (const p of list) {
      if (!byOpd.has(p.opdId)) {
        byOpd.set(p.opdId, {
          opdId: p.opdId,
          opdNama: p.opd.nama,
          total: 0,
          selesai: 0,
          sesuai: 0,
          tidakSesuai: 0,
        });
      }
      const entry = byOpd.get(p.opdId)!;
      entry.total++;
      if (DONE_STATUSES.includes(p.status)) entry.selesai++;
      for (const n of p.nilaiEvaluasi) {
        if (n.hasil === HasilEvaluasi.SESUAI) entry.sesuai++;
        if (n.hasil === HasilEvaluasi.TIDAK_SESUAI) entry.tidakSesuai++;
      }
    }

    return { tahun, opd: Array.from(byOpd.values()) };
  }
}
