import { BadRequestException } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import { SopOfficialPdfService } from './sop-official-pdf.service';

describe('SopOfficialPdfService', () => {
  const service = new SopOfficialPdfService();

  it('menggunakan PDF hasil renderer kanvas sebagai artefak resmi', () => {
    const pdf = Buffer.from('%PDF-1.7\nrenderer-kanvas');

    expect(service.buildUnsignedOfficialPdf('detail-1', pdf.toString('base64'))).toEqual(pdf);
  });

  it('menolak payload yang bukan PDF', () => {
    expect(() =>
      service.buildUnsignedOfficialPdf('detail-1', Buffer.from('bukan-pdf').toString('base64')),
    ).toThrow(BadRequestException);
  });

  it('menyisipkan QR tanda tangan ke halaman pertama PDF resmi', async () => {
    const pdfDocument = await PDFDocument.create();
    pdfDocument.addPage([841.89, 595.28]);
    const unsignedPdf = Buffer.from(await pdfDocument.save());

    const stampedPdf = await service.stampSignatureQrCode({
      detailSopId: 'detail-1',
      pdfBuffer: unsignedPdf,
      qrPayload: 'https://app.test/validasi/pengesahan/doc-1/user-1',
    });

    expect(stampedPdf.byteLength).toBeGreaterThan(unsignedPdf.byteLength);
    await expect(PDFDocument.load(stampedPdf)).resolves.toBeDefined();
  });

  it('menolak (melempar BadRequestException) jika PDF buffer rusak/corrupt (Bad Case)', async () => {
    const corruptPdf = Buffer.from('%PDF-1.7\nCorrupt-buffer-tanpa-eof');
    
    await expect(
      service.stampSignatureQrCode({
        detailSopId: 'detail-3',
        pdfBuffer: corruptPdf,
        qrPayload: 'https://app.test/validasi',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});