import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { JwtAccessPayload } from '../../../common';
import { JenisLampiran, PeranPengguna, Prisma } from '../../../generated/prisma';
import type { CreateSopDto } from './dto/create-sop.dto';
import type { PenyusunWorkbenchDataDto } from './dto/penyusun-workbench-data.dto';
import type { SopDaftarRowDto } from './dto/sop-daftar-row.dto';
import type { UpdateSopHeaderDto } from './dto/update-sop-header.dto';
import {
  SopCatalogRepository,
  type SopDaftarDbRow,
  type SopWorkbenchDbPayload,
  type UpdateSopHeaderRepoInput,
} from './sop-catalog.repository';

const DEFAULT_WORKBENCH_LOG_LIMIT = 100;
const MAX_WORKBENCH_LOG_LIMIT = 500;

@Injectable()
export class SopCatalogService {
  constructor(private readonly sopCatalogRepository: SopCatalogRepository) {}

  private clampLogsLimit(raw: number | undefined): number {
    if (raw === undefined || Number.isNaN(raw)) {
      return DEFAULT_WORKBENCH_LOG_LIMIT;
    }
    const n = Math.floor(raw);
    if (n < 1) {
      return 1;
    }
    if (n > MAX_WORKBENCH_LOG_LIMIT) {
      return MAX_WORKBENCH_LOG_LIMIT;
    }
    return n;
  }

  private async assertOpdAccessForWorkbench(user: JwtAccessPayload, sopOpdId: string): Promise<void> {
    if (user.peran === PeranPengguna.EVALUATOR || user.peran === PeranPengguna.PJ_EVALUATOR) {
      return;
    }
    const opdId = await this.sopCatalogRepository.findOpdIdByPenggunaId(user.sub);
    if (opdId === null) {
      throw new ForbiddenException('Pengguna tidak terikat OPD');
    }
    if (opdId !== sopOpdId) {
      throw new ForbiddenException('Akses ditolak untuk DetailSOP ini');
    }
  }

  private toIso(d: Date): string {
    return d.toISOString();
  }

  private mapWorkbenchPayload(row: SopWorkbenchDbPayload): PenyusunWorkbenchDataDto {
    const detailId = row.detailSopId;
    const sopHeader = {
      id: row.sop.sopId,
      opdId: row.sop.opdId,
      judul: row.sop.judul,
      createdAt: this.toIso(row.sop.createdAt),
      updatedAt: this.toIso(row.sop.updatedAt),
    };
    const lampiran = row.lampiran.map((l) => ({
      id: l.lampiranTeksId,
      sopDetailId: detailId,
      judul: l.jenis,
      jenis: l.jenis,
      isi: l.teks,
      createdAt: this.toIso(l.createdAt),
      updatedAt: this.toIso(l.updatedAt),
    }));
    const dasarHukumSorted = [...row.dasarHukum].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
    const dasarHukum = dasarHukumSorted.map((dh) => ({
      id: `${detailId}-${dh.peraturanId}`,
      sopDetailId: detailId,
      peraturanId: dh.peraturanId,
      judul: dh.peraturan.tentang,
      nomor: String(dh.peraturan.nomor),
      tahun: String(dh.peraturan.tahun),
      createdAt: this.toIso(dh.createdAt),
      updatedAt: this.toIso(dh.updatedAt),
    }));
    const dasarHukumPeraturanIds = dasarHukumSorted.map((dh) => dh.peraturanId);
    const relasiSopKeluarSorted = [...row.relasiSopKeluar].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
    const relasiSopKeluar = relasiSopKeluarSorted.map((rel) => ({
      id: `${rel.detailSopId}-${rel.detailSopTerkaitId}`,
      sopDetailId: rel.detailSopId,
      sopTerkaitId: rel.detailSopTerkaitId,
      createdAt: this.toIso(rel.createdAt),
      updatedAt: this.toIso(rel.updatedAt),
      sopTerkait: {
        id: rel.sopTerkait.detailSopId,
        sopId: rel.sopTerkait.sopId,
        nomorSOP: rel.sopTerkait.nomorSOP,
        sop: { judul: rel.sopTerkait.sop.judul },
      },
    }));
    const sopTerkaitDetailIds = relasiSopKeluarSorted.map((rel) => rel.detailSopTerkaitId);
    const lampiranByJenis = new Map<string, typeof row.lampiran>();
    for (const item of row.lampiran) {
      const list = lampiranByJenis.get(item.jenis) ?? [];
      list.push(item);
      lampiranByJenis.set(item.jenis, list);
    }
    const sortByCreated = (
      list: typeof row.lampiran | undefined,
    ): typeof row.lampiran =>
      list === undefined
        ? []
        : [...list].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const peringatanRows = sortByCreated(lampiranByJenis.get(JenisLampiran.PERINGATAN));
    const peringatan =
      peringatanRows.length === 0 ? null : peringatanRows[peringatanRows.length - 1].teks;
    const kualifikasiPelaksanaan = sortByCreated(
      lampiranByJenis.get(JenisLampiran.KUALIFIKASI_PELAKSANAAN),
    ).map((l) => l.teks);
    const peralatanPerlengkapan = sortByCreated(
      lampiranByJenis.get(JenisLampiran.PERALATAN),
    ).map((l) => l.teks);
    const pencatatanPendataan = sortByCreated(
      lampiranByJenis.get(JenisLampiran.PENCATATAN_PENDATAAN),
    ).map((l) => l.teks);
    const relasiSopMasuk = row.relasiSopMasuk.map((rel) => ({
      id: `${rel.detailSopId}-${rel.detailSopTerkaitId}`,
      sopDetailId: rel.detailSopTerkaitId,
      sopTerkaitId: rel.detailSopId,
      createdAt: this.toIso(rel.createdAt),
      updatedAt: this.toIso(rel.updatedAt),
      sop: {
        id: rel.sop.detailSopId,
        sopId: rel.sop.sopId,
        nomorSOP: rel.sop.nomorSOP,
        sop: { judul: rel.sop.sop.judul },
      },
    }));
    const swimlanes = row.swimlanes.map((sw) => ({
      id: `${sw.detailSopId}-${sw.pelaksanaId}`,
      sopDetailId: sw.detailSopId,
      pelaksanaId: sw.pelaksanaId,
      urutan: sw.urutan,
      createdAt: this.toIso(sw.createdAt),
      updatedAt: this.toIso(sw.updatedAt),
      pelaksana: {
        id: sw.pelaksana.pelaksanaId,
        opdId: sw.pelaksana.opdId,
        namaPelaksana: sw.pelaksana.nama,
      },
    }));
    const nilaiEvaluasi = row.nilaiEvaluasi.map((n) => ({
      id: n.nilaiEvaluasiId,
      hasil: n.hasil === null || n.hasil === undefined ? undefined : String(n.hasil),
      catatan: n.catatan ?? undefined,
    }));
    const kp = row.sop.opd?.kepalaPengguna;
    const kepalaOpd: PenyusunWorkbenchDataDto['detail']['kepalaOpd'] =
      kp === null || kp === undefined ? null : { nama: kp.nama ?? null, nip: kp.nip ?? null };
    const detail: PenyusunWorkbenchDataDto['detail'] = {
      id: detailId,
      sopId: row.sopId,
      status: String(row.status),
      versi: row.versi,
      nomorSOP: row.nomorSOP,
      tanggalPembuatan: this.toIso(row.tanggalPembuatan),
      tanggalRevisi: row.tanggalRevisi === null ? null : this.toIso(row.tanggalRevisi),
      tanggalEfektif: row.tanggalEfektif === null ? null : this.toIso(row.tanggalEfektif),
      logoInstansi: '',
      namaLembaga: row.namaLembaga,
      lebarKolomKegiatan: row.lebarKolomKegiatan,
      lebarKolomPelaksana: row.lebarKolomPelaksana,
      lebarKolomKelengkapan: row.lebarKolomKelengkapan,
      lebarKolomWaktu: row.lebarKolomWaktu,
      lebarKolomOutput: row.lebarKolomOutput,
      lebarKolomKeterangan: row.lebarKolomKeterangan,
      dibuatOlehId: row.dibuatOlehId,
      terakhirDieditOlehId: row.terakhirDieditOlehId,
      createdAt: this.toIso(row.createdAt),
      updatedAt: this.toIso(row.updatedAt),
      sop: sopHeader,
      dibuatOleh:
        row.dibuatOleh === null
          ? undefined
          : { id: row.dibuatOleh.penggunaId, nama: row.dibuatOleh.nama },
      terakhirDieditOleh:
        row.terakhirDieditOleh === null
          ? undefined
          : { id: row.terakhirDieditOleh.penggunaId, nama: row.terakhirDieditOleh.nama },
      lampiran,
      dasarHukum,
      relasiSopKeluar,
      relasiSopMasuk,
      swimlanes,
      nilaiEvaluasi,
      kepalaOpd,
      dasarHukumPeraturanIds,
      sopTerkaitDetailIds,
      peringatan,
      kualifikasiPelaksanaan,
      peralatanPerlengkapan,
      pencatatanPendataan,
    };
    const langkah: PenyusunWorkbenchDataDto['langkah'] = row.langkahSOP.map((step) => ({
      id: step.langkahSopId,
      sopDetailId: step.detailSopId,
      urutan: step.urutan,
      kegiatan: step.kegiatan,
      jenis: String(step.jenis),
      kelengkapan: step.kelengkapan,
      keluaran: step.keluaran,
      waktu: step.waktu,
      satuanWaktu: String(step.satuanWaktu),
      keterangan: step.keterangan,
      pelaksanaId: step.pelaksanaId,
      langkahSelanjutnyaYaId: step.langkahSelanjutnyaYaId,
      langkahSelanjutnyaTidakId: step.langkahSelanjutnyaTidakId,
      createdAt: this.toIso(step.createdAt),
      updatedAt: this.toIso(step.updatedAt),
      pelaksana: {
        id: step.pelaksana.pelaksanaId,
        namaPelaksana: step.pelaksana.nama,
      },
    }));
    const logEdit: PenyusunWorkbenchDataDto['logEdit'] = row.logEditSop.map((log) => {
      const rawMeta = log.meta as unknown;
      const metaObj =
        rawMeta !== null && typeof rawMeta === 'object'
          ? (rawMeta as { fields?: unknown; count?: unknown })
          : null;
      const fields = Array.isArray(metaObj?.fields)
        ? metaObj.fields.filter((v): v is string => typeof v === 'string')
        : [];
      const count =
        metaObj !== null && typeof metaObj.count === 'number' && Number.isFinite(metaObj.count)
          ? metaObj.count
          : 0;
      return {
        id: log.logEditSopId,
        sopDetailId: log.detailSopId,
        userId: log.userId,
        bagian: log.bagian,
        entityId: log.entityId,
        keterangan: log.keterangan ?? null,
        meta: metaObj === null ? null : { fields, count },
        aktorRole: String(log.user.peran),
        createdAt: this.toIso(log.createdAt),
        closedAt: log.closedAt instanceof Date ? this.toIso(log.closedAt) : null,
        user: {
          id: log.user.penggunaId,
          nama: log.user.nama,
          email: log.user.email,
        },
      };
    });
    return { detail, langkah, logEdit };
  }

  async getPenyusunWorkbench(
    user: JwtAccessPayload,
    detailSopId: string,
    logsLimitRaw?: number,
  ): Promise<PenyusunWorkbenchDataDto> {
    const logsLimit = this.clampLogsLimit(logsLimitRaw);
    const row = await this.sopCatalogRepository.findWorkbenchPayloadByDetailOrSopId(detailSopId, logsLimit);
    if (row === null) {
      throw new NotFoundException('DetailSOP tidak ditemukan');
    }
    await this.assertOpdAccessForWorkbench(user, row.sop.opdId);
    return this.mapWorkbenchPayload(row);
  }

  private collectChangedHeaderFields(dto: UpdateSopHeaderDto): string[] {
    const out: string[] = [];
    if (dto.judul !== undefined) out.push('judul');
    if (dto.nomorSOP !== undefined) out.push('nomorSOP');
    if (dto.namaLembaga !== undefined) out.push('namaLembaga');
    if (dto.peringatan !== undefined) out.push('peringatan');
    if (dto.dasarHukumPeraturanIds !== undefined) out.push('dasarHukumPeraturanIds');
    if (dto.sopTerkaitDetailIds !== undefined) out.push('sopTerkaitDetailIds');
    if (dto.kualifikasiPelaksanaan !== undefined) out.push('kualifikasiPelaksanaan');
    if (dto.peralatanPerlengkapan !== undefined) out.push('peralatanPerlengkapan');
    if (dto.pencatatanPendataan !== undefined) out.push('pencatatanPendataan');
    return out;
  }

  private hasAnyHeaderField(dto: UpdateSopHeaderDto): boolean {
    return this.collectChangedHeaderFields(dto).length > 0;
  }

  private toRepoInput(dto: UpdateSopHeaderDto): UpdateSopHeaderRepoInput {
    return {
      judul: dto.judul,
      nomorSOP: dto.nomorSOP,
      namaLembaga: dto.namaLembaga,
      peringatan: dto.peringatan,
      dasarHukumPeraturanIds: dto.dasarHukumPeraturanIds,
      sopTerkaitDetailIds: dto.sopTerkaitDetailIds,
      kualifikasiPelaksanaan: dto.kualifikasiPelaksanaan,
      peralatanPerlengkapan: dto.peralatanPerlengkapan,
      pencatatanPendataan: dto.pencatatanPendataan,
    };
  }

  /**
   * PATCH header SOP untuk panel kanan editor penyusun. Param `detailOrSopId`
   * boleh berupa `detailSopId` atau `sopId` (header) — versi terbaru dipakai bila header.
   * Mengembalikan workbench terbaru sehingga klien bisa `setQueryData` tanpa GET ulang.
   */
  async updatePenyusunHeader(
    user: JwtAccessPayload,
    detailOrSopId: string,
    dto: UpdateSopHeaderDto,
    logsLimitRaw?: number,
  ): Promise<PenyusunWorkbenchDataDto> {
    const resolved = await this.sopCatalogRepository.findDetailIdByDetailOrSopId(detailOrSopId);
    if (resolved === null) {
      throw new NotFoundException('DetailSOP tidak ditemukan');
    }
    const logsLimit = this.clampLogsLimit(logsLimitRaw);
    const existing = await this.sopCatalogRepository.findWorkbenchPayloadByDetailOrSopId(
      resolved.detailSopId,
      logsLimit,
    );
    if (existing === null) {
      throw new NotFoundException('DetailSOP tidak ditemukan');
    }
    await this.assertOpdAccessForWorkbench(user, existing.sop.opdId);
    const changedFields = this.collectChangedHeaderFields(dto);
    if (changedFields.length > 0) {
      try {
        await this.sopCatalogRepository.updateSopHeaderTransaction({
          detailSopId: resolved.detailSopId,
          sopId: resolved.sopId,
          userId: user.sub,
          input: this.toRepoInput(dto),
          changedFields,
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new ConflictException('Nomor SOP sudah digunakan');
        }
        throw err;
      }
    }
    const refreshed = await this.sopCatalogRepository.findWorkbenchPayloadByDetailOrSopId(
      resolved.detailSopId,
      logsLimit,
    );
    if (refreshed === null) {
      throw new NotFoundException('DetailSOP tidak ditemukan setelah update');
    }
    return this.mapWorkbenchPayload(refreshed);
  }

  private mapRow(row: SopDaftarDbRow): SopDaftarRowDto {
    const d = row.detail;
    if (d === undefined) {
      return {
        id: row.sopId,
        opdId: row.opdId,
        detailSopId: null,
        judul: row.judul,
        nomorSop: null,
        pembuat: null,
        terakhirDiedit: { nama: null, waktu: null },
        status: 'DRAFT',
        peraturanId: null,
        terakhirDiperbarui: null,
      };
    }
    const waktuIso = d.updatedAt.toISOString();
    return {
      id: row.sopId,
      opdId: row.opdId,
      detailSopId: d.detailSopId,
      judul: row.judul,
      nomorSop: d.nomorSOP,
      pembuat: d.pembuatNama,
      terakhirDiedit: {
        nama: d.editorNama,
        waktu: waktuIso,
      },
      status: d.status,
      peraturanId: d.peraturanId,
      terakhirDiperbarui: waktuIso,
    };
  }

  async listForCurrentUser(user: JwtAccessPayload): Promise<SopDaftarRowDto[]> {
    if (user.peran === PeranPengguna.EVALUATOR || user.peran === PeranPengguna.PJ_EVALUATOR) {
      const rows = await this.sopCatalogRepository.findDaftarAll();
      return rows.map((r) => this.mapRow(r));
    }
    const opdId = await this.sopCatalogRepository.findOpdIdByPenggunaId(user.sub);
    if (opdId === null) {
      throw new ForbiddenException('Pengguna tidak terikat OPD');
    }
    const rows = await this.sopCatalogRepository.findDaftarByOpdId(opdId);
    return rows.map((r) => this.mapRow(r));
  }

  async createForPenyusun(user: JwtAccessPayload, dto: CreateSopDto): Promise<SopDaftarRowDto> {
    const opdId = await this.sopCatalogRepository.findOpdIdByPenggunaId(user.sub);
    if (opdId === null) {
      throw new ForbiddenException('Pengguna tidak terikat OPD');
    }
    const trimmedJudul = dto.judul.trim();
    /** Hanya diisi bila klien mengirim nilai; tidak mengambil nama OPD/judul otomatis. */
    const namaLembaga =
      dto.namaLembaga === undefined || dto.namaLembaga === null ? '' : dto.namaLembaga.trim();
    try {
      const row = await this.sopCatalogRepository.createSopWithInitialDetail({
        judul: trimmedJudul,
        nomorSOP: dto.nomorSop.trim(),
        opdId,
        penggunaId: user.sub,
        namaLembaga,
      });
      return this.mapRow(row);
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Nomor SOP sudah digunakan');
      }
      throw err;
    }
  }
}
