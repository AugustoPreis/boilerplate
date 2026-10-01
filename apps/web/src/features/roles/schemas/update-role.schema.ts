import { createRoleSchema } from './create-role.schema';

export const updateRoleSchema = createRoleSchema;

export type UpdateRoleFormValues = ReturnType<typeof updateRoleSchema.parse>;
