import { BadRequestException } from '@nestjs/common';
import { StatusSOP } from '../../generated/prisma';

export const VALID_SOP_TRANSITIONS: Record<StatusSOP, StatusSOP[]> = {
  DRAFT: ['SEDANG_DISUSUN'],
  SEDANG_DISUSUN: ['SIAP_DIEVALUASI'],
  SIAP_DIEVALUASI: ['DIAJUKAN_EVALUASI'],
  DIAJUKAN_EVALUASI: ['SEDANG_DIEVALUASI'],
  SEDANG_DIEVALUASI: ['REVISI_DARI_TIM_EVALUASI', 'SIAP_DIVERIFIKASI'],
  REVISI_DARI_TIM_EVALUASI: ['SEDANG_DISUSUN'],
  SIAP_DIVERIFIKASI: ['DIVERIFIKASI_BIRO_ORGANISASI'],
  DIVERIFIKASI_BIRO_ORGANISASI: ['BERLAKU'],
  BERLAKU: ['DIGANTIKAN', 'DICABUT'],
  DIGANTIKAN: [],
  DICABUT: [],
};

export const SOP_TERMINAL_STATUSES: StatusSOP[] = ['DIGANTIKAN', 'DICABUT'];

export function assertValidSopTransition(
  current: StatusSOP,
  next: StatusSOP,
  context?: string,
) {
  const allowed = VALID_SOP_TRANSITIONS[current];
  if (!allowed || !allowed.includes(next)) {
    throw new BadRequestException(
      `Transisi status SOP tidak valid: ${current} → ${next}${context ? ` (${context})` : ''}. ` +
        `Transisi yang valid: ${allowed.join(', ') || '(tidak ada - status terminal)'}`,
    );
  }
}

export function isSopStatusTerminal(status: StatusSOP): boolean {
  return SOP_TERMINAL_STATUSES.includes(status);
}
