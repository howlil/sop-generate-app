import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const adapter = new PrismaMariaDb({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      connectionLimit: 10,
      allowPublicKeyRetrieval: true,
    });
    super({ adapter });

    // [P2-G] Soft Delete Middleware
    // Automatically filter out soft-deleted records for all soft-delete enabled tables
    // See: docs/SCHEMA-CONSTRAINTS.md#p2-g-soft-delete-filter
    (this as any).$use(async (params: any, next: any) => {
      const softDeleteModels = [
        'Pengguna', 'OPD', 'SOP', 'DetailSOP', 'Peraturan',
        'Pelaksana', 'AnggotaTimPenyusun', 'AnggotaTimEvaluasi',
      ];
      
      // Only apply to affected models
      if (!softDeleteModels.includes(params.model ?? '')) {
        return next(params);
      }

      // For read operations, auto-filter deletedAt IS NULL
      if (['findMany', 'findFirst', 'findUnique', 'count', 'aggregate'].includes(params.action)) {
        params.args = params.args ?? {};
        params.args.where = params.args.where ?? {};
        params.args.where.deletedAt = null;
      }

      // For update operations on soft-delete, set deletedAt instead of hard delete
      if (params.action === 'delete') {
        params.action = 'update';
        params.args = params.args ?? {};
        params.args.data = params.args.data ?? {};
        params.args.data.deletedAt = new Date();
      }

      // For deleteMany, convert to updateMany with deletedAt
      if (params.action === 'deleteMany') {
        params.action = 'updateMany';
        params.args = params.args ?? {};
        params.args.data = params.args.data ?? {};
        params.args.data.deletedAt = new Date();
      }

      return next(params);
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}