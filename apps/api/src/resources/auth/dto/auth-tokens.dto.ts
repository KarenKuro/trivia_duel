import { ApiProperty } from '@nestjs/swagger';

import { IAuthTokens } from '@common/models';

export class AuthTokensDTO implements IAuthTokens {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
