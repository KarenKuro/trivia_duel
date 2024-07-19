import { IGoogleCredentials } from '@common/models/google';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'GOOGLE_CONFIG',
  (): IGoogleCredentials => ({
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_SECRET: process.env.GOOGLE_SECRET,
  }),
);
