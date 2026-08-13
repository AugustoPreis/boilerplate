import { MAX_PAGE_SIZE } from '@boilerplate/shared';

import type { RolesControllerFindAllV1200 } from '@core/api/generated/boilerplateAPI.schemas';
import { getRoles } from '@core/api/generated/roles/roles';

const roles = getRoles();

// Feeds the role multi-select — there's no roles listing page yet (that's a
// later feature), so this fetches one large page filtered by `search`
// instead of paginating through the picker itself.
export function listRoleOptions(search?: string): Promise<RolesControllerFindAllV1200> {
  return roles.rolesControllerFindAllV1({ perPage: MAX_PAGE_SIZE, search });
}
