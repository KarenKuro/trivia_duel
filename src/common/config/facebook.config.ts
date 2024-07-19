import { IFacebookCredentials } from '@common/models';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'FACEBOOK_CONFIG',
  (): IFacebookCredentials => ({
    FB_APP_ID: process.env.FB_APP_ID,
    FB_APP_SECRET: process.env.FB_APP_SECRET,
  }),
);
