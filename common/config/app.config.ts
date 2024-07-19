import { IApp } from '@common/models';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'APP_CONFIG',
  (): IApp => ({
    NODE_ENV: process.env.NODE_ENV,
    ENVIROMENT: process.env.ENVIROMENT,
  }),
);
