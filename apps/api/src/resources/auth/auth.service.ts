import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { UserEntity } from '@common/database/entities';
import {
  IAuthTokens,
  IJwt,
  ISyncUser,
  ITokenPayload,
  IUser,
} from '@common/models';

@Injectable()
export class AuthService {
  private readonly jwtSecrets: IJwt =
    this._configService.get<IJwt>('JWT_CONFIG');

  constructor(
    @InjectRepository(UserEntity)
    private _userRepository: Repository<UserEntity>,

    private _configService: ConfigService,

    private _jwtService: JwtService,
  ) {}

  async syncUser(data: ISyncUser): Promise<IAuthTokens> {
    if (!data.email) {
      data.email = '';
    }

    let user = await this._userRepository.findOne({
      where: {
        uid: String(data.id),
      },
    });

    if (!user) {
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

  // Only for mobile developers. Not use  this method in producnion mode
  // Only for mobile developers. Not use  this method in producnion mode
  // Only for mobile developers. Not use  this method in producnion mode
  // Only for mobile developers. Not use  this method in producnion mode
  // Only for mobile developers. Not use  this method in producnion mode

  async update(updateUser: Partial<IUser>): Promise<IUser> {
    const user = await this._userRepository.findOne({
      where: { id: updateUser.id },
    });

    const updatedUser = { ...user, ...updateUser };

    return await this._userRepository.save(updatedUser);
  }
}
