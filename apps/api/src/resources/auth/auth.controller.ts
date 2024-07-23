import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import axios from 'axios';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { AuthTokensDTO } from './dto';
import { AuthToken } from '@common/decorators';
import {
  IFacebookPayload,
  IFacebookProfile,
  IGooglePayload,
  IGoogleProfile,
} from '@common/models';
import { AuthUserGuard } from '@common/guards';
import { TokenTypes } from '@common/enums';

@ApiTags('Authentication management')
@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({
    summary:
      'This API registers a new user in the database using a Facebook account. In case of success the request will be redirected to /facebook/login (See next endpoint)',
  })
  async facebookLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('facebook/login')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginCallback(@Req() req): Promise<AuthTokensDTO> {
    try {
      const payload: IFacebookPayload = await req.user;

      const { accessToken } = payload;

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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary:
      'This API registers a new user in the database using a Google account. In case of success the request will be redirected to /google/login (See next endpoint)',
  })
  async googleLogin() {
    return HttpStatus.OK;
  }

  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req): Promise<AuthTokensDTO> {
    try {
      const payload: IGooglePayload = await req.user;
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
  ): Promise<AuthTokensDTO> {
    return this._authService.refreshAccessToken(refreshToken);
  }
}
