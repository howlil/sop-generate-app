import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { JwtAccessPayload } from '../../../common';
import {
  JenisLampiran,
  JenisLangkahProsedur,
  PeranPengguna,
  Prisma,
  StatusSOP,
} from '../../../generated/prisma';
import type { CreateSopDto } from './dto/create-sop.dto';
import type { PenyusunWorkbenchDataDto } from './dto/penyusun-workbench-data.dto';
import type { SopDaftarRowDto } from './dto/sop-daftar-row.dto';
import type { UpdateDetailSopStatusDto } from './dto/update-detail-sop-status.dto';
import type { UpdateSopHeaderDto } from './dto/update-sop-header.dto';
import type { ListSopQueryDto } from './dto/list-sop-query.dto';
import {
  SopCatalogRepository,
  type SopDaftarDbRow,
  type SopDaftarListFilters,
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

  /**
   * Validasi transisi status DetailSOP per peran; loncat status tidak diizinkan.
   */
  private assertAllowedStatusTransition(
    user: JwtAccessPayload,
    current: StatusSOP,
    target: StatusSOP,
  ): void {
    if (current === target) {
      throw new ConflictException('Status SOP sudah sesuai permintaan');
    }
    const role = user.peran;
    if (target === StatusSOP.SIAP_DIEVALUASI) {
      const allowedFrom = new Set<StatusSOP>([
        StatusSOP.DRAFT,
        StatusSOP.SEDANG_DISUSUN,
        StatusSOP.REVISI_DARI_TIM_EVALUASI,
      ]);
      if (!allowedFrom.has(current)) {
        throw new ConflictException(
          `Tidak dapat mengubah status ke SIAP_DIEVALUASI dari status ${String(current)}`,
        );
      }
      if (role !== PeranPengguna.PENYUSUN && role !== PeranPengguna.PJ_PENYUSUN) {
        throw new ForbiddenException('Hanya penyusun yang dapat menandai SOP siap dievaluasi');
      }
      return;
    }
    if (target === StatusSOP.DIAJUKAN_EVALUASI) {
      if (current !== StatusSOP.SIAP_DIEVALUASI) {
        throw new ConflictException(
          `Hanya SOP berstatus SIAP_DIEVALUASI yang dapat diajukan ke evaluasi (status saat ini: ${String(current)})`,
        );
      }
      if (role !== PeranPengguna.PJ_PENYUSUN) {
        throw new ForbiddenException('Hanya PJ Penyusun yang dapat mengajukan SOP ke evaluasi');
      }
      return;
    }
    if (target === StatusSOP.BERLAKU) {
      const allowedFrom = new Set<StatusSOP>([
        StatusSOP.SIAP_DIVERIFIKASI,
        StatusSOP.DIVERIFIKASI_BIRO_ORGANISASI,
      ]);
      if (!allowedFrom.has(current)) {
        throw new ConflictException(
          `Tidak dapat mengesahkan SOP (BERLAKU) dari status ${String(current)}`,
        );
      }
      if (role !== PeranPengguna.KEPALA_OPD) {
        throw new ForbiddenException('Hanya Kepala OPD yang dapat mengesahkan SOP menjadi berlaku');
      }
      return;
    }
    if (target === StatusSOP.DICABUT) {
      if (current !== StatusSOP.BERLAKU) {
        throw new ConflictException('Hanya SOP berstatus BERLAKU yang dapat dicabut');
      }
      if (role !== PeranPengguna.KEPALA_OPD) {
        throw new ForbiddenException('Hanya Kepala OPD yang dapat mencabut SOP');
      }
      return;
    }
    throw new ConflictException(
      `Transisi ke ${String(target)} tidak diizinkan melalui endpoint ini`,
    );
  }

  /**
   * Header + langkah harus terisi sebelum status Siap Dievaluasi.
   * Tanggal revisi dan tanggal efektif tidak diwajibkan.
   */
  private assertWorkbenchCompleteForSiapDievaluasi(row: SopWorkbenchDbPayload): void {
    const pesan: string[] = [];
    if (row.sop.judul.trim() === '') {
      pesan.push('Judul SOP wajib diisi');
    }
    if (row.nomorSOP.trim() === '') {
      pesan.push('Nomor SOP wajib diisi');
    }
    if (row.namaLembaga.trim() === '') {
      pesan.push('Nama lembaga wajib diisi');
    }
    if (row.dasarHukum.length === 0) {
      pesan.push('Minimal satu dasar hukum wajib dipilih');
    }
    if (row.relasiSopKeluar.length === 0) {
      pesan.push('Minimal satu SOP terkait wajib dipilih');
    }
    const lampiranByJenis = new Map<JenisLampiran, SopWorkbenchDbPayload['lampiran']>();
    for (const item of row.lampiran) {
      const list = lampiranByJenis.get(item.jenis) ?? [];
      list.push(item);
      lampiranByJenis.set(item.jenis, list);
    }
    const sortLampiranCreated = (list: SopWorkbenchDbPayload['lampiran'] | undefined) =>
      list === undefined ? [] : [...list].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const peringatanRows = sortLampiranCreated(lampiranByJenis.get(JenisLampiran.PERINGATAN));
    const teksPeringatanTerakhir =
      peringatanRows.length === 0 ? '' : peringatanRows[peringatanRows.length - 1].teks.trim();
    if (teksPeringatanTerakhir === '') {
      pesan.push('Peringatan wajib diisi');
    }
    const assertMinimalTeksPerJenis = (jenis: JenisLampiran, label: string): void => {
      const sorted = sortLampiranCreated(lampiranByJenis.get(jenis));
      const adaIsi = sorted.some((r) => r.teks.trim().length > 0);
      if (!adaIsi) {
        pesan.push(`${label} wajib berisi minimal satu isian`);
      }
    };
    assertMinimalTeksPerJenis(
      JenisLampiran.KUALIFIKASI_PELAKSANAAN,
      'Kualifikasi pelaksanaan',
    );
    assertMinimalTeksPerJenis(JenisLampiran.PERALATAN, 'Peralatan dan perlengkapan');
    assertMinimalTeksPerJenis(
      JenisLampiran.PENCATATAN_PENDATAAN,
      'Pencatatan dan pendataan',
    );
    if (row.swimlanes.length === 0) {
      pesan.push('Minimal satu kolom pelaksana (swimlane) wajib ada');
    }
    if (row.langkahSOP.length === 0) {
      pesan.push('Minimal satu langkah prosedur wajib ada');
    }
    const langkahUrut = [...row.langkahSOP].sort((a, b) => a.urutan - b.urutan);
    for (const step of langkahUrut) {
      const prefix = `Langkah urutan ${step.urutan}`;
      if (step.kegiatan.trim() === '') {
        pesan.push(`${prefix}: kegiatan wajib diisi`);
      }
      if (step.kelengkapan.trim() === '') {
        pesan.push(`${prefix}: kelengkapan wajib diisi`);
      }
      if (step.keluaran.trim() === '') {
        pesan.push(`${prefix}: keluaran wajib diisi`);
      }
      if (step.keterangan.trim() === '') {
        pesan.push(`${prefix}: keterangan wajib diisi`);
      }
      if (step.pelaksanaId.trim() === '') {
        pesan.push(`${prefix}: pelaksana wajib dipilih`);
      }
      if (step.jenis === JenisLangkahProsedur.KEPUTUSAN) {
        if (
          step.langkahSelanjutnyaYaId === null ||
          step.langkahSelanjutnyaYaId === undefined ||
          step.langkahSelanjutnyaYaId.trim() === ''
        ) {
          pesan.push(`${prefix}: cabang "Ya" wajib menunjuk langkah berikutnya`);
        }
        if (
          step.langkahSelanjutnyaTidakId === null ||
          step.langkahSelanjutnyaTidakId === undefined ||
          step.langkahSelanjutnyaTidakId.trim() === ''
        ) {
          pesan.push(`${prefix}: cabang "Tidak" wajib menunjuk langkah berikutnya`);
        }
      }
    }
    if (pesan.length > 0) {
      throw new BadRequestException(
        `SOP belum lengkap untuk status Siap Dievaluasi. ${pesan.join(' ')}`,
      );
    }
  }

  /**
   * Ubah status DetailSOP terbaru (param boleh detailSopId atau sopId header).
   * Mengembalikan workbench penyusun terbaru.
   */
  async transitionDetailSopStatus(
    user: JwtAccessPayload,
    detailOrSopId: string,
    dto: UpdateDetailSopStatusDto,
    logsLimitRaw?: number,
  ): Promise<PenyusunWorkbenchDataDto> {
    const ctx = await this.sopCatalogRepository.findLatestDetailStatusContext(detailOrSopId);
    if (ctx === null) {
      throw new NotFoundException('DetailSOP tidak ditemukan');
    }
    await this.assertOpdAccessForWorkbench(user, ctx.sopOpdId);
    this.assertAllowedStatusTransition(user, ctx.status, dto.status);
    const logsLimit = this.clampLogsLimit(logsLimitRaw);
    if (dto.status === StatusSOP.SIAP_DIEVALUASI) {
      const draftPayload = await this.sopCatalogRepository.findWorkbenchPayloadByDetailOrSopId(
        ctx.detailSopId,
        logsLimit,
      );
      if (draftPayload === null) {
        throw new NotFoundException('DetailSOP tidak ditemukan');
      }
      this.assertWorkbenchCompleteForSiapDievaluasi(draftPayload);
    }
    await this.sopCatalogRepository.updateDetailSopStatus({
      detailSopId: ctx.detailSopId,
      status: dto.status,
      userId: user.sub,
    });
    const refreshed = await this.sopCatalogRepository.findWorkbenchPayloadByDetailOrSopId(
      ctx.detailSopId,
      logsLimit,
    );
    if (refreshed === null) {
      throw new NotFoundException('DetailSOP tidak ditemukan setelah ubah status');
    }
    return this.mapWorkbenchPayload(refreshed);
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

  private normalizeListFilters(query?: ListSopQueryDto): SopDaftarListFilters {
    if (query === undefined) {
      return {};
    }
    const statusRaw = query.status?.trim();
    const status =
      statusRaw === undefined || statusRaw.length === 0 || statusRaw === 'all' ? undefined : statusRaw;
    const tanggalDari = query.tanggalDari?.trim() || undefined;
    const tanggalSampai = query.tanggalSampai?.trim() || undefined;
    if (
      tanggalDari !== undefined &&
      tanggalSampai !== undefined &&
      tanggalDari > tanggalSampai
    ) {
      throw new BadRequestException('tanggalDari tidak boleh lebih besar dari tanggalSampai');
    }
    return { status, tanggalDari, tanggalSampai };
  }

  async listForCurrentUser(
    user: JwtAccessPayload,
    query?: ListSopQueryDto,
  ): Promise<SopDaftarRowDto[]> {
    const filters = this.normalizeListFilters(query);
    if (user.peran === PeranPengguna.EVALUATOR || user.peran === PeranPengguna.PJ_EVALUATOR) {
      const rows = await this.sopCatalogRepository.findDaftarAll(filters);
      return rows.map((r) => this.mapRow(r));
    }
    const opdId = await this.sopCatalogRepository.findOpdIdByPenggunaId(user.sub);
    if (opdId === null) {
      throw new ForbiddenException('Pengguna tidak terikat OPD');
    }
    const rows = await this.sopCatalogRepository.findDaftarByOpdId(opdId, filters);
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
