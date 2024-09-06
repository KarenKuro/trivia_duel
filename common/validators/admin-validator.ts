/* eslint-disable import/namespace */
import * as Joi from 'joi';

export const ADMIN_VALIDATIONS = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development'),
  PORT: Joi.number().default(3007),
  MEDIA_HOST: Joi.string().default('localhost:3007'),
  ENVIRONMENT: Joi.string()
    .valid('development', 'staging', 'production')
    .default('development'),
  APP_VERSION: Joi.string().required(),
  APP_NAME: Joi.string().required(),
  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().default(3306),
  DATABASE_USER: Joi.string().default('root'),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DB_SYNC: Joi.boolean().default(false),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().required(),
});
