import type {
  UpdateUserPasswordDTO,
  UserResponseDTO,
} from '@core/api/generated/boilerplateAPI.schemas';
import { getUsers } from '@core/api/generated/users/users';

const users = getUsers();

export function updatePassword(dto: UpdateUserPasswordDTO): Promise<void> {
  return users.usersControllerUpdatePasswordV1(dto);
}

export function uploadAvatar(file: File): Promise<UserResponseDTO> {
  return users.usersControllerUploadAvatarV1({ file });
}
