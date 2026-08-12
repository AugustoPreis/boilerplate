import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import type {
  UpdateUserPasswordDTO,
  UserResponseDTO,
} from '@core/api/generated/boilerplateAPI.schemas';
import { useAuthStore } from '@core/auth/auth.store';
import type { ApiError } from '@core/errors/error.types';

import * as accountService from '../services/account.service';

export function useUpdatePasswordMutation(): UseMutationResult<
  void,
  ApiError,
  UpdateUserPasswordDTO
> {
  return useMutation({ mutationFn: accountService.updatePassword });
}

export function useUploadAvatarMutation(): UseMutationResult<UserResponseDTO, ApiError, File> {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: accountService.uploadAvatar,
    onSuccess: (data) => {
      if (user) {
        setUser({ ...user, name: data.name, email: data.email, avatarUrl: data.avatarUrl ?? null });
      }
    },
  });
}
