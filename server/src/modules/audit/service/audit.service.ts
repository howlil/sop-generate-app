import { Injectable, ForbiddenException } from '@nestjs/common';
import { AuditRepository } from '../repository/audit.repository';
import { BagianSOP, PeranPengguna } from '../../../generated/prisma';

type JwtUser = { id: string; peran: PeranPengguna; opdId: string | null };

@Injectable()
export class AuditService {
  constructor(private readonly repo: AuditRepository) {}

  // AUD-03: per-SOP log (Tim Penyusun can see their own SOP logs)
  async findBySopDetail(
    sopDetailId: string,
    bagian?: BagianSOP,
    skip?: number,
    take?: number,
  ) {
    return this.repo.findBySopDetail(sopDetailId, bagian, skip, take);
  }

  // AUD-04: all logs — BIRO_ORGANISASI only
  async findAll(user: JwtUser, bagian?: BagianSOP, skip?: number, take?: number) {
    if (user.peran !== PeranPengguna.BIRO_ORGANISASI) {
      throw new ForbiddenException('Hanya Biro Organisasi yang dapat melihat semua log audit');
    }
    return this.repo.findAll(bagian, skip, take);
  }

  // AUD-01/02: write log — called internally by other services
  async log(data: {
    sopDetailId: string;
    userId: string;
    bagian: BagianSOP;
    entityId?: string;
    keterangan?: string;
  }) {
    return this.repo.log(data);
  }
}
