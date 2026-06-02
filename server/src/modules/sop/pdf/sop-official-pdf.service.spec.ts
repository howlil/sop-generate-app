import { BadRequestException } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import { resolveSignatureQrPlacement, SopOfficialPdfService } from './sop-official-pdf.service';

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

  it('menjaga posisi QR relatif terhadap sudut kanan atas halaman', () => {
    expect(resolveSignatureQrPlacement({ width: 841.89, height: 595.28 })).toEqual({
      x: 683,
      y: 449,
      width: 54,
      height: 54,
    });
    expect(resolveSignatureQrPlacement({ width: 900, height: 700 })).toEqual({
      x: 741.11,
      y: 553.72,
      width: 54,
      height: 54,
    });
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
