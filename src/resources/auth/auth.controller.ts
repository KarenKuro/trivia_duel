import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import axios from 'axios';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { FacebookAuthGuard } from '@common/guards';
import { AuthTokensDTO, CodeDTO } from './dto';
import { AuthToken } from '@common/decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  async facebookLogin(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const url = `https://www.facebook.com/v13.0/dialog/oauth?client_id=${process.env.FB_APP_ID}&redirect_uri=http://localhost:3000/v1/auth/facebook/login`;
    res.redirect(url);
  }

  @Get('facebook/login')
  async facebookLoginCallback(@Query() query: CodeDTO): Promise<AuthTokensDTO> {
    const { code } = query;

    try {
      // Exchange authorization code for access token
      const { data } = await axios.get(
        `https://graph.facebook.com/v13.0/oauth/access_token?client_id=${process.env.FB_APP_ID}&client_secret=${process.env.FB_APP_SECRET}&code=${code}&redirect_uri=http://localhost:3000/v1/auth/facebook/login`,
      );

      const { access_token } = data;

      // Use access_token to fetch user profile
      const { data: profile } = await axios.get(
        `https://graph.facebook.com/v13.0/me?fields=name,email&access_token=${access_token}`,
      );

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
  async googleUserData(@Req() req) {
    //Promise<AuthTokensDTO> {
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
