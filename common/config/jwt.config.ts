import { registerAs } from '@nestjs/config';

import { IJwt } from '@common/models';

export default registerAs(
  'JWT_CONFIG',
  (): IJwt => ({
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  }),
);
