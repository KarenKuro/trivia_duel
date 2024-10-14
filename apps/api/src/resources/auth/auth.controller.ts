import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import axios from 'axios';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

import { AuthToken, AuthUser } from '@common/decorators';
import { TokenTypes } from '@common/enums';
import { AuthUserGuard } from '@common/guards';
import {
  IFacebookProfile,
  IGoogleProfile,
  IRefreshPayload,
} from '@common/models';
import { IAppleProfile } from '@common/models/apple';

import { AuthService } from './auth.service';
import { AuthTokensDTO } from './dto';

@ApiTags('Authentication management')
@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  // @Get('facebook')
  // @UseGuards(AuthGuard('facebook'))
  // @ApiOperation({
  //   summary:
  //     'This API registers a new user in the database using a Facebook account. In case of success the request will be redirected to /facebook/login (See next endpoint)',
  // })
  // async facebookLogin(): Promise<HttpStatus> {
  //   return HttpStatus.OK;
  // }

  @Get('facebook/login')
  // @UseGuards(AuthGuard('facebook'))
  async facebookLoginCallback(@Req() req): Promise<AuthTokensDTO> {
    try {
      const accessToken = req.headers.user;

      // Use access_token to fetch user profile
      const response = await axios.get(
        `https://graph.facebook.com/v13.0/me?fields=name,email&access_token=${accessToken}`,
      );

      const { data: userData } = response;
      const profile: IFacebookProfile = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
      };

      // Code to handle user authentication and retrieval using the profile data
      const tokens = await this._authService.syncUser(profile);

      return tokens;
    } catch (error) {
      console.error('Error:', error.response.data.error);
      throw new BadRequestException(error);
    }
  }

  // @Get('google')
  // @UseGuards(AuthGuard('google'))
  // @ApiOperation({
  //   summary:
  //     'This API registers a new user in the database using a Google account. In case of success the request will be redirected to /google/login (See next endpoint)',
  // })
  // async googleLogin() {
  //   return HttpStatus.OK;
  // }

  @Get('google/login')
  // @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req: Request): Promise<AuthTokensDTO> {
    try {
      // const payload: IGooglePayload = await req.user;
      const accessToken = req.headers.user;

      // Use access_token to fetch user profile
      const response = await axios.get(
        'https://www.googleapis.com/oauth2/v1/userinfo',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const { data: userData } = response;
      const profile: IGoogleProfile = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
      };

      // Code to handle user authentication and retrieval using the profile data
      const tokens = await this._authService.syncUser(profile);

      return tokens;
    } catch (error) {
      console.error('Error:', error.response.data.error);
      throw new BadRequestException(error);
    }
  }

  @ApiHeader({
    name: 'user',
    description: 'appleJWT',
  })
  @Get('apple/login')
  async appleLoginCallback(@Req() req: Request): Promise<AuthTokensDTO> {
    try {
      const identityToken = req.headers.user as string;

      if (!identityToken) {
        throw new BadRequestException('Identity token is missing');
      }

      const jwtPayload =
        (jwt.decode(identityToken, { complete: true }) as jwt.JwtPayload) ||
        null;

      if (!jwtPayload || typeof jwtPayload === 'string') {
        throw new BadRequestException('Invalid JWT token');
      }

      const { email, sub: id } = jwtPayload.payload;
      const name = jwtPayload.payload.name || 'Unknown';

      const profile: IAppleProfile = {
        id,
        name,
        email,
      };

      const tokens = await this._authService.syncUser(profile);

      return tokens;
    } catch (error) {
      console.error('Error:', error);
      throw new BadRequestException(error.message);
    }
  }

  @Post('refresh')
  @ApiOperation({
    summary:
      'This API aimed to check the "refresh token" and refresh the "access token".',
  })
  @ApiResponse({
    status: 201,
    description: 'Return "access and refresh tokens"',
    type: AuthTokensDTO,
  })
  @ApiBearerAuth()
  @UseGuards(AuthUserGuard(TokenTypes.REFRESH))
  async refreshToken(
    @AuthToken() refreshToken: string,
    @AuthUser() user: IRefreshPayload,
  ): Promise<AuthTokensDTO> {
    return this._authService.refreshAccessToken(user.id, refreshToken);
  }
}
