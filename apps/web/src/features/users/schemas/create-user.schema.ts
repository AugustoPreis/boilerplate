import { PASSWORD_REGEX } from '@boilerplate/shared';
import { z } from 'zod';

import { i18next } from '@core/i18n';

export const createUserSchema = z
  .object({
    email: z.email(i18next.t('validation:email')).max(255),
    name: z.string().min(1, i18next.t('validation:required')).max(255),
    password: z.string().regex(PASSWORD_REGEX, i18next.t('validation:passwordTooWeak')),
    confirmPassword: z.string().min(1, i18next.t('validation:required')),
    roleUuid: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: i18next.t('validation:passwordsDoNotMatch'),
    path: ['confirmPassword'],
  });

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
