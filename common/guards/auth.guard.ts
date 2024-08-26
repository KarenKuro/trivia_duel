import {
  ExecutionContext,
  CanActivate,
  Injectable,
  HttpStatus,
  mixin,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { TokenTypes } from '@common/enums/jwt-token';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import { IJwt, ITokenPayload } from '@common/models';

export const AuthUserGuard = (tokenType: TokenTypes = TokenTypes.PRIMARY) => {
  @Injectable()
  class AuthUserGuard implements CanActivate {
    constructor(
      public readonly jwtService: JwtService,
      public readonly configService: ConfigService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const secretKeys = this.configService.get<IJwt>('JWT_CONFIG');

      const tokenSecretKeys = {
        [TokenTypes.PRIMARY]: secretKeys.secret,
        [TokenTypes.REFRESH]: secretKeys.refreshSecret,
      };

      const options = {
        secret: tokenSecretKeys[tokenType],
      };

      const accessToken = (
        request.headers?.authorization ?? request.query?.authorization
      )
        ?.replace('Bearer', '')
        ?.trim();

      if (!accessToken) {
        throw ResponseManager.buildError(
          ERROR_MESSAGES.USER_UNAUTHORIZED,
          HttpStatus.UNAUTHORIZED,
        );
      }

      try {
        await this.jwtService.verify(accessToken, options);
        const payload = this.jwtService.decode(accessToken) as ITokenPayload;

        request.user = payload;
        return true;
      } catch (e) {
        throw ResponseManager.buildError(
          ERROR_MESSAGES.USER_UNAUTHORIZED,
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
  }

  const guard = mixin(AuthUserGuard);
  return guard;
};
