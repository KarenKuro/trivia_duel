import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthTokensDTO, LoginDTO } from './dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUserGuard } from '@common/guards';
import { TokenTypes } from '@common/enums/jwt-tokenTypes';

@ApiTags('Authentication management')
@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Post('/refresh')
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
  async refreshToken(@Req() req: any): Promise<AuthTokensDTO> {
    // Use decorator`bsdsssssssssssssssssssssssssssssss
    console.log('req.user', req.user);
    return this._authService.refreshAccessToken(req.user.id);
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
