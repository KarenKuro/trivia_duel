import { AUTH_ERROR_MESSAGES } from './auth';
import { CATEGORY_ERROR_MESSAGES } from './category';
import { PAYMENT_ERROR_MESSAGES } from './payment';
import { QUESTION_ERROR_MESSAGES } from './question';

export const ERROR_MESSAGES = {
  ...AUTH_ERROR_MESSAGES,
  ...CATEGORY_ERROR_MESSAGES,
  ...QUESTION_ERROR_MESSAGES,
  ...PAYMENT_ERROR_MESSAGES,
};
