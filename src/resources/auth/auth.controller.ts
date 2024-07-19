import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import axios from 'axios';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthTokensDTO } from './dto';
import { AuthToken } from '@common/decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('facebook/login')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginCallback(@Req() req): Promise<AuthTokensDTO> {
    try {
      const payload = await req.user;

      const { accessToken } = payload;

      // Use access_token to fetch user profile
      const response = await axios.get(
        `https://graph.facebook.com/v13.0/me?fields=name,email&access_token=${accessToken}`,
      );

      const { data: userData } = response;
      const profile = {
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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin(@Req() req: Request) {
    console.log(req);
  }

  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req): Promise<AuthTokensDTO> {
    try {
      const payload = await req.user;
      const { accessToken } = payload;

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
      const profile = {
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

  @Post('refresh')
  async refreshToken(
    @AuthToken() refreshToken: string,
  ): Promise<AuthTokensDTO> {
    return this._authService.refreshAccessToken(refreshToken);
  }
}
