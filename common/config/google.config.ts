import { registerAs } from '@nestjs/config';

import { IGoogleCredentials } from '@common/models/google';

export default registerAs(
  'GOOGLE_CONFIG',
  (): IGoogleCredentials => ({
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_SECRET: process.env.GOOGLE_SECRET,
  }),
);
