import type {
  PermissionsControllerFindAllV1200,
  PermissionsControllerFindAllV1Params,
} from '@core/api/generated/boilerplateAPI.schemas';
import { getPermissions } from '@core/api/generated/permissions/permissions';

const permissions = getPermissions();

// Read-only on purpose — permissions are managed as fixed seed data by the
// API, this feature only lists them to feed the role permissions matrix.
export function listPermissions(
  params?: PermissionsControllerFindAllV1Params,
): Promise<PermissionsControllerFindAllV1200> {
  return permissions.permissionsControllerFindAllV1(params);
}
