import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import type { JwtAccessPayload } from '../../../common';
import {
  JenisLangkahProsedur,
  PeranPengguna,
  Prisma,
  StatusSOP,
} from '../../../generated/prisma';
import { buildNilaiEvaluasiClientId } from '../../evaluation/nilai-evaluasi-client-id';
import { EvaluasiNilaiService } from '../../evaluation/evaluasi-nilai.service';
import type { CreateSopDto } from './dto/create-sop.dto';
import type { PenyusunWorkbenchDataDto } from './dto/penyusun-workbench-data.dto';
import { displayStatusSop } from '../../../common/status/status-display';
import { assertDetailSopEditable, hasRevisiInFlight } from '../../../common/status/sop-editable.util';
import type { SopRiwayatVersiRowDto } from './dto/sop-riwayat-versi-row.dto';
import type { SopDaftarVersiSliceDto } from './dto/sop-daftar-versi-slice.dto';
import type { SopDaftarRowDto } from './dto/sop-daftar-row.dto';
import type { UpdateDetailSopStatusDto } from './dto/update-detail-sop-status.dto';
import type { UpdateSopHeaderDto } from './dto/update-sop-header.dto';
import type { ListSopQueryDto } from './dto/list-sop-query.dto';
import { encodeLogEditSopClientId } from '../sop-collaboration/log-edit-session.helper';
import type { PublicSopDokumenDto } from '../sop-public/dto/public-sop-dokumen.dto';
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
  constructor(
    private readonly sopCatalogRepository: SopCatalogRepository,
    @Inject(forwardRef(() => EvaluasiNilaiService))
    private readonly evaluasiNilaiService: EvaluasiNilaiService,
  ) {}

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
    const peringatanSorted = [...row.lampiranPeringatan].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );
    const lampiran = {
      peringatan: peringatanSorted.map((l) => ({
        id: l.lampiranPeringatanId,
        teks: l.teks,
        createdAt: this.toIso(l.createdAt),
      })),
      kualifikasiPelaksanaan: [...row.lampiranKualifikasiPelaksanaan]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((l) => ({
          id: l.lampiranKualifikasiPelaksanaanId,
          teks: l.teks,
          createdAt: this.toIso(l.createdAt),
        })),
      peralatanPerlengkapan: [...row.lampiranPeralatanPerlengkapan]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((l) => ({
          id: l.lampiranPeralatanPerlengkapanId,
          teks: l.teks,
          createdAt: this.toIso(l.createdAt),
        })),
      pencatatanPendataan: [...row.lampiranPencatatanPendataan]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((l) => ({
          id: l.lampiranPencatatanPendataanId,
          teks: l.teks,
          createdAt: this.toIso(l.createdAt),
        })),
    };
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
      id: buildNilaiEvaluasiClientId(n.pengajuanEvaluasiId, n.detailSopId),
      hasil: n.hasil === null || n.hasil === undefined ? undefined : String(n.hasil),
      catatan: n.catatan ?? undefined,
    }));
    const kp = row.sop.opd?.pengguna[0];
    const kepalaOpd: PenyusunWorkbenchDataDto['detail']['kepalaOpd'] =
      kp === null || kp === undefined ? null : { nama: kp.nama ?? null, nip: kp.nip ?? null };
    const statusDisplay = displayStatusSop(row.status);
    const detail: PenyusunWorkbenchDataDto['detail'] = {
      id: detailId,
      sopId: row.sopId,
      status: statusDisplay.value,
      statusLabel: statusDisplay.label,
      versi: row.versi,
      revisiDariDetailSopId: row.revisiDariDetailSopId,
      revisiDariVersi: row.revisiDari?.versi ?? null,
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
      const fields = log.domainFields.map((f) => f.domainField).sort();
      const count = log.sesiChangeCount;
      return {
        id: encodeLogEditSopClientId(log.detailSopId, log.penggunaId, log.createdAt),
        sopDetailId: log.detailSopId,
        userId: log.penggunaId,
        bagian: log.bagian,
        targetEntityId: log.targetEntityId,
        keterangan: log.keterangan ?? null,
        meta: fields.length === 0 && count === 0 ? null : { fields, count },
        aktorRole: String(log.pengguna.peran),
        createdAt: this.toIso(log.createdAt),
        closedAt: log.closedAt instanceof Date ? this.toIso(log.closedAt) : null,
        user: {
          id: log.pengguna.penggunaId,
          nama: log.pengguna.nama,
          email: log.pengguna.email,
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
   * Workbench untuk pratinjau SOP dalam konteks pengajuan evaluasi (batch).
   * Keanggotaan batch dan akses pengajuan sudah divalidasi di modul evaluation;
   * tanpa assert OPD agar PJ/Evaluator lintas OPD dapat memuat dokumen lengkap.
   */
  async getPenyusunWorkbenchForEvaluasiContext(
    detailSopId: string,
    logsLimitRaw?: number,
  ): Promise<PenyusunWorkbenchDataDto> {
    const logsLimit = this.clampLogsLimit(logsLimitRaw);
    const row = await this.sopCatalogRepository.findWorkbenchPayloadByDetailOrSopId(
      detailSopId,
      logsLimit,
    );
    if (row === null) {
      throw new NotFoundException('DetailSOP tidak ditemukan');
    }
    return this.mapWorkbenchPayload(row);
  }

  /**
   * Dokumen SOP berlaku untuk arsip publik (tanpa log audit dan umpan balik evaluasi).
   */
  async getPublicDokumenBerlaku(detailSopId: string): Promise<PublicSopDokumenDto> {
    const row = await this.sopCatalogRepository.findWorkbenchPayloadByDetailOrSopId(
      detailSopId,
      0,
    );
    if (row === null) {
      throw new NotFoundException('DetailSOP tidak ditemukan');
    }
    if (row.status !== StatusSOP.BERLAKU) {
      throw new NotFoundException('Hanya dokumen SOP berstatus berlaku yang dapat diakses publik');
    }
    const workbench = this.mapWorkbenchPayload(row);
    return {
      opd: {
        id: row.sop.opdId,
        nama: row.sop.opd.nama,
      },
      detail: {
        ...workbench.detail,
        nilaiEvaluasi: [],
      },
      langkah: workbench.langkah,
    };
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
        StatusSOP.REVISI_DARI_EVALUATOR,
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
      throw new ConflictException(
        'Pengesahan SOP menjadi BERLAKU wajib melalui endpoint TTE Kepala OPD',
      );
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
    const assertMinimalTeks = (items: ReadonlyArray<{ teks: string }>, label: string): void => {
      const adaIsi = items.some((r) => r.teks.trim().length > 0);
      if (!adaIsi) {
        pesan.push(`${label} wajib berisi minimal satu isian`);
      }
    };
    assertMinimalTeks(row.lampiranPeringatan, 'Peringatan');
    assertMinimalTeks(row.lampiranKualifikasiPelaksanaan, 'Kualifikasi pelaksanaan');
    assertMinimalTeks(row.lampiranPeralatanPerlengkapan, 'Peralatan dan perlengkapan');
    assertMinimalTeks(row.lampiranPencatatanPendataan, 'Pencatatan dan pendataan');
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
   * Kepala OPD: cabut versi BERLAKU SOP (bukan versi terbaru bila ada revisi in-flight).
   * Ditolak bila masih ada revisi yang sedang berjalan pada header SOP yang sama.
   */
  async cabutSopBerlaku(
    user: JwtAccessPayload,
    detailOrSopId: string,
    logsLimitRaw?: number,
  ): Promise<PenyusunWorkbenchDataDto> {
    if (user.peran !== PeranPengguna.KEPALA_OPD) {
      throw new ForbiddenException('Hanya Kepala OPD yang dapat mencabut SOP');
    }
    const resolved = await this.sopCatalogRepository.findDetailIdByDetailOrSopId(detailOrSopId);
    if (resolved === null) {
      throw new NotFoundException('DetailSOP tidak ditemukan');
    }
    const ctx = await this.sopCatalogRepository.findLatestDetailStatusContext(resolved.sopId);
    if (ctx === null) {
      throw new NotFoundException('SOP tidak ditemukan');
    }
    await this.assertOpdAccessForWorkbench(user, ctx.sopOpdId);
    const riwayat = await this.sopCatalogRepository.findRiwayatVersiBySopId(resolved.sopId);
    const allStatuses = riwayat.map((r) => r.status);
    if (hasRevisiInFlight(allStatuses)) {
      throw new ConflictException(
        'Tidak dapat mencabut SOP karena masih ada revisi yang sedang berjalan. Selesaikan atau batalkan revisi terlebih dahulu.',
      );
    }
    const berlaku = riwayat.find((r) => r.status === StatusSOP.BERLAKU);
    if (berlaku === undefined) {
      throw new ConflictException('SOP tidak memiliki versi berlaku yang dapat dicabut');
    }
    const logsLimit = this.clampLogsLimit(logsLimitRaw);
    await this.sopCatalogRepository.updateDetailSopStatus({
      detailSopId: berlaku.detailSopId,
      status: StatusSOP.DICABUT,
      userId: user.sub,
    });
    const refreshed = await this.sopCatalogRepository.findWorkbenchPayloadByDetailOrSopId(
      berlaku.detailSopId,
      logsLimit,
    );
    if (refreshed === null) {
      throw new NotFoundException('DetailSOP tidak ditemukan setelah pencabutan');
    }
    return this.mapWorkbenchPayload(refreshed);
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
    if (dto.status === StatusSOP.DICABUT) {
      return this.cabutSopBerlaku(user, detailOrSopId, logsLimitRaw);
    }
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

  /**
   * PJ Penyusun: satu aksi dari `REVISI_DARI_EVALUATOR` setelah perbaikan penyusun —
   * validasi kelengkapan seperti Siap Dievaluasi, lalu transaksi SIAP_DIEVALUASI → DIAJUKAN_EVALUASI.
   * Berbeda dari `PATCH /sop/status` ke `DIAJUKAN_EVALUASI` yang hanya untuk PJ pada SOP sudah SIAP.
   */
  async kirimUlangKeEvaluatorSetelahRevisi(
    user: JwtAccessPayload,
    detailOrSopId: string,
    logsLimitRaw?: number,
  ): Promise<PenyusunWorkbenchDataDto> {
    if (user.peran !== PeranPengguna.PJ_PENYUSUN) {
      throw new ForbiddenException(
        'Hanya PJ Penyusun yang dapat mengirim ulang ke evaluator setelah revisi',
      );
    }
    const ctx = await this.sopCatalogRepository.findLatestDetailStatusContext(detailOrSopId);
    if (ctx === null) {
      throw new NotFoundException('DetailSOP tidak ditemukan');
    }
    if (ctx.status !== StatusSOP.REVISI_DARI_EVALUATOR) {
      throw new ConflictException(
        `Hanya SOP berstatus REVISI_DARI_EVALUATOR yang dapat dikirim ulang ke evaluator (status saat ini: ${String(ctx.status)})`,
      );
    }
    await this.assertOpdAccessForWorkbench(user, ctx.sopOpdId);
    const logsLimit = this.clampLogsLimit(logsLimitRaw);
    const draftPayload = await this.sopCatalogRepository.findWorkbenchPayloadByDetailOrSopId(
      ctx.detailSopId,
      logsLimit,
    );
    if (draftPayload === null) {
      throw new NotFoundException('DetailSOP tidak ditemukan');
    }
    this.assertWorkbenchCompleteForSiapDievaluasi(draftPayload);
    await this.evaluasiNilaiService.assertBolehKirimUlangSetelahRevisi(ctx.detailSopId);
    await this.sopCatalogRepository.transitionDetailSopRevisiToDiajukanEvaluasi({
      detailSopId: ctx.detailSopId,
      userId: user.sub,
    });
    const refreshed = await this.sopCatalogRepository.findWorkbenchPayloadByDetailOrSopId(
      ctx.detailSopId,
      logsLimit,
    );
    if (refreshed === null) {
      throw new NotFoundException('DetailSOP tidak ditemukan setelah kirim ulang evaluasi');
    }
    return this.mapWorkbenchPayload(refreshed);
  }

  private collectChangedHeaderFields(dto: UpdateSopHeaderDto): string[] {
    const out: string[] = [];
    if (dto.judul !== undefined) out.push('judul');
    if (dto.nomorSOP !== undefined) out.push('nomorSOP');
    if (dto.namaLembaga !== undefined) out.push('namaLembaga');
    if (dto.dasarHukumPeraturanIds !== undefined) out.push('dasarHukumPeraturanIds');
    if (dto.sopTerkaitDetailIds !== undefined) out.push('sopTerkaitDetailIds');
    if (dto.lampiran?.peringatan !== undefined) out.push('peringatan');
    if (dto.lampiran?.kualifikasiPelaksanaan !== undefined) out.push('kualifikasiPelaksanaan');
    if (dto.lampiran?.peralatanPerlengkapan !== undefined) out.push('peralatanPerlengkapan');
    if (dto.lampiran?.pencatatanPendataan !== undefined) out.push('pencatatanPendataan');
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
      dasarHukumPeraturanIds: dto.dasarHukumPeraturanIds,
      sopTerkaitDetailIds: dto.sopTerkaitDetailIds,
      lampiran: dto.lampiran,
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
    assertDetailSopEditable(existing.status);
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

  private mapVersiSlice(slice: {
    detailSopId: string;
    versi: number;
    nomorSOP: string;
    status: string;
  }): SopDaftarVersiSliceDto {
    const statusDisplay = displayStatusSop(slice.status);
    return {
      detailSopId: slice.detailSopId,
      versi: slice.versi,
      nomorSop: slice.nomorSOP,
      status: statusDisplay.value,
      statusLabel: statusDisplay.label,
    };
  }

  private mapRow(row: SopDaftarDbRow): SopDaftarRowDto {
    const d = row.detail;
    const hasBerlaku = row.versiBerlaku !== null;
    const inFlight = hasRevisiInFlight(row.allStatuses);
    const canBuatVersiBaru = hasBerlaku && !inFlight;
    const canCabutSop =
      row.versiBerlaku !== null &&
      row.versiBerlaku.status === StatusSOP.BERLAKU &&
      !inFlight;
    if (d === undefined) {
      const statusDisplay = displayStatusSop('DRAFT');
      return {
        id: row.sopId,
        opdId: row.opdId,
        detailSopId: null,
        judul: row.judul,
        nomorSop: null,
        versi: null,
        pembuat: null,
        terakhirDiedit: { nama: null, waktu: null },
        status: statusDisplay.value,
        statusLabel: statusDisplay.label,
        peraturanId: null,
        terakhirDiperbarui: null,
        versiBerlaku: null,
        canBuatVersiBaru: false,
        canCabutSop: false,
      };
    }
    const waktuIso = d.updatedAt.toISOString();
    const statusDisplay = displayStatusSop(d.status);
    return {
      id: row.sopId,
      opdId: row.opdId,
      detailSopId: d.detailSopId,
      judul: row.judul,
      nomorSop: d.nomorSOP,
      versi: d.versi,
      pembuat: d.pembuatNama,
      terakhirDiedit: {
        nama: d.editorNama,
        waktu: waktuIso,
      },
      status: statusDisplay.value,
      statusLabel: statusDisplay.label,
      peraturanId: d.peraturanId,
      terakhirDiperbarui: waktuIso,
      versiBerlaku:
        row.versiBerlaku === null ? null : this.mapVersiSlice(row.versiBerlaku),
      canBuatVersiBaru,
      canCabutSop,
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

  private assertPenyusunOrPj(user: JwtAccessPayload): void {
    if (user.peran !== PeranPengguna.PENYUSUN && user.peran !== PeranPengguna.PJ_PENYUSUN) {
      throw new ForbiddenException('Hanya Penyusun atau PJ Penyusun yang dapat melakukan aksi ini');
    }
  }

  async buatVersiBaruDariBerlaku(
    user: JwtAccessPayload,
    detailOrSopId: string,
    logsLimitRaw?: number,
  ): Promise<PenyusunWorkbenchDataDto> {
    this.assertPenyusunOrPj(user);
    const resolved = await this.sopCatalogRepository.findDetailIdByDetailOrSopId(detailOrSopId);
    if (resolved === null) {
      throw new NotFoundException('DetailSOP tidak ditemukan');
    }
    const source = await this.sopCatalogRepository.findLatestDetailStatusContext(resolved.detailSopId);
    if (source === null) {
      throw new NotFoundException('DetailSOP tidak ditemukan');
    }
    await this.assertOpdAccessForWorkbench(user, source.sopOpdId);
    if (source.status !== StatusSOP.BERLAKU) {
      const berlakuRow = await this.sopCatalogRepository.findRiwayatVersiBySopId(source.sopId);
      const berlaku = berlakuRow.find((r) => r.status === StatusSOP.BERLAKU);
      if (berlaku === undefined) {
        throw new ConflictException('SOP ini belum memiliki versi BERLAKU');
      }
      const cloned = await this.sopCatalogRepository.cloneDetailSopFromBerlaku({
        sourceDetailSopId: berlaku.detailSopId,
        penggunaId: user.sub,
      });
      return this.getPenyusunWorkbench(user, cloned.detailSopId, logsLimitRaw);
    }
    const cloned = await this.sopCatalogRepository.cloneDetailSopFromBerlaku({
      sourceDetailSopId: source.detailSopId,
      penggunaId: user.sub,
    });
    return this.getPenyusunWorkbench(user, cloned.detailSopId, logsLimitRaw);
  }

  async getRiwayatVersi(
    user: JwtAccessPayload,
    sopId: string,
  ): Promise<SopRiwayatVersiRowDto[]> {
    const header = await this.sopCatalogRepository.findDetailIdByDetailOrSopId(sopId);
    const resolvedSopId = header?.sopId ?? sopId;
    const firstDetail = await this.sopCatalogRepository.findLatestDetailStatusContext(resolvedSopId);
    if (firstDetail === null) {
      throw new NotFoundException('SOP tidak ditemukan');
    }
    await this.assertOpdAccessForWorkbench(user, firstDetail.sopOpdId);
    const rows = await this.sopCatalogRepository.findRiwayatVersiBySopId(resolvedSopId);
    return rows.map((r) => {
      const statusDisplay = displayStatusSop(r.status);
      return {
        detailSopId: r.detailSopId,
        versi: r.versi,
        nomorSOP: r.nomorSOP,
        status: statusDisplay.value,
        statusLabel: statusDisplay.label,
        revisiDariDetailSopId: r.revisiDariDetailSopId,
        revisiDariVersi: r.revisiDariVersi,
        updatedAt: r.updatedAt.toISOString(),
        canHapusDraft: r.canHapusDraft,
      };
    });
  }

  async hapusVersiDraft(user: JwtAccessPayload, detailSopId: string): Promise<void> {
    this.assertPenyusunOrPj(user);
    const ctx = await this.sopCatalogRepository.findLatestDetailStatusContext(detailSopId);
    if (ctx === null) {
      throw new NotFoundException('DetailSOP tidak ditemukan');
    }
    await this.assertOpdAccessForWorkbench(user, ctx.sopOpdId);
    await this.sopCatalogRepository.deleteVersiDraft(ctx.detailSopId);
  }
}
