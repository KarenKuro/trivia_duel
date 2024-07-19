import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ITokenPayload } from '@common/models';

export const AuthToken = createParamDecorator(
  (_: string, ctx: ExecutionContext): ITokenPayload => {
    const request = ctx.switchToHttp().getRequest();
    const token = request.headers.authorization;
    return token;
  },
);
