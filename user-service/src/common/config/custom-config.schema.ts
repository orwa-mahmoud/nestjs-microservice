import * as Joi from 'joi';
import { EnvKey } from './custom-config.enum';

export const CustomConfigSchema = Joi.object({
  [EnvKey.NODE_ENV]: Joi.string().required(),
  [EnvKey.NODE_PORT]: Joi.number().required(),

  [EnvKey.DATABASE_HOST]: Joi.string().required(),
  [EnvKey.DATABASE_PORT]: Joi.number().required(),
  [EnvKey.DATABASE_USER]: Joi.string().required(),
  [EnvKey.DATABASE_PASSWORD]: Joi.string().required(),
  [EnvKey.DATABASE_NAME]: Joi.string().required(),

  [EnvKey.RABBIT_MQ_URI]: Joi.string().required(),
  [EnvKey.RABBIT_MQ_TIMEOUT]: Joi.number().required(),

  [EnvKey.AUTH_COOKIE_NAME]: Joi.string().required(),
  [EnvKey.AUTH_COOKIE_DOMAIN]: Joi.string().required(),

  [EnvKey.JWT_SECRET]: Joi.string().required(),
  [EnvKey.JWT_TOKEN_LIFETIME_REMEMBER_ME]: Joi.number().required(),
  [EnvKey.JWT_TOKEN_LIFETIME_NORMAL]: Joi.number().required(),

  [EnvKey.LANDING_URL]: Joi.string().required(),
  [EnvKey.RESEND_EMAIL_WAIT_MINUTES]: Joi.number().required(),

  [EnvKey.ALLOWED_ORIGINS]: Joi.string().required(),
});
