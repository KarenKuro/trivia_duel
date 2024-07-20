export interface IFacebookPayload {
  id: string;
  firstName: string;
  lastName: string;
  accessToken: string;
  refreshToken?: string;
}
