import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { JwtAccessPayload } from '../../../common';
import { PeranPengguna, StatusKomentar } from '../../../generated/prisma';
import type { CreateKomentarDto } from './dto/create-komentar.dto';
import type { KomentarResponseDto } from './dto/komentar-response.dto';
import type { KomentarWithUser } from './sop-comment.repository';
import { SopCommentRepository } from './sop-comment.repository';

const ROLES_DAPAT_LIHAT: ReadonlySet<PeranPengguna> = new Set([
  PeranPengguna.PENYUSUN,
  PeranPengguna.PJ_PENYUSUN,
  PeranPengguna.KEPALA_OPD,
  PeranPengguna.EVALUATOR,
  PeranPengguna.PJ_EVALUATOR,
]);

@Injectable()
export class SopCommentService {
  constructor(private readonly sopCommentRepository: SopCommentRepository) {}

  /** Cek akses: TIM_EVALUASI / PJ_EVALUATOR bypass OPD scoping. */
  private async assertOpdScope(user: JwtAccessPayload, sopOpdId: string): Promise<void> {
    if (
      user.peran === PeranPengguna.EVALUATOR ||
      user.peran === PeranPengguna.PJ_EVALUATOR
    ) {
      return;
    }
    const opdId = await this.sopCommentRepository.findOpdIdByPenggunaId(user.sub);
    if (opdId === null) {
      throw new ForbiddenException('Pengguna tidak terikat OPD');
    }
    if (opdId !== sopOpdId) {
      throw new ForbiddenException('Akses ditolak untuk SOP ini');
    }
  }

  private toResponse(item: KomentarWithUser): KomentarResponseDto {
    return {
      id: item.komentarId,
      sopDetailId: item.detailSopId,
      userId: item.userId,
      isi: item.isi,
      status: item.status,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      user: {
        id: item.user.penggunaId,
        nama: item.user.nama,
        peran: String(item.user.peran),
        email: item.user.email,
      },
    };
  }

  async listForDetailSop(
    user: JwtAccessPayload,
    detailOrSopId: string,
  ): Promise<KomentarResponseDto[]> {
    if (!ROLES_DAPAT_LIHAT.has(user.peran)) {
      throw new ForbiddenException('Peran tidak berhak melihat komentar');
    }
    const resolved = await this.sopCommentRepository.findDetailIdByDetailOrSopId(detailOrSopId);
    if (resolved === null) {
      throw new NotFoundException('SOP tidak ditemukan');
    }
    await this.assertOpdScope(user, resolved.sopOpdId);
    const items = await this.sopCommentRepository.listByDetail(resolved.detailSopId);
    return items.map((it) => this.toResponse(it));
  }

  async createKomentar(
    user: JwtAccessPayload,
    detailOrSopId: string,
    dto: CreateKomentarDto,
  ): Promise<KomentarResponseDto> {
    if (user.peran !== PeranPengguna.EVALUATOR) {
      throw new ForbiddenException('Hanya Tim Evaluasi yang dapat menambahkan komentar');
    }
    const resolved = await this.sopCommentRepository.findDetailIdByDetailOrSopId(detailOrSopId);
    if (resolved === null) {
      throw new NotFoundException('SOP tidak ditemukan');
    }
    const isi = dto.isi.trim();
    if (isi.length === 0) {
      throw new ConflictException('Komentar tidak boleh kosong');
    }
    const created = await this.sopCommentRepository.createKomentarWithLog({
      detailSopId: resolved.detailSopId,
      userId: user.sub,
      isi,
    });
    return this.toResponse(created);
  }

  async resolveKomentar(
    user: JwtAccessPayload,
    komentarId: string,
  ): Promise<KomentarResponseDto> {
    const existing = await this.sopCommentRepository.findKomentarById(komentarId);
    if (existing === null) {
      throw new NotFoundException('Komentar tidak ditemukan');
    }
    if (existing.status === StatusKomentar.SELESAI) {
      throw new ConflictException('Komentar sudah selesai');
    }
    if (
      user.peran !== PeranPengguna.PENYUSUN &&
      user.peran !== PeranPengguna.PJ_PENYUSUN
    ) {
      throw new ForbiddenException('Hanya Penyusun OPD yang dapat menutup komentar');
    }
    await this.assertOpdScope(user, existing.detailSop.sop.opdId);
    const updated = await this.sopCommentRepository.resolveKomentarWithLog({
      komentarId,
      detailSopId: existing.detailSopId,
      actorUserId: user.sub,
    });
    return this.toResponse(updated);
  }

  async deleteKomentar(user: JwtAccessPayload, komentarId: string): Promise<void> {
    const existing = await this.sopCommentRepository.findKomentarById(komentarId);
    if (existing === null) {
      throw new NotFoundException('Komentar tidak ditemukan');
    }
    if (user.peran !== PeranPengguna.EVALUATOR) {
      throw new ForbiddenException('Hanya Tim Evaluasi yang dapat menghapus komentar');
    }
    if (existing.userId !== user.sub) {
      throw new ForbiddenException('Hanya pembuat komentar yang dapat menghapus');
    }
    await this.sopCommentRepository.deleteKomentarWithLog({
      komentarId,
      detailSopId: existing.detailSopId,
      actorUserId: user.sub,
    });
  }
}
