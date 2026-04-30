import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { AuthMessages } from '../messages';
import { AuthenticatedUser } from '../strategy/jwt.types';

type JwtErrorInfo = {
  name?: string;
  message?: string;
};

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = AuthenticatedUser>(
    err: Error | null,
    user: AuthenticatedUser | undefined,
    info: JwtErrorInfo | undefined,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          info?.name === 'TokenExpiredError'
            ? AuthMessages.TOKEN_EXPIRED
            : AuthMessages.TOKEN_INVALID,
        )
      );
    }
    return user as TUser;
  }
}
