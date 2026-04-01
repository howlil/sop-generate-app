import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthMessages } from '../messages';

export interface AuthenticatedUser {
  id: string;
  email: string;
  nama: string;
  peran: string;
  opdId: string | null;
  nip: string;
  jabatan: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user) {
      throw new UnauthorizedException(AuthMessages.USER_NOT_AUTHENTICATED);
    }

    return data ? user[data] : user;
  },
);
