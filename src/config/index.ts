import { config } from 'dotenv';
import { DEFAULT_ENVIRONMENT } from '@/helper/common.helper';

config({ path: `.env.${process.env.NODE_ENV || DEFAULT_ENVIRONMENT}` });

export const {
  NODE_ENV,
  API_PORT,
  API_VERSION,
  DATABASE_URL,
  ENABLE_LOG,
  SERVER_URL,
  MAIL_FROM,
  MAIL_TO,
  MAIL_HOST,
  MAIL_PASSWORD,
  MAIL_PORT,
  FRONT_URL,
  TAP_AUTHORIZATION,
  ADMIN_EMAIL,
  TAP_URL,
  ADMIN_NOTIFICATION_UUID,
  GOOGLE_RECAPTCHA_API_KEY
} = process.env;
