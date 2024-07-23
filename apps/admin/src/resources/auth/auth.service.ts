import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuid } from 'uuid';
import { HttpStatus, Injectable } from '@nestjs/common';

import { AdminEntity } from '@common/database/entities/admin.entity';
import { IAdminLogin, IAuthTokens, ITokenPayload } from '@common/models';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AdminEntity)
    private _adminRepository: Repository<AdminEntity>,

    private _configService: ConfigService,

    private _jwtService: JwtService,
  ) {}

  //This method checks the user in the database and returns tokens
  async login(body: IAdminLogin): Promise<IAuthTokens> {
    const { adminName, password } = body;

    const admin = await this._adminRepository.findOne({
      where: { adminName: adminName },
    });

    if (!admin) {
      throw ResponseManager.buildError(
        ERROR_MESSAGES.ADMIN_NOT_EXISTS,
        HttpStatus.NOT_FOUND,
      );
    }

    if (password !== admin.password) {
      throw ResponseManager.buildError(
        ERROR_MESSAGES.ADMIN_INVALID_PASSWORD,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = { id: admin.id };
    const accessToken = await this.createAccessToken(payload);
    const refreshToken = await this.createRefreshToken(admin.id);

    return { accessToken, refreshToken };
  }

  // This method aimed to create JWT access token based on provided payload.
  async createAccessToken(payload: ITokenPayload): Promise<string> {
    return this._jwtService.sign(payload);
  }

  // This method aimed to create JWT refresh token based on provided customer id.
  async createRefreshToken(id: number): Promise<string> {
    const refreshToken = uuid();

    return this._jwtService.sign(
      { sub: id, jti: refreshToken },
      { expiresIn: this._configService.get(`JWT_CONFIG.refreshExpiresIn`) },
    );
  }

  // This method aimed to refresh the access token.
  async refreshAccessToken(id: number): Promise<IAuthTokens> {
    // Will throw an exception in case of not valid refresh token

    const accessToken = await this.createAccessToken({ id });

    return { accessToken, refreshToken: 'NEW REFRESH' };
  }

  // This method aimed to validate the refresh token.
  async validateRefreshToken(refreshToken: string): Promise<AdminEntity> {
    try {
      await this._jwtService.verify(refreshToken);
      const decoded = this._jwtService.decode(refreshToken);
      // Check if the user associated with the token is still valid and has not been revoked
      const admin = await this._adminRepository.findOneBy({
        id: Number(decoded.sub),
      });
      if (!admin) {
        throw ResponseManager.buildError(
          ERROR_MESSAGES.USER_UNAUTHORIZED,
          HttpStatus.UNAUTHORIZED,
        );
      }

      return admin;
    } catch (error) {
      throw ResponseManager.buildError(
        error?.response ?? ERROR_MESSAGES.USER_UNAUTHORIZED,
        error?.status ?? HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
