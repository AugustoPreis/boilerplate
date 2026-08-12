import { PASSWORD_REGEX } from '@boilerplate/shared';
import { z } from 'zod';

import { i18next } from '@core/i18n';

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, i18next.t('validation:required')),
    newPassword: z.string().regex(PASSWORD_REGEX, i18next.t('validation:passwordTooWeak')),
    confirmNewPassword: z.string().min(1, i18next.t('validation:required')),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: i18next.t('validation:passwordsDoNotMatch'),
    path: ['confirmNewPassword'],
  });

export type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;
