import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { SopPdfStorageService } from './sop-pdf-storage.service';

describe('SopPdfStorageService', () => {
  let rootDir: string;
  let service: SopPdfStorageService;

  beforeEach(async () => {
    rootDir = await fs.mkdtemp(join(tmpdir(), 'sop-pdf-storage-'));
    const config = {
      get: jest.fn().mockReturnValue(rootDir),
    } as unknown as ConfigService;
    service = new SopPdfStorageService(config);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await fs.rm(rootDir, { recursive: true, force: true });
  });

  it('membangun relative path yang aman dari identifier domain', () => {
    expect(
      service.buildRelativePath({
        opdId: 'opd/with space',
        sopId: 'sop:1',
        detailSopId: 'detail?1',
        versi: 3,
      }),
    ).toBe('opd-with-space/sop-1/v3-detail-1.pdf');
  });

  it('menulis atomik, membaca ulang, dan menghitung metadata PDF', async () => {
    const buffer = Buffer.from('%PDF-1.7\nfixture', 'utf8');
    const relativePath = service.buildRelativePath({
      opdId: 'opd-1',
      sopId: 'sop-1',
      detailSopId: 'detail-1',
      versi: 1,
    });

    const stored = await service.writeOfficialPdf(relativePath, buffer);
    expect(stored.relativePath).toBe(relativePath);
    expect(stored.sizeBytes).toBe(buffer.byteLength);
    expect(stored.sha256).toBe(createHash('sha256').update(buffer).digest('hex'));

    const published = await service.readPublishedPdf(relativePath);
    expect(published.buffer).toEqual(buffer);
    expect(published.sizeBytes).toBe(buffer.byteLength);

    await service.deleteStoredPdf(relativePath);
    await expect(fs.readFile(stored.absolutePath)).rejects.toThrow();
  });

  it('menolak path traversal di luar root storage', async () => {
    await expect(service.readPublishedPdf('../../outside.pdf')).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
    await expect(service.deleteStoredPdf('../outside.pdf')).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it('membersihkan file sementara dan membungkus Error filesystem', async () => {
    jest.spyOn(fs, 'writeFile').mockRejectedValueOnce(new Error('disk full'));
    const rmSpy = jest.spyOn(fs, 'rm').mockResolvedValueOnce(undefined);

    await expect(service.writeOfficialPdf('opd/sop/v1.pdf', Buffer.from('pdf'))).rejects.toThrow(
      'Gagal menyimpan PDF SOP: disk full',
    );
    expect(rmSpy).toHaveBeenCalledWith(expect.stringContaining('.tmp-'), { force: true });
  });

  it('menggunakan pesan aman ketika filesystem melempar nilai non-Error', async () => {
    jest.spyOn(fs, 'writeFile').mockRejectedValueOnce('unexpected');
    jest.spyOn(fs, 'rm').mockResolvedValueOnce(undefined);

    await expect(service.writeOfficialPdf('opd/sop/v1.pdf', Buffer.from('pdf'))).rejects.toThrow(
      'Gagal menyimpan PDF SOP',
    );
  });

  it('tidak menggagalkan operasi utama ketika cleanup temp atau delete gagal', async () => {
    jest.spyOn(fs, 'writeFile').mockRejectedValueOnce(new Error('write failed'));
    jest.spyOn(fs, 'rm').mockRejectedValueOnce(new Error('cleanup failed'));
    await expect(service.writeOfficialPdf('opd/sop/v1.pdf', Buffer.from('pdf'))).rejects.toThrow(
      'write failed',
    );

    jest.spyOn(fs, 'rm').mockRejectedValueOnce(new Error('delete failed'));
    await expect(service.deleteStoredPdf('opd/sop/v1.pdf')).resolves.toBeUndefined();
  });

  it('memakai root default ketika konfigurasi storage tidak disediakan', () => {
    const config = { get: jest.fn().mockReturnValue(undefined) } as unknown as ConfigService;
    const fallbackService = new SopPdfStorageService(config);
    expect(
      fallbackService.buildRelativePath({
        opdId: 'opd',
        sopId: 'sop',
        detailSopId: 'detail',
        versi: 1,
      }),
    ).toBe('opd/sop/v1-detail.pdf');
  });
});
