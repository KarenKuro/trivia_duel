import { IAuthTokens } from '@common/models';

export class AuthTokensDTO implements IAuthTokens {
  accessToken: string;
  refreshToken: string;
}
