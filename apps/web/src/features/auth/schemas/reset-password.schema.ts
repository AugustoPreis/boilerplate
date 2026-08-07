import { z } from 'zod';

import { i18next } from '@core/i18n';

// Must stay in sync with apps/api/src/modules/users/dtos/create-user.dto.ts's
// PASSWORD_REGEX: min 8 chars, at least one lower/upper/digit/special char.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;

export const resetPasswordSchema = z
  .object({
    newPassword: z.string().regex(PASSWORD_REGEX, i18next.t('validation:passwordTooWeak')),
    confirmNewPassword: z.string().min(1, i18next.t('validation:required')),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: i18next.t('validation:passwordsDoNotMatch'),
    path: ['confirmNewPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
