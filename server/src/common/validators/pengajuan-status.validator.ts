import { BadRequestException } from '@nestjs/common';
import { StatusPengajuanEvaluasi } from '../../generated/prisma';

export const VALID_PENGAJUAN_TRANSITIONS: Record<
  StatusPengajuanEvaluasi,
  StatusPengajuanEvaluasi[]
> = {
  MENUNGGU_EVALUASI: ['SEDANG_DIEVALUASI'],
  SEDANG_DIEVALUASI: ['SELESAI_DIEVALUASI'],
  SELESAI_DIEVALUASI: ['DIVERIFIKASI_BIRO'],
  DIVERIFIKASI_BIRO: ['DITANDATANGANI_KOORDINATOR'],
  DITANDATANGANI_KOORDINATOR: ['SELESAI'],
  SELESAI: [],
};

export const PENGAJUAN_TERMINAL_STATUSES: StatusPengajuanEvaluasi[] = [
  'SELESAI',
];

export function assertValidPengajuanTransition(
  current: StatusPengajuanEvaluasi,
  next: StatusPengajuanEvaluasi,
  context?: string,
) {
  const allowed = VALID_PENGAJUAN_TRANSITIONS[current];
  if (!allowed || !allowed.includes(next)) {
    throw new BadRequestException(
      `Transisi status PengajuanEvaluasi tidak valid: ${current} → ${next}${context ? ` (${context})` : ''}. ` +
        `Transisi yang valid: ${allowed.join(', ') || '(tidak ada - status terminal)'}`,
    );
  }
}

export function isPengajuanStatusTerminal(
  status: StatusPengajuanEvaluasi,
): boolean {
  return PENGAJUAN_TERMINAL_STATUSES.includes(status);
}
