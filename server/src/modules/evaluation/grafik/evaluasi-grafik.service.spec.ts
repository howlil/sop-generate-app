import { BadRequestException } from '@nestjs/common';
import type { EvaluasiGrafikRepository } from './evaluasi-grafik.repository';
import { EvaluasiGrafikService } from './evaluasi-grafik.service';

describe('EvaluasiGrafikService', () => {
  function createRepoMock(
    partial: Partial<jest.Mocked<EvaluasiGrafikRepository>>,
  ): jest.Mocked<EvaluasiGrafikRepository> {
    return {
      findDaftarOpdAktif: jest.fn(),
      findAgregasiPerTahunOpd: jest.fn(),
      ...partial,
    } as jest.Mocked<EvaluasiGrafikRepository>;
  }

  it('should_throw_bad_request_when_tahun_dari_after_sampai', async () => {
    const findDaftarOpdAktif = jest.fn();
    const findAgregasiPerTahunOpd = jest.fn();
    const repo = createRepoMock({ findDaftarOpdAktif, findAgregasiPerTahunOpd });
    const service = new EvaluasiGrafikService(repo);
    await expect(
      service.getGrafikTahunan({ tahunDari: 2026, tahunSampai: 2020 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(findDaftarOpdAktif).not.toHaveBeenCalled();
  });

  it('should_average_opd_scores_for_year_kpi', async () => {
    const repo = createRepoMock({
      findDaftarOpdAktif: jest.fn().mockResolvedValue([
        { opdId: 'a', nama: 'OPD A' },
        { opdId: 'b', nama: 'OPD B' },
      ]),
      findAgregasiPerTahunOpd: jest.fn().mockResolvedValue([
        {
          tahun: 2025,
          opdId: 'a',
          opdNama: 'OPD A',
          jumlahEvaluasi: 2,
          rataRataSkor: 4,
        },
        {
          tahun: 2025,
          opdId: 'b',
          opdNama: 'OPD B',
          jumlahEvaluasi: 1,
          rataRataSkor: 2,
        },
      ]),
    });
    const service = new EvaluasiGrafikService(repo);
    const actual = await service.getGrafikTahunan({ tahunDari: 2025, tahunSampai: 2025 });
    expect(actual.totalOpdAktif).toBe(2);
    expect(actual.ringkasanPerTahun).toHaveLength(1);
    const y = actual.ringkasanPerTahun[0];
    expect(y?.tahun).toBe(2025);
    expect(y?.totalPenilaian).toBe(3);
    expect(y?.jumlahOpdDenganPenilaian).toBe(2);
    expect(y?.rataRataSkorOpd).toBe(3);
    expect(y?.perOpd.find((p) => p.opdId === 'a')?.jumlahEvaluasi).toBe(2);
    expect(y?.perOpd.find((p) => p.opdId === 'b')?.rataRataSkor).toBe(2);
  });

  it('should_resolve_single_tahun_from_query_tahun', async () => {
    const findAgregasi = jest.fn().mockResolvedValue([]);
    const findDaftar = jest.fn().mockResolvedValue([]);
    const repo = createRepoMock({
      findDaftarOpdAktif: findDaftar,
      findAgregasiPerTahunOpd: findAgregasi,
    });
    const service = new EvaluasiGrafikService(repo);
    await service.getGrafikTahunan({ tahun: 2024 });
    expect(findAgregasi).toHaveBeenCalledWith(2024, 2024);
  });

  it('should_ignore_nilai_opd_outside_scale_1_to_5', async () => {
    const repo = createRepoMock({
      findDaftarOpdAktif: jest.fn().mockResolvedValue([{ opdId: 'a', nama: 'OPD A' }]),
      findAgregasiPerTahunOpd: jest.fn().mockResolvedValue([
        {
          tahun: 2025,
          opdId: 'a',
          opdNama: 'OPD A',
          jumlahEvaluasi: 2,
          rataRataSkor: null,
        },
      ]),
    });
    const service = new EvaluasiGrafikService(repo);
    const actual = await service.getGrafikTahunan({ tahunDari: 2025, tahunSampai: 2025 });
    expect(actual.ringkasanPerTahun[0]?.rataRataSkorOpd).toBeNull();
    expect(actual.ringkasanPerTahun[0]?.perOpd[0]?.rataRataSkor).toBeNull();
  });

  it('should_use_null_kpi_when_no_opd_has_score', async () => {
    const repo = createRepoMock({
      findDaftarOpdAktif: jest.fn().mockResolvedValue([{ opdId: 'a', nama: 'OPD A' }]),
      findAgregasiPerTahunOpd: jest.fn().mockResolvedValue([
        {
          tahun: 2025,
          opdId: 'a',
          opdNama: 'OPD A',
          jumlahEvaluasi: 1,
          rataRataSkor: null,
        },
      ]),
    });
    const service = new EvaluasiGrafikService(repo);
    const actual = await service.getGrafikTahunan({ tahunDari: 2025, tahunSampai: 2025 });
    expect(actual.ringkasanPerTahun[0]?.rataRataSkorOpd).toBeNull();
    expect(actual.ringkasanPerTahun[0]?.perOpd[0]?.rataRataSkor).toBeNull();
  });
});
