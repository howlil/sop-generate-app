import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TteVerifikasiService } from './tte-verifikasi.service';
import { TteRepository } from '../shared/repository/tte.repository';
import { PeranPengguna, JenisDokumenTte } from '../../../generated/prisma';

describe('Pengujian TteVerifikasiService', () => {
  let service: TteVerifikasiService;
  let mockTteRepository: Partial<TteRepository>;
  let mockConfigService: Partial<ConfigService>;

  const defaultRiwayatRow = {
    userId: 'user-123',
    dokumenTteId: 'dok-123',
    ditandatanganiPada: new Date('2026-06-01T10:00:00.000Z'),
    peran: PeranPengguna.PJ_PENYUSUN,
    user: {
      nama: 'Budi Santoso',
      nip: '199001012020121001',
      jabatan: 'Kepala Bagian',
    },
    dokumenTte: {
      dokumenTteId: 'dok-123',
      nomorDokumen: 'SOP/001/2026',
      judulDokumen: 'SOP Keamanan',
      jenisDokumen: JenisDokumenTte.SOP_BERLAKU,
      hashDokumen: 'abc123hash',
      detailSopId: 'sop-1',
      pengajuanEvaluasiId: null,
    },
  };

  beforeEach(() => {
    mockTteRepository = {
      findRiwayatPengesahanByUserAndDokumen: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'PUBLIC_TTE_VERIFY_BASE_URL') return 'https://verify.example.com';
        return undefined;
      }),
    };

    service = new TteVerifikasiService(
      mockTteRepository as TteRepository,
      mockConfigService as ConfigService,
    );
  });

  describe('getPengesahanPublic', () => {
    it('seharusnya melempar NotFoundException jika data tidak ditemukan (False Case)', async () => {
      (mockTteRepository.findRiwayatPengesahanByUserAndDokumen as jest.Mock).mockResolvedValue(null);

      await expect(service.getPengesahanPublic('dok-123', 'user-123')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('seharusnya melempar NotFoundException jika relasi dokumenTte putus/null (Worst Case)', async () => {
      (mockTteRepository.findRiwayatPengesahanByUserAndDokumen as jest.Mock).mockResolvedValue({
        ...defaultRiwayatRow,
        dokumenTte: null, // orphan
      });

      await expect(service.getPengesahanPublic('dok-123', 'user-123')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('seharusnya melempar NotFoundException jika relasi profil user putus/null (Worst Case)', async () => {
      (mockTteRepository.findRiwayatPengesahanByUserAndDokumen as jest.Mock).mockResolvedValue({
        ...defaultRiwayatRow,
        user: null, // missing user profile
      });

      await expect(service.getPengesahanPublic('dok-123', 'user-123')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('seharusnya mengembalikan fallback string kosong jika jabatan bernilai null (Edge Case)', async () => {
      (mockTteRepository.findRiwayatPengesahanByUserAndDokumen as jest.Mock).mockResolvedValue({
        ...defaultRiwayatRow,
        user: { ...defaultRiwayatRow.user, jabatan: null },
      });

      const result = await service.getPengesahanPublic('dok-123', 'user-123');
      expect(result.penandatangan.jabatan).toBe('');
    });

    it('seharusnya mengubah null menjadi undefined untuk sopDetailId dan pengajuanEvaluasiId jika kosong (Edge Case)', async () => {
      (mockTteRepository.findRiwayatPengesahanByUserAndDokumen as jest.Mock).mockResolvedValue({
        ...defaultRiwayatRow,
        dokumenTte: {
          ...defaultRiwayatRow.dokumenTte,
          detailSopId: null,
          pengajuanEvaluasiId: null,
        },
      });

      const result = await service.getPengesahanPublic('dok-123', 'user-123');
      expect(result.dokumen.sopDetailId).toBeUndefined();
      expect(result.dokumen.pengajuanEvaluasiId).toBeUndefined();
    });

    it('seharusnya dapat membangun payload QR walaupun PUBLIC_TTE_VERIFY_BASE_URL undefined (Edge Case)', async () => {
      // Override config behavior
      const emptyConfigService = {
        get: jest.fn().mockReturnValue(undefined),
      };
      
      const emptyConfigServiceInstance = new TteVerifikasiService(
        mockTteRepository as TteRepository,
        emptyConfigService as unknown as ConfigService,
      );

      (mockTteRepository.findRiwayatPengesahanByUserAndDokumen as jest.Mock).mockResolvedValue(
        defaultRiwayatRow,
      );

      const result = await emptyConfigServiceInstance.getPengesahanPublic('dok-123', 'user-123');
      // Karena base URL undef, kita ingin memastikan fungsi tidak melempar error dan menyatukan path/URL fallback 
      expect(result.qrVerificationUrl).toBeDefined();
      expect(typeof result.qrPayload).toBe('string');
    });

    it('seharusnya mengembalikan mapping response dengan lengkap (Success Case)', async () => {
      (mockTteRepository.findRiwayatPengesahanByUserAndDokumen as jest.Mock).mockResolvedValue(
        defaultRiwayatRow,
      );

      const result = await service.getPengesahanPublic('dok-123', 'user-123');

      expect(result).toMatchObject({
        userId: 'user-123',
        dokumenTteId: 'dok-123',
        ditandatanganiPada: '2026-06-01T10:00:00.000Z',
        peran: 'PJ_PENYUSUN',
        penandatangan: {
          nama: 'Budi Santoso',
          nip: '199001012020121001',
          jabatan: 'Kepala Bagian',
        },
        dokumen: {
          dokumenTteId: 'dok-123',
          nomorDokumen: 'SOP/001/2026',
          judulDokumen: 'SOP Keamanan',
          jenisDokumen: 'SOP_BERLAKU',
          hashDokumen: 'abc123hash',
          sopDetailId: 'sop-1',
        },
        qrVerificationUrl: 'https://verify.example.com/tte/verifikasi-dokumen/dok-123?h=abc123hash',
      });
      expect(result.dokumen.pengajuanEvaluasiId).toBeUndefined();
    });
  });
});
