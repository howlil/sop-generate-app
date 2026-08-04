import { ConfigService } from '@nestjs/config';
import { PeranPengguna, StatusPengajuanEvaluasi } from '../../../generated/prisma';
import { WhatsappRecipientResolverService } from './whatsapp-recipient-resolver.service';
import type { ActionablePengajuan, ActiveWhatsappRecipient } from './whatsapp-reminder.types';

function configWithAllowlist(numbers: string): ConfigService {
  return { get: jest.fn().mockReturnValue(numbers) } as unknown as ConfigService;
}

const basePengajuan: ActionablePengajuan = {
  pengajuanEvaluasiId: 'pengajuan-1',
  opdId: 'opd-1',
  opdNama: 'Dinas Kesehatan',
  nomorBA: 'BA-001',
  status: StatusPengajuanEvaluasi.SEDANG_DIEVALUASI,
  jumlahSop: 2,
};

function recipient(
  penggunaId: string,
  peran: PeranPengguna,
  nohp: string,
  opdId = 'opd-1',
): ActiveWhatsappRecipient {
  return { penggunaId, peran, nohp, opdId, nama: penggunaId };
}

describe('WhatsappRecipientResolverService', () => {
  const allowlist = '6281111111111,6282222222222,6283333333333,6284444444444';

  it('mengirim evaluasi ke seluruh evaluator aktif dan bukan peran lain', () => {
    const service = new WhatsappRecipientResolverService(configWithAllowlist(allowlist));
    const actual = service.resolve(basePengajuan, [
      recipient('eval-1', PeranPengguna.EVALUATOR, '081111111111'),
      recipient('eval-2', PeranPengguna.EVALUATOR, '082222222222'),
      recipient('pj', PeranPengguna.PJ_EVALUATOR, '083333333333'),
    ]);
    expect(actual.map((row) => row.penggunaId)).toEqual(['eval-1', 'eval-2']);
  });

  it('menggunakan seluruh nomor valid dari database ketika allowlist kosong', () => {
    const service = new WhatsappRecipientResolverService(configWithAllowlist(''));
    const actual = service.resolve(basePengajuan, [
      recipient('eval-1', PeranPengguna.EVALUATOR, '6281111111111'),
      recipient('eval-2', PeranPengguna.EVALUATOR, '6282222222222'),
    ]);
    expect(actual.map((row) => row.penggunaId)).toEqual(['eval-1', 'eval-2']);
  });

  it('melakukan deduplikasi nomor evaluator yang sama', () => {
    const service = new WhatsappRecipientResolverService(configWithAllowlist(allowlist));
    const actual = service.resolve(basePengajuan, [
      recipient('eval-1', PeranPengguna.EVALUATOR, '081111111111'),
      recipient('eval-2', PeranPengguna.EVALUATOR, '+62 811-1111-1111'),
    ]);
    expect(actual).toHaveLength(1);
    expect(actual[0]?.penggunaId).toBe('eval-1');
  });

  it('memilih tepat satu PJ Evaluator aktif untuk TTD BA', () => {
    const service = new WhatsappRecipientResolverService(configWithAllowlist(allowlist));
    const actual = service.resolve(
      { ...basePengajuan, status: StatusPengajuanEvaluasi.SELESAI_DIEVALUASI },
      [recipient('pj', PeranPengguna.PJ_EVALUATOR, '083333333333')],
    );
    expect(actual).toHaveLength(1);
    expect(actual[0]?.penggunaId).toBe('pj');
  });

  it.each([0, 2])('fail closed jika jumlah PJ Evaluator = %i', (count) => {
    const service = new WhatsappRecipientResolverService(configWithAllowlist(allowlist));
    const candidates = Array.from({ length: count }, (_, index) =>
      recipient(
        `pj-${index}`,
        PeranPengguna.PJ_EVALUATOR,
        index === 0 ? '083333333333' : '084444444444',
      ),
    );
    expect(
      service.resolve(
        { ...basePengajuan, status: StatusPengajuanEvaluasi.SELESAI_DIEVALUASI },
        candidates,
      ),
    ).toEqual([]);
  });

  it('memilih PJ Penyusun dari OPD pengajuan saja', () => {
    const service = new WhatsappRecipientResolverService(configWithAllowlist(allowlist));
    const actual = service.resolve(
      { ...basePengajuan, status: StatusPengajuanEvaluasi.DITANDATANGANI_PJ_EVALUATOR },
      [
        recipient('pj-opd-1', PeranPengguna.PJ_PENYUSUN, '083333333333', 'opd-1'),
        recipient('pj-opd-2', PeranPengguna.PJ_PENYUSUN, '084444444444', 'opd-2'),
      ],
    );
    expect(actual.map((row) => row.penggunaId)).toEqual(['pj-opd-1']);
  });

  it('memilih Kepala OPD dari OPD pengajuan saja', () => {
    const service = new WhatsappRecipientResolverService(configWithAllowlist(allowlist));
    const actual = service.resolve(
      { ...basePengajuan, status: StatusPengajuanEvaluasi.DITANDATANGANI_PJ_PENYUSUN },
      [recipient('kepala', PeranPengguna.KEPALA_OPD, '084444444444', 'opd-1')],
    );
    expect(actual.map((row) => row.penggunaId)).toEqual(['kepala']);
  });

  it('melewati nomor invalid dan nomor di luar allowlist ketika filter dikonfigurasi', () => {
    const service = new WhatsappRecipientResolverService(configWithAllowlist('6281111111111'));
    const actual = service.resolve(basePengajuan, [
      recipient('valid', PeranPengguna.EVALUATOR, '081111111111'),
      recipient('invalid', PeranPengguna.EVALUATOR, 'nomor-rusak'),
      recipient('outside', PeranPengguna.EVALUATOR, '082222222222'),
    ]);
    expect(actual.map((row) => row.penggunaId)).toEqual(['valid']);
  });
});
