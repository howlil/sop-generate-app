import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PeranPengguna } from '../../generated/prisma';
import { ROLES_METADATA_KEY, RolesGuard } from './roles.guard';

function buildContext(user: { peran: PeranPengguna } | undefined): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('should_allow_when_no_roles_metadata', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const actual = guard.canActivate(buildContext({ peran: PeranPengguna.PENYUSUN }));
    expect(actual).toBe(true);
  });

  it('should_allow_when_allowed_roles_includes_user_peran', () => {
    const reflector = {
      getAllAndOverride: jest
        .fn()
        .mockImplementation((key: string) =>
          key === ROLES_METADATA_KEY ? [PeranPengguna.PJ_EVALUATOR] : undefined,
        ),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const actual = guard.canActivate(
      buildContext({ peran: PeranPengguna.PJ_EVALUATOR }),
    );
    expect(actual).toBe(true);
  });

  it('should_throw_when_roles_required_but_peran_mismatch', () => {
    const reflector = {
      getAllAndOverride: jest
        .fn()
        .mockImplementation((key: string) =>
          key === ROLES_METADATA_KEY ? [PeranPengguna.PJ_EVALUATOR] : undefined,
        ),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(() =>
      guard.canActivate(buildContext({ peran: PeranPengguna.EVALUATOR })),
    ).toThrow(ForbiddenException);
  });

  it('should_throw_when_roles_required_but_user_missing', () => {
    const reflector = {
      getAllAndOverride: jest
        .fn()
        .mockImplementation((key: string) =>
          key === ROLES_METADATA_KEY ? [PeranPengguna.PJ_EVALUATOR] : undefined,
        ),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(buildContext(undefined))).toThrow(ForbiddenException);
  });
});
