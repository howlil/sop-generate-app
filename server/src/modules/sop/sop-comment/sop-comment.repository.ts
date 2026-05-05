import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import type { Prisma } from '../../../generated/prisma';
import { BagianSOP, StatusKomentar } from '../../../generated/prisma';
import { appendOrCreateLogSession } from '../sop-collaboration/log-edit-session.helper';

export type KomentarWithUser = Prisma.KomentarGetPayload<{
  include: {
    user: {
      select: { penggunaId: true; nama: true; email: true; peran: true };
    };
  };
}>;

@Injectable()
export class SopCommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Resolve detailSopId dari `id` yang bisa berupa detailSopId atau sopId header (versi terbaru). */
  async findDetailIdByDetailOrSopId(
    detailOrSopId: string,
  ): Promise<{ detailSopId: string; sopOpdId: string } | null> {
    const direct = await this.prisma.detailSOP.findUnique({
      where: { detailSopId: detailOrSopId },
      select: { detailSopId: true, sop: { select: { opdId: true } } },
    });
    if (direct !== null) {
      return { detailSopId: direct.detailSopId, sopOpdId: direct.sop.opdId };
    }
    const header = await this.prisma.sOP.findUnique({
      where: { sopId: detailOrSopId },
      select: {
        opdId: true,
        detailSops: {
          orderBy: { versi: 'desc' },
          take: 1,
          select: { detailSopId: true },
        },
      },
    });
    const latest = header?.detailSops[0]?.detailSopId;
    if (header === null || latest === undefined) {
      return null;
    }
    return { detailSopId: latest, sopOpdId: header.opdId };
  }

  async findKomentarById(komentarId: string): Promise<
    | (KomentarWithUser & { detailSop: { sop: { opdId: string } } })
    | null
  > {
    return this.prisma.komentar.findUnique({
      where: { komentarId },
      include: {
        user: { select: { penggunaId: true, nama: true, email: true, peran: true } },
        detailSop: { select: { sop: { select: { opdId: true } } } },
      },
    });
  }

  async listByDetail(detailSopId: string): Promise<KomentarWithUser[]> {
    return this.prisma.komentar.findMany({
      where: { detailSopId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { penggunaId: true, nama: true, email: true, peran: true } },
      },
    });
  }

  /** Buat komentar baru + tulis log diskrit bagian KOMENTAR (dalam transaksi yang sudah berjalan). */
  async createKomentarWithLogTx(
    tx: Prisma.TransactionClient,
    params: { detailSopId: string; userId: string; isi: string },
  ): Promise<KomentarWithUser> {
    const created = await tx.komentar.create({
      data: {
        detailSopId: params.detailSopId,
        userId: params.userId,
        isi: params.isi,
        status: StatusKomentar.TERBUKA,
      },
      include: {
        user: { select: { penggunaId: true, nama: true, email: true, peran: true } },
      },
    });
    await appendOrCreateLogSession({
      tx,
      detailSopId: params.detailSopId,
      userId: params.userId,
      bagian: BagianSOP.KOMENTAR,
      entityId: created.komentarId,
      fields: ['create'],
      discrete: true,
    });
    return created;
  }

  /** Buat komentar baru + tulis log diskrit bagian KOMENTAR. */
  async createKomentarWithLog(params: {
    detailSopId: string;
    userId: string;
    isi: string;
  }): Promise<KomentarWithUser> {
    return this.prisma.$transaction(async (tx) =>
      this.createKomentarWithLogTx(tx, params),
    );
  }

  /** Tandai komentar sebagai SELESAI + tulis log diskrit. */
  async resolveKomentarWithLog(params: {
    komentarId: string;
    detailSopId: string;
    actorUserId: string;
  }): Promise<KomentarWithUser> {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.komentar.update({
        where: { komentarId: params.komentarId },
        data: { status: StatusKomentar.SELESAI },
        include: {
          user: { select: { penggunaId: true, nama: true, email: true, peran: true } },
        },
      });
      await appendOrCreateLogSession({
        tx,
        detailSopId: params.detailSopId,
        userId: params.actorUserId,
        bagian: BagianSOP.KOMENTAR,
        entityId: params.komentarId,
        fields: ['resolve'],
        discrete: true,
      });
      return updated;
    });
  }

  async deleteKomentarWithLog(params: {
    komentarId: string;
    detailSopId: string;
    actorUserId: string;
  }): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.komentar.delete({ where: { komentarId: params.komentarId } });
      await appendOrCreateLogSession({
        tx,
        detailSopId: params.detailSopId,
        userId: params.actorUserId,
        bagian: BagianSOP.KOMENTAR,
        entityId: params.komentarId,
        fields: ['delete'],
        discrete: true,
      });
    });
  }

  async findOpdIdByPenggunaId(penggunaId: string): Promise<string | null> {
    const row = await this.prisma.pengguna.findFirst({
      where: { penggunaId, deletedAt: null },
      select: { opdId: true },
    });
    return row?.opdId ?? null;
  }
}
