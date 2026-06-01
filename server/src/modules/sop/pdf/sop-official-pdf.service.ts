import { Injectable } from '@nestjs/common';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { SopCatalogService } from '../catalog/sop-catalog.service';
import type { PenyusunWorkbenchDataDto } from '../catalog/dto/penyusun-workbench-data.dto';

export type SopOfficialPdfSignatureInfo = {
  readonly dokumenTteId: string;
  readonly userId: string;
  readonly nomorDokumen: string;
  readonly signedAt: Date;
  readonly verificationUrl: string | null;
};

const PAGE_WIDTH = 841.89;
const PAGE_HEIGHT = 595.28;
const MARGIN = 36;
const LINE_HEIGHT = 13;

@Injectable()
export class SopOfficialPdfService {
  constructor(private readonly sopCatalogService: SopCatalogService) {}

  async buildUnsignedOfficialPdf(
    detailSopId: string,
    signature: SopOfficialPdfSignatureInfo,
  ): Promise<Buffer> {
    const workbench = await this.sopCatalogService.getPenyusunWorkbenchForEvaluasiContext(
      detailSopId,
      0,
    );
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - MARGIN;

    const draw = (text: string, x = MARGIN, size = 9, useBold = false) => {
      page.drawText(text, { x, y, size, font: useBold ? bold : font, color: rgb(0, 0, 0) });
      y -= LINE_HEIGHT;
    };
    const newPage = () => {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    };
    const ensure = (height = LINE_HEIGHT) => {
      if (y - height < MARGIN) {
        newPage();
      }
    };
    const drawWrapped = (text: string, x = MARGIN, size = 8, maxChars = 140) => {
      for (const line of this.wrapText(text, maxChars)) {
        ensure();
        page.drawText(line, { x, y, size, font, color: rgb(0, 0, 0) });
        y -= LINE_HEIGHT;
      }
    };

    this.drawHeader(workbench, page, bold);
    y -= 72;
    draw(`Nama SOP: ${workbench.detail.sop?.judul ?? '-'}`, MARGIN, 12, true);
    draw(`Nomor SOP: ${workbench.detail.nomorSOP}`);
    draw(`Versi: ${workbench.detail.versi}`);
    draw(`Nama lembaga: ${workbench.detail.namaLembaga}`);
    draw(`Tanggal pembuatan: ${this.formatIso(workbench.detail.tanggalPembuatan)}`);
    draw(`Tanggal revisi: ${this.formatIso(workbench.detail.tanggalRevisi ?? null)}`);
    draw(`Tanggal efektif: ${this.formatIso(workbench.detail.tanggalEfektif ?? null)}`);
    draw(`Dokumen TTE: ${signature.nomorDokumen}`);
    draw(`Waktu pengesahan: ${signature.signedAt.toISOString()}`);
    if (signature.verificationUrl !== null) {
      drawWrapped(`Validasi TTE: ${signature.verificationUrl}`, MARGIN, 8, 130);
    }

    y -= 10;
    this.drawSection('Dasar Hukum', workbench.detail.dasarHukum, drawWrapped, ensure, draw);
    this.drawLampiran(workbench, drawWrapped, ensure, draw);

    y -= 8;
    ensure(40);
    draw('Langkah Prosedur', MARGIN, 10, true);
    this.drawSteps(workbench, drawWrapped, ensure, draw);

    ensure(80);
    y -= 12;
    draw('Disahkan secara elektronik oleh:', MARGIN, 9, true);
    draw(`Kepala OPD: ${workbench.detail.kepalaOpd?.nama ?? '-'}`);
    draw(`NIP: ${workbench.detail.kepalaOpd?.nip ?? '-'}`);
    draw(`Binding: dokumenTteId=${signature.dokumenTteId}; userId=${signature.userId}`);

    return Buffer.from(await pdf.save({ useObjectStreams: false }));
  }

  private drawHeader(
    workbench: PenyusunWorkbenchDataDto,
    page: ReturnType<PDFDocument['addPage']>,
    bold: Awaited<ReturnType<PDFDocument['embedFont']>>,
  ) {
    page.drawRectangle({
      x: MARGIN,
      y: PAGE_HEIGHT - MARGIN - 54,
      width: PAGE_WIDTH - MARGIN * 2,
      height: 54,
      borderWidth: 1,
      borderColor: rgb(0, 0, 0),
    });
    page.drawText('STANDAR OPERASIONAL PROSEDUR', {
      x: MARGIN + 14,
      y: PAGE_HEIGHT - MARGIN - 24,
      size: 14,
      font: bold,
    });
    page.drawText(workbench.detail.sop?.judul ?? 'Dokumen SOP', {
      x: MARGIN + 14,
      y: PAGE_HEIGHT - MARGIN - 42,
      size: 10,
      font: bold,
    });
  }

  private drawLampiran(
    workbench: PenyusunWorkbenchDataDto,
    drawWrapped: (text: string, x?: number, size?: number, maxChars?: number) => void,
    ensure: (height?: number) => void,
    draw: (text: string, x?: number, size?: number, useBold?: boolean) => void,
  ) {
    const lampiran = workbench.detail.lampiran;
    if (!lampiran) {
      return;
    }
    const sections = [
      ['Peringatan', lampiran.peringatan],
      ['Kualifikasi Pelaksanaan', lampiran.kualifikasiPelaksanaan],
      ['Peralatan/Perlengkapan', lampiran.peralatanPerlengkapan],
      ['Pencatatan/Pendataan', lampiran.pencatatanPendataan],
    ] as const;
    for (const [label, items] of sections) {
      this.drawSection(label, items, drawWrapped, ensure, draw);
    }
  }

  private drawSection(
    title: string,
    items: unknown[] | undefined,
    drawWrapped: (text: string, x?: number, size?: number, maxChars?: number) => void,
    ensure: (height?: number) => void,
    draw: (text: string, x?: number, size?: number, useBold?: boolean) => void,
  ) {
    if (!items || items.length === 0) {
      return;
    }
    ensure(32);
    draw(title, MARGIN, 10, true);
    items.forEach((item, index) => {
      const text = this.extractItemText(item);
      drawWrapped(`${index + 1}. ${text}`, MARGIN + 12, 8, 132);
    });
  }

  private drawSteps(
    workbench: PenyusunWorkbenchDataDto,
    drawWrapped: (text: string, x?: number, size?: number, maxChars?: number) => void,
    ensure: (height?: number) => void,
    draw: (text: string, x?: number, size?: number, useBold?: boolean) => void,
  ) {
    if (workbench.langkah.length === 0) {
      draw('Belum ada langkah prosedur.', MARGIN + 12);
      return;
    }
    for (const step of workbench.langkah) {
      ensure(52);
      draw(`${step.urutan}. ${step.kegiatan}`, MARGIN + 12, 8, true);
      drawWrapped(
        `Pelaksana: ${step.pelaksana?.namaPelaksana ?? '-'} | Kelengkapan: ${step.kelengkapan || '-'} | Waktu: ${step.waktu} ${step.satuanWaktu} | Keluaran: ${step.keluaran || '-'}`,
        MARGIN + 24,
        7,
        130,
      );
      if (step.keterangan) {
        drawWrapped(`Keterangan: ${step.keterangan}`, MARGIN + 24, 7, 130);
      }
    }
  }

  private extractItemText(item: unknown): string {
    if (typeof item === 'string') {
      return item;
    }
    if (item !== null && typeof item === 'object') {
      const record = item as Record<string, unknown>;
      if (typeof record.teks === 'string') return record.teks;
      if (typeof record.judul === 'string') {
        const nomor = typeof record.nomor === 'string' ? ` Nomor ${record.nomor}` : '';
        const tahun = typeof record.tahun === 'string' ? ` Tahun ${record.tahun}` : '';
        return `${record.judul}${nomor}${tahun}`;
      }
    }
    return '-';
  }

  private wrapText(text: string, maxChars: number): string[] {
    const words = text.replace(/\s+/g, ' ').trim().split(' ');
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (next.length > maxChars && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
    return lines.length === 0 ? ['-'] : lines;
  }

  private formatIso(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }
    return value.slice(0, 10);
  }
}
