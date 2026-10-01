import type {
  CreateRoleDTO,
  RoleResponseDTO,
  RolesControllerFindAllV1200,
  RolesControllerFindAllV1Params,
  UpdateRolePermissionsDTO,
} from '@core/api/generated/boilerplateAPI.schemas';
import { getRoles } from '@core/api/generated/roles/roles';

const roles = getRoles();

// The API generates `UpdateRoleDTO` as `{ [key: string]: unknown }` because
// Orval can't resolve NestJS's `PartialType(CreateRoleDTO)`. This is the
// real shape it accepts: everything from CreateRoleDTO, all optional.
export type UpdateRolePayload = Partial<CreateRoleDTO>;

export function listRoles(
  params?: RolesControllerFindAllV1Params,
): Promise<RolesControllerFindAllV1200> {
  return roles.rolesControllerFindAllV1(params);
}

export function findRole(uuid: string): Promise<RoleResponseDTO> {
  return roles.rolesControllerFindOneV1(uuid);
}

export function createRole(dto: CreateRoleDTO): Promise<RoleResponseDTO> {
  return roles.rolesControllerCreateV1(dto);
}

export function updateRole(uuid: string, dto: UpdateRolePayload): Promise<RoleResponseDTO> {
  return roles.rolesControllerUpdateV1(uuid, dto);
}

export function deleteRole(uuid: string): Promise<void> {
  return roles.rolesControllerRemoveV1(uuid);
}

export function updateRolePermissions(
  uuid: string,
  dto: UpdateRolePermissionsDTO,
): Promise<RoleResponseDTO> {
  return roles.rolesControllerUpdatePermissionsV1(uuid, dto);
}

export function cloneRole(uuid: string, dto: CreateRoleDTO): Promise<RoleResponseDTO> {
  return roles.rolesControllerCloneV1(uuid, dto);
}
