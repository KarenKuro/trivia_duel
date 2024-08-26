import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { MAIN_LANGUAGE } from '@common/constants';
import { ITokenPayload } from '@common/models';

export const Language = createParamDecorator(
  (_: string, ctx: ExecutionContext): ITokenPayload => {
    const request = ctx.switchToHttp().getRequest();
    const headers = request.headers;

    return headers['x-language']?.toLowerCase() ?? MAIN_LANGUAGE;
  },
);
