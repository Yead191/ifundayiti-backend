import { z } from 'zod';
import { USER_ROLES } from '../../../enums/user';

export const FaqValidations = {
  createFaq: z.object({
    body: z.object({
      question: z.string().min(1, 'Question is required'),
      answer: z.string().min(1, 'Answer is required'),
      audience: z.enum([USER_ROLES.USER, USER_ROLES.VENDOR]),
    }),
  }),

  updateFaq: z.object({
    body: z.object({
      question: z.string().min(1, 'Question is required').optional(),
      answer: z.string().min(1, 'Answer is required').optional(),
      audience: z.enum([USER_ROLES.USER, USER_ROLES.VENDOR]).optional(),
    }),
  }),
};
