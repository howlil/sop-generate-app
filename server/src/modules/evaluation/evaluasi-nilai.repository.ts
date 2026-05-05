import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma } from '../../generated/prisma';

@Injectable()
export class EvaluasiNilaiRepository {
  constructor(private readonly prisma: PrismaService) {}

  /** Satu transaksi DB untuk konsistensi nilai + log + status DetailSOP. */
  async runTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }
}
