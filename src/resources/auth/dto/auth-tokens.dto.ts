import { IAuthTokens } from '@common/models';
import { ApiProperty } from '@nestjs/swagger';

export class AuthTokensDTO implements IAuthTokens {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
