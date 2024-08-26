import { registerAs } from '@nestjs/config';

import { IApp } from '@common/models';

export default registerAs(
  'APP_CONFIG',
  (): IApp => ({
    NODE_ENV: process.env.NODE_ENV,
    ENVIROMENT: process.env.ENVIROMENT,
  }),
);
