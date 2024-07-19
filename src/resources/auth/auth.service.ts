import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UserEntity } from '@common/database/entities';
import { IAuthTokens, ISyncUser, ITokenPayload } from '@common/models';
import { ResponseManager } from '@common/helpers';
import { ERROR_MESSAGES } from '@common/messages';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private _userRepository: Repository<UserEntity>,

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
      console.log('gonna create a new user');
      user = await this._userRepository.save({
        uid: String(data.id),
        name: data.name,
        email: data.email,
      });
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
      { sub: id, jti: refreshToken },
      { expiresIn: this._configService.get(`JWT_CONFIG.refreshExpiresIn`) },
    );
  }

  // This method aimed to refresh the access token.
  async refreshAccessToken(refreshToken: string): Promise<IAuthTokens> {
    refreshToken = refreshToken?.replace('Bearer', '')?.trim();
    // Will throw an exception in case of not valid refresh token
    const { id } = await this.validateRefreshToken(refreshToken);

    const accessToken = await this.createAccessToken({ id });

    return { accessToken, refreshToken };
  }

  // This method aimed to validate the refresh token.
  async validateRefreshToken(refreshToken: string): Promise<UserEntity> {
    try {
      await this._jwtService.verify(refreshToken);
      const decoded = this._jwtService.decode(refreshToken);
      // Check if the user associated with the token is still valid and has not been revoked
      const user = await this._userRepository.findOneBy({
        id: Number(decoded.sub),
      });
      if (!user) {
        throw ResponseManager.buildError(
          ERROR_MESSAGES.USER_UNAUTHORIZED,
          HttpStatus.UNAUTHORIZED,
        );
      }

      return user;
    } catch (error) {
      throw ResponseManager.buildError(
        error?.response ?? ERROR_MESSAGES.USER_UNAUTHORIZED,
        error?.status ?? HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
