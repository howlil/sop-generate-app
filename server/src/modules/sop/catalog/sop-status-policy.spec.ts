import { ConflictException, ForbiddenException } from '@nestjs/common';
import { PeranPengguna, StatusSOP } from '../../../generated/prisma';
import { assertAllowedSopStatusTransition } from './sop-status-policy';

describe('sop-status-policy', () => {
  it('should_throw_conflict_when_target_equals_current', () => {
    expect(() =>
      assertAllowedSopStatusTransition({
        role: PeranPengguna.PENYUSUN,
        current: StatusSOP.DRAFT,
        target: StatusSOP.DRAFT,
      }),
    ).toThrow(ConflictException);
  });

  it('should_allow_penyusun_draft_to_siap_dievaluasi', () => {
    expect(() =>
      assertAllowedSopStatusTransition({
        role: PeranPengguna.PENYUSUN,
        current: StatusSOP.DRAFT,
        target: StatusSOP.SIAP_DIEVALUASI,
      }),
    ).not.toThrow();
  });

  it('should_forbid_evaluator_marking_siap_dievaluasi', () => {
    expect(() =>
      assertAllowedSopStatusTransition({
        role: PeranPengguna.EVALUATOR,
        current: StatusSOP.DRAFT,
        target: StatusSOP.SIAP_DIEVALUASI,
      }),
    ).toThrow(ForbiddenException);
  });

  it('should_allow_pj_penyusun_siap_to_diajukan_evaluasi', () => {
    expect(() =>
      assertAllowedSopStatusTransition({
        role: PeranPengguna.PJ_PENYUSUN,
        current: StatusSOP.SIAP_DIEVALUASI,
        target: StatusSOP.DIAJUKAN_EVALUASI,
      }),
    ).not.toThrow();
  });

  it('should_reject_berlaku_via_generic_endpoint', () => {
    expect(() =>
      assertAllowedSopStatusTransition({
        role: PeranPengguna.KEPALA_OPD,
        current: StatusSOP.SIAP_DIEVALUASI,
        target: StatusSOP.BERLAKU,
      }),
    ).toThrow(ConflictException);
  });

  it('should_allow_kepala_opd_cabut_berlaku', () => {
    expect(() =>
      assertAllowedSopStatusTransition({
        role: PeranPengguna.KEPALA_OPD,
        current: StatusSOP.BERLAKU,
        target: StatusSOP.DICABUT,
      }),
    ).not.toThrow();
  });
});
