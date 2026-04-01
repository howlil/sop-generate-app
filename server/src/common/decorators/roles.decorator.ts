import { SetMetadata } from '@nestjs/common';
import { PeranPengguna } from '../../generated/prisma';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: PeranPengguna[]) => SetMetadata(ROLES_KEY, roles);
