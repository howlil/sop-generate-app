import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PeranPengguna } from '../../generated/prisma';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedUser } from '../decorators/current-user.decorator';
import { AuthMessages, GenericMessages } from '../messages';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<PeranPengguna[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user) {
      throw new ForbiddenException(AuthMessages.USER_NOT_AUTHENTICATED);
    }

    const hasRole = requiredRoles.some((role) => user.peran === role);

    if (!hasRole) {
      throw new ForbiddenException(
        `${GenericMessages.FORBIDDEN}. Diperlukan role: ${requiredRoles.join(' atau ')}`,
      );
    }

    return true;
  }
}
