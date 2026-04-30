import { BadRequestException } from '@nestjs/common';
import { JenisPengajuanEvaluasi } from '../../generated/prisma';

export function assertTteXor(
  sopDetailId?: string | null,
  pengajuanEvaluasiId?: string | null,
) {
  const filled = [sopDetailId, pengajuanEvaluasiId].filter(Boolean).length;
  if (filled !== 1) {
    throw new BadRequestException(
      `TTE harus merujuk tepat satu dokumen: sopDetailId=${sopDetailId ?? 'null'}, pengajuanEvaluasiId=${pengajuanEvaluasiId ?? 'null'}`,
    );
  }
}

export function assertNilaiOPDConstraint(
  jenis: JenisPengajuanEvaluasi,
  nilaiOPD: number | null | undefined,
) {
  if (jenis === JenisPengajuanEvaluasi.MANDIRI && nilaiOPD != null) {
    throw new BadRequestException(
      'Evaluasi MANDIRI tidak boleh memiliki nilaiOPD',
    );
  }
  if (jenis === JenisPengajuanEvaluasi.TERJADWAL && nilaiOPD == null) {
    throw new BadRequestException('Evaluasi TERJADWAL wajib memiliki nilaiOPD');
  }
}

export function assertNilaiEvaluasiScope(
  pengajuanOpdId: string,
  detailSopOpdId: string,
) {
  if (pengajuanOpdId !== detailSopOpdId) {
    throw new BadRequestException(
      `DetailSOP tidak berasal dari OPD yang sama dengan PengajuanEvaluasi. ` +
        `Pengajuan: ${pengajuanOpdId}, DetailSOP: ${detailSopOpdId}`,
    );
  }
}

export function assertPeraturanDasarHukum(
  peraturanOpdId: string,
  sopOpdId: string,
) {
  if (peraturanOpdId !== sopOpdId) {
    throw new BadRequestException(
      `Peraturan harus dari OPD yang sama dengan SOP. Peraturan: ${peraturanOpdId}, SOP: ${sopOpdId}`,
    );
  }
}
