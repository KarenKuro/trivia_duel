import { IRedisConfig } from '@common/models';
import { registerAs } from '@nestjs/config';

export default registerAs('REDIS_CONFIG', (): IRedisConfig => {
  return {
    url: process.env.REDIS_URL,
  };
});
