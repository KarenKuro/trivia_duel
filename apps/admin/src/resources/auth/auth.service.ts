import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuid } from 'uuid';
import { HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { AdminEntity } from '@common/database/entities/admin.entity';
import { IAdminLogin, IAuthTokens, IJwt, ITokenPayload } from '@common/models';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';

@Injectable()
export class AuthService {
  private readonly jwtSecrets: IJwt =
    this._configService.get<IJwt>('JWT_CONFIG');

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

    if (!bcrypt.compareSync(password, admin.password)) {
      throw ResponseManager.buildError(ERROR_MESSAGES.USER_INVALID_PASSWORD);
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
      { id, jti: refreshToken },
      {
        secret: this.jwtSecrets.refreshSecret,
        expiresIn: this.jwtSecrets.refreshExpiresIn,
      },
    );
  }

  // This method aimed to refresh the access token.
  async refreshAccessToken(
    id: number,
    refreshToken: string,
  ): Promise<IAuthTokens> {
    refreshToken = refreshToken?.replace('Bearer', '')?.trim();

    const accessToken = await this.createAccessToken({ id });

    return { accessToken, refreshToken };
  }
}
