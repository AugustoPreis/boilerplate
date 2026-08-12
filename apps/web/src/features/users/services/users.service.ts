import type {
  AssignRolesDTO,
  CreateUserDTO,
  UpdateUserStatusDTO,
  UserResponseDTO,
  UsersControllerFindAllV1200,
  UsersControllerFindAllV1Params,
} from '@core/api/generated/boilerplateAPI.schemas';
import { getUsers } from '@core/api/generated/users/users';

const users = getUsers();

// The API generates `UpdateUserDTO` as `{ [key: string]: unknown }` because
// Orval can't resolve NestJS's `PartialType(OmitType(CreateUserDTO, [...]))`.
// This is the real shape it accepts: everything from CreateUserDTO except
// the password, all optional.
export type UpdateUserPayload = Partial<Omit<CreateUserDTO, 'password'>>;

export function listUsers(
  params?: UsersControllerFindAllV1Params,
): Promise<UsersControllerFindAllV1200> {
  return users.usersControllerFindAllV1(params);
}

export function findUser(uuid: string): Promise<UserResponseDTO> {
  return users.usersControllerFindOneV1(uuid);
}

export function createUser(dto: CreateUserDTO): Promise<UserResponseDTO> {
  return users.usersControllerCreateV1(dto);
}

export function updateUser(uuid: string, dto: UpdateUserPayload): Promise<UserResponseDTO> {
  return users.usersControllerUpdateV1(uuid, dto);
}

export function updateUserStatus(uuid: string, dto: UpdateUserStatusDTO): Promise<UserResponseDTO> {
  return users.usersControllerUpdateStatusV1(uuid, dto);
}

export function deleteUser(uuid: string): Promise<void> {
  return users.usersControllerRemoveV1(uuid);
}

export function assignRoles(uuid: string, dto: AssignRolesDTO): Promise<UserResponseDTO> {
  return users.usersControllerAssignRolesV1(uuid, dto);
}
