import { BadRequestException } from '@nestjs/common';
import { StatusSOP, StatusPengajuanEvaluasi, JenisPengajuanEvaluasi, StatusPeraturan, JenisLangkahProsedur } from '../../generated/prisma';

/**
 * [P0-D] Status Transition Guard
 * 
 * Defines valid status transitions for DetailSOP and PengajuanEvaluasi.
 * Used at service layer to validate state changes before persisting.
 * 
 * @see docs/SCHEMA-CONSTRAINTS.md#p0-d-status-transition-guard
 */

// ============================================
// DetailSOP Status Transitions
// ============================================
export const VALID_SOP_TRANSITIONS: Record<StatusSOP, StatusSOP[]> = {
  DRAFT:                        ['SEDANG_DISUSUN'],
  SEDANG_DISUSUN:               ['SIAP_DIEVALUASI'],
  SIAP_DIEVALUASI:              ['DIAJUKAN_EVALUASI'],
  DIAJUKAN_EVALUASI:            ['SEDANG_DIEVALUASI'],
  SEDANG_DIEVALUASI:            ['REVISI_DARI_TIM_EVALUASI', 'SIAP_DIVERIFIKASI'],
  REVISI_DARI_TIM_EVALUASI:     ['SEDANG_DISUSUN'],
  SIAP_DIVERIFIKASI:            ['DIVERIFIKASI_BIRO_ORGANISASI'],
  DIVERIFIKASI_BIRO_ORGANISASI: ['BERLAKU'],
  BERLAKU:                      ['DIGANTIKAN', 'DICABUT'],
  DIGANTIKAN:                   [], // terminal
  DICABUT:                      [], // terminal
};

// Terminal statuses that cannot be changed
export const SOP_TERMINAL_STATUSES: StatusSOP[] = ['DIGANTIKAN', 'DICABUT'];

/**
 * Validate SOP status transition
 * @throws BadRequestException if transition is invalid
 */
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

/**
 * Check if SOP status is terminal (cannot be changed)
 */
export function isSopStatusTerminal(status: StatusSOP): boolean {
  return SOP_TERMINAL_STATUSES.includes(status);
}

// ============================================
// PengajuanEvaluasi Status Transitions
// ============================================
export const VALID_PENGAJUAN_TRANSITIONS: Record<StatusPengajuanEvaluasi, StatusPengajuanEvaluasi[]> = {
  MENUNGGU_EVALUASI:      ['SEDANG_DIEVALUASI'],
  SEDANG_DIEVALUASI:      ['SELESAI_DIEVALUASI'],
  SELESAI_DIEVALUASI:     ['DIVERIFIKASI_BIRO'],
  DIVERIFIKASI_BIRO:      ['DITANDATANGANI_KOORDINATOR'],
  DITANDATANGANI_KOORDINATOR: ['SELESAI'],
  SELESAI: [], // terminal
};

export const PENGAJUAN_TERMINAL_STATUSES: StatusPengajuanEvaluasi[] = ['SELESAI'];

/**
 * Validate PengajuanEvaluasi status transition
 * @throws BadRequestException if transition is invalid
 */
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

/**
 * Check if PengajuanEvaluasi status is terminal
 */
export function isPengajuanStatusTerminal(status: StatusPengajuanEvaluasi): boolean {
  return PENGAJUAN_TERMINAL_STATUSES.includes(status);
}

// ============================================
// [P1-A] TTE XOR Constraint Validator
// ============================================
/**
 * Validate TTE XOR constraint: exactly one of sopDetailId or pengajuanEvaluasiId must be set
 * @throws BadRequestException if constraint is violated
 */
export function assertTteXor(sopDetailId?: string | null, pengajuanEvaluasiId?: string | null) {
  const filled = [sopDetailId, pengajuanEvaluasiId].filter(Boolean).length;
  if (filled !== 1) {
    throw new BadRequestException(
      `TTE harus merujuk tepat satu dokumen: sopDetailId=${sopDetailId ?? 'null'}, pengajuanEvaluasiId=${pengajuanEvaluasiId ?? 'null'}`,
    );
  }
}

// ============================================
// [P1-B] nilaiOPD Constraint Validator
// ============================================
/**
 * Validate nilaiOPD constraint: only TERJADWAL can have nilaiOPD
 * @throws BadRequestException if constraint is violated
 */
export function assertNilaiOPDConstraint(
  jenis: JenisPengajuanEvaluasi,
  nilaiOPD: number | null | undefined,
) {
  if (jenis === JenisPengajuanEvaluasi.MANDIRI && nilaiOPD != null) {
    throw new BadRequestException('Evaluasi MANDIRI tidak boleh memiliki nilaiOPD');
  }
  if (jenis === JenisPengajuanEvaluasi.TERJADWAL && nilaiOPD == null) {
    throw new BadRequestException('Evaluasi TERJADWAL wajib memiliki nilaiOPD');
  }
}

// ============================================
// [P1-E] NilaiEvaluasi Scope Validator
// ============================================
/**
 * Validate that DetailSOP and PengajuanEvaluasi belong to the same OPD
 * @throws BadRequestException if OPDs don't match
 */
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

// ============================================
// [P2-F] Peraturan DasarHukum Validator
// ============================================
/**
 * Validate that Peraturan can be used as DasarHukum (not DICABUT, same OPD)
 * @throws BadRequestException if constraint is violated
 */
export function assertPeraturanDasarHukum(
  peraturanStatus: StatusPeraturan,
  peraturanOpdId: string,
  sopOpdId: string,
) {
  if (peraturanStatus === StatusPeraturan.DICABUT) {
    throw new BadRequestException('Peraturan yang sudah DICABUT tidak boleh dijadikan DasarHukum');
  }
  if (peraturanOpdId !== sopOpdId) {
    throw new BadRequestException(
      `Peraturan harus dari OPD yang sama dengan SOP. Peraturan: ${peraturanOpdId}, SOP: ${sopOpdId}`,
    );
  }
}

// ============================================
// [P2-A] LangkahSOP Branching Constraint Validator
// ============================================
/**
 * Validate TERMINATOR/TASK/DECISION branching rules
 * @throws BadRequestException if constraint is violated
 */
export function assertLangkahBranching(
  jenis: JenisLangkahProsedur,
  langkahSelanjutnyaYaId: string | null,
  langkahSelanjutnyaTidakId: string | null,
) {
  if (jenis === 'TERMINATOR') {
    if (langkahSelanjutnyaYaId || langkahSelanjutnyaTidakId) {
      throw new BadRequestException(
        'Langkah TERMINATOR tidak boleh memiliki langkah selanjutnya',
      );
    }
  }

  if (jenis === 'TASK') {
    if (langkahSelanjutnyaTidakId) {
      throw new BadRequestException(
        'Langkah TASK hanya boleh memiliki satu langkah selanjutnya (Ya)',
      );
    }
  }

  // DECISION can have both, one, or none - no validation needed
}

// ============================================
// [P3-A] Circular Reference Detection for LangkahSOP
// ============================================
/**
 * Detect circular reference in LangkahSOP flow
 * Uses DFS (Depth-First Search) to detect cycles
 * 
 * @param langkahId - The ID of the langkah being modified
 * @param nextYaId - The ID of the next step on "Yes" branch
 * @param nextTidakId - The ID of the next step on "No" branch (for DECISION)
 * @param getLangkahFn - Async function to fetch a langkah by ID
 * @returns true if cycle detected, false otherwise
 * 
 * @example
 * ```typescript
 * const hasCycle = await detectCircularReference(
 *   langkahId,
 *   nextYaId,
 *   nextTidakId,
 *   async (id) => prisma.langkahSOP.findUnique({ where: { id } })
 * );
 * 
 * if (hasCycle) {
 *   throw new BadRequestException('Langkah menciptakan siklus/loop');
 * }
 * ```
 */
export async function detectCircularReference(
  langkahId: string,
  nextYaId: string | null,
  nextTidakId: string | null,
  getLangkahFn: (id: string) => Promise<{
    langkahSelanjutnyaYaId: string | null;
    langkahSelanjutnyaTidakId: string | null;
  } | null>,
): Promise<boolean> {
  // Check both branches if they create cycles
  if (nextYaId && await hasCycleDFS(langkahId, nextYaId, getLangkahFn)) {
    return true;
  }
  
  if (nextTidakId && await hasCycleDFS(langkahId, nextTidakId, getLangkahFn)) {
    return true;
  }
  
  return false;
}

/**
 * DFS helper for cycle detection
 */
async function hasCycleDFS(
  startId: string,
  currentId: string,
  getLangkahFn: (id: string) => Promise<{
    langkahSelanjutnyaYaId: string | null;
    langkahSelanjutnyaTidakId: string | null;
  } | null>,
  visited = new Set<string>(),
): Promise<boolean> {
  // Found cycle back to start
  if (currentId === startId) {
    return true;
  }
  
  // Already visited this node (but not start) - no cycle on this path
  if (visited.has(currentId)) {
    return false;
  }
  
  visited.add(currentId);
  
  // Get the next langkah
  const langkah = await getLangkahFn(currentId);
  if (!langkah) {
    return false; // End of path
  }
  
  // Check Ya branch
  if (langkah.langkahSelanjutnyaYaId &&
      await hasCycleDFS(startId, langkah.langkahSelanjutnyaYaId, getLangkahFn, visited)) {
    return true;
  }
  
  // Check Tidak branch
  if (langkah.langkahSelanjutnyaTidakId &&
      await hasCycleDFS(startId, langkah.langkahSelanjutnyaTidakId, getLangkahFn, visited)) {
    return true;
  }
  
  return false;
}
