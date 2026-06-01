import { BadRequestException, Injectable } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import QRCode from 'qrcode';
import { assertValidPdfBuffer } from '../../tte/shared/utils/pdf-signature-verification.util';

const SIGNATURE_QR_DRAW_SIZE = 54;
const SIGNATURE_QR_RENDER_SIZE = 192;

@Injectable()
export class SopOfficialPdfService {
  buildUnsignedOfficialPdf(detailSopId: string, pdfBase64: string): Buffer {
    try {
      const pdfBuffer = Buffer.from(pdfBase64, 'base64');
      assertValidPdfBuffer(pdfBuffer);
      return pdfBuffer;
    } catch {
      throw new BadRequestException(
        `PDF hasil renderer kanvas untuk SOP ${detailSopId} tidak valid.`,
      );
    }
  }

  async stampSignatureQrCode(params: {
    detailSopId: string;
    pdfBuffer: Buffer;
    qrPayload: string;
  }): Promise<Buffer> {
    try {
      assertValidPdfBuffer(params.pdfBuffer);
      const pdfDocument = await PDFDocument.load(params.pdfBuffer);
      const firstPage = pdfDocument.getPages()[0];
      if (firstPage === undefined) {
        throw new Error('PDF SOP tidak memiliki halaman.');
      }
      const qrPng = await QRCode.toBuffer(params.qrPayload, {
        type: 'png',
        width: SIGNATURE_QR_RENDER_SIZE,
        margin: 1,
      });
      const qrImage = await pdfDocument.embedPng(qrPng);
      // Sel tanda tangan Kepala OPD berada di sisi kanan header halaman pertama.
      firstPage.drawImage(qrImage, {
        x: 683,
        y: 449,
        width: SIGNATURE_QR_DRAW_SIZE,
        height: SIGNATURE_QR_DRAW_SIZE,
      });

      const stampedPdf = Buffer.from(await pdfDocument.save({ useObjectStreams: false }));
      assertValidPdfBuffer(stampedPdf);
      return stampedPdf;
    } catch {
      throw new BadRequestException(
        `QR tanda tangan untuk SOP ${params.detailSopId} gagal disisipkan ke PDF resmi.`,
      );
    }
  }
}
