import { registerAs } from '@nestjs/config';

import { IRedisConfig } from '@common/models';

export default registerAs('REDIS_CONFIG', (): IRedisConfig => {
  return {
    url: process.env.REDIS_URL,
  };
});
