import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import { ITokenPayload } from '@common/models';

@Injectable()
export class AuthUserGuard implements CanActivate {
  constructor(private readonly _jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const accessToken = request.headers?.authorization
      ?.replace('Bearer', '')
      ?.trim();

    if (!accessToken) {
      throw ResponseManager.buildError(
        ERROR_MESSAGES.USER_UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      await this._jwtService.verify(accessToken);
      const payload = this._jwtService.decode(accessToken) as ITokenPayload;

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
