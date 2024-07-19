import { IJwt } from '@common/models';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'JWT_CONFIG',
  (): IJwt => ({
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  }),
);
