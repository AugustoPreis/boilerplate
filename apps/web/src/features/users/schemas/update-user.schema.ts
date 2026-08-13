import { z } from 'zod';

import { i18next } from '@core/i18n';

export const updateUserSchema = z.object({
  email: z.email(i18next.t('validation:email')).max(255),
  name: z.string().min(1, i18next.t('validation:required')).max(255),
  roleUuid: z.string().optional(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
