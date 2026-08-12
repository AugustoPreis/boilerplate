import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import type {
  AssignRolesDTO,
  CreateUserDTO,
  RolesControllerFindAllV1200,
  UpdateUserStatusDTO,
  UserResponseDTO,
  UsersControllerFindAllV1200,
  UsersControllerFindAllV1Params,
} from '@core/api/generated/boilerplateAPI.schemas';
import type { ApiError } from '@core/errors/error.types';

import * as rolesLookupService from '../services/roles-lookup.service';
import * as usersService from '../services/users.service';
import type { UpdateUserPayload } from '../services/users.service';

export const usersQueryKeys = {
  all: ['users'] as const,
  list: (params: UsersControllerFindAllV1Params) =>
    [...usersQueryKeys.all, 'list', params] as const,
  detail: (uuid: string) => [...usersQueryKeys.all, 'detail', uuid] as const,
};

export const roleOptionsQueryKeys = {
  all: ['role-options'] as const,
};

export interface IUpdateUserVariables {
  uuid: string;
  dto: UpdateUserPayload;
}

export interface IUpdateUserStatusVariables {
  uuid: string;
  dto: UpdateUserStatusDTO;
}

export interface IAssignRolesVariables {
  uuid: string;
  dto: AssignRolesDTO;
}

export function useUsersQuery(
  params: UsersControllerFindAllV1Params,
): UseQueryResult<UsersControllerFindAllV1200, ApiError> {
  return useQuery({
    queryKey: usersQueryKeys.list(params),
    queryFn: () => usersService.listUsers(params),
    placeholderData: keepPreviousData,
  });
}

export function useUserQuery(uuid: string): UseQueryResult<UserResponseDTO, ApiError> {
  return useQuery({
    queryKey: usersQueryKeys.detail(uuid),
    queryFn: () => usersService.findUser(uuid),
  });
}

export function useRolesOptionsQuery(
  search?: string,
): UseQueryResult<RolesControllerFindAllV1200, ApiError> {
  return useQuery({
    queryKey: [...roleOptionsQueryKeys.all, search],
    queryFn: () => rolesLookupService.listRoleOptions(search),
    placeholderData: keepPreviousData,
  });
}

export function useCreateUserMutation(): UseMutationResult<
  UserResponseDTO,
  ApiError,
  CreateUserDTO
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.createUser,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
  });
}

export function useUpdateUserMutation(): UseMutationResult<
  UserResponseDTO,
  ApiError,
  IUpdateUserVariables
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, dto }: IUpdateUserVariables) => usersService.updateUser(uuid, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
  });
}

export function useUpdateUserStatusMutation(): UseMutationResult<
  UserResponseDTO,
  ApiError,
  IUpdateUserStatusVariables
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, dto }: IUpdateUserStatusVariables) =>
      usersService.updateUserStatus(uuid, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
  });
}

export function useDeleteUserMutation(): UseMutationResult<void, ApiError, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => usersService.deleteUser(uuid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
  });
}

export function useAssignRolesMutation(): UseMutationResult<
  UserResponseDTO,
  ApiError,
  IAssignRolesVariables
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, dto }: IAssignRolesVariables) => usersService.assignRoles(uuid, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usersQueryKeys.all });
    },
  });
}
