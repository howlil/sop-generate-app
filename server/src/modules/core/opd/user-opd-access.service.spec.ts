import { ForbiddenException } from '@nestjs/common';
import { PeranPengguna } from '../../../generated/prisma';
import type { JwtAccessPayload } from '../../../common';
import { OpdRepository } from './opd.repository';
import { UserOpdAccessService } from './user-opd-access.service';

describe('UserOpdAccessService', () => {
  const opdRepository: jest.Mocked<Pick<OpdRepository, 'findOpdIdByPenggunaId'>> = {
    findOpdIdByPenggunaId: jest.fn(),
  };
  let service: UserOpdAccessService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserOpdAccessService(opdRepository as unknown as OpdRepository);
    opdRepository.findOpdIdByPenggunaId.mockResolvedValue('opd-1');
  });

  it('should_throw_when_user_not_bound_to_opd', async () => {
    opdRepository.findOpdIdByPenggunaId.mockResolvedValueOnce(null);
    await expect(service.getRequiredUserOpdId('u1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should_reject_query_opd_mismatch', async () => {
    await expect(
      service.resolveOwnOpdAllowingOptionalQuery('u1', 'opd-lain'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should_skip_workbench_assert_for_evaluator', async () => {
    const user: JwtAccessPayload = {
      sub: 'ev-1',
      email: 'e@x.c',
      peran: PeranPengguna.EVALUATOR,
    };
    await expect(service.assertWorkbenchAccess(user, 'opd-lain')).resolves.toBeUndefined();
    expect(opdRepository.findOpdIdByPenggunaId).not.toHaveBeenCalled();
  });
});
