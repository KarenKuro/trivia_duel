import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthToken, AuthUser } from '@common/decorators';
import { TokenTypes } from '@common/enums/jwt-token';
import { AuthUserGuard } from '@common/guards';
import { IRefreshPayload } from '@common/models';

import { AuthService } from './auth.service';
import { AuthTokensDTO, LoginDTO } from './dto';

@ApiTags('Authentication management')
@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

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

  @Post('login')
  @ApiOperation({
    summary: 'Login API.',
  })
  @ApiResponse({
    status: 201,
    description: 'Return "access and refresh tokens"',
    type: AuthTokensDTO,
  })
  async login(@Body() body: LoginDTO): Promise<AuthTokensDTO> {
    return await this._authService.login(body);
  }
}
