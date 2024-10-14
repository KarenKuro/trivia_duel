import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';

import { StatisticsEntity, UserEntity } from '@common/database/entities';
import { UserStatus } from '@common/enums';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';
import { IAuthTokens, IJwt, ISyncUser, ITokenPayload } from '@common/models';

@Injectable()
export class AuthService {
  private readonly jwtSecrets: IJwt =
    this._configService.get<IJwt>('JWT_CONFIG');

  constructor(
    @InjectRepository(UserEntity)
    private _userRepository: Repository<UserEntity>,

    @InjectRepository(StatisticsEntity)
    private _statisticsRepository: Repository<StatisticsEntity>,

    private _configService: ConfigService,

    private _jwtService: JwtService,
  ) {}

  async syncUser(data: ISyncUser): Promise<IAuthTokens> {
    let user = await this._userRepository.findOne({
      where: {
        uid: String(data.id),
      },
    });

    if (!user) {
      const statistics = new StatisticsEntity();
      await this._statisticsRepository.save(statistics);

      user = await this._userRepository.save({
        uid: String(data.id),
        name: data.name,
        email: data.email,
        statistics,
      });
    }

    if (user.status === UserStatus.LOCKED) {
      throw ResponseManager.buildError(ERROR_MESSAGES.USER_ARE_BLOCKED);
    }

    const payload: ITokenPayload = { id: user.id };

    const accessToken = await this.createAccessToken(payload);
    const refreshToken = await this.createRefreshToken(user.id);

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

    const existingUser = await this._userRepository.findOne({ where: { id } });
    if (!existingUser) {
      throw ResponseManager.buildError(ERROR_MESSAGES.USERS_NOT_EXISTS);
    }

    const accessToken = await this.createAccessToken({ id });

    return { accessToken, refreshToken };
  }
}
