import { z } from 'zod';

import { i18next } from '@core/i18n';

export const createRoleSchema = z.object({
  name: z.string().min(2, i18next.t('validation:required')).max(100),
  description: z.string().optional(),
});

export type CreateRoleFormValues = z.infer<typeof createRoleSchema>;
