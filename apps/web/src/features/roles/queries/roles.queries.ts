import { MAX_PAGE_SIZE } from '@boilerplate/shared';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import type {
  CreateRoleDTO,
  PermissionsControllerFindAllV1200,
  RoleResponseDTO,
  RolesControllerFindAllV1200,
  RolesControllerFindAllV1Params,
  UpdateRolePermissionsDTO,
} from '@core/api/generated/boilerplateAPI.schemas';
import type { ApiError } from '@core/errors/error.types';

import * as permissionsService from '../services/permissions.service';
import * as rolesService from '../services/roles.service';
import type { UpdateRolePayload } from '../services/roles.service';

export const rolesQueryKeys = {
  all: ['roles'] as const,
  list: (params: RolesControllerFindAllV1Params) =>
    [...rolesQueryKeys.all, 'list', params] as const,
  detail: (uuid: string) => [...rolesQueryKeys.all, 'detail', uuid] as const,
  options: (search?: string) => [...rolesQueryKeys.all, 'options', search] as const,
};

export const permissionsQueryKeys = {
  all: ['permissions'] as const,
};

export interface IUpdateRoleVariables {
  uuid: string;
  dto: UpdateRolePayload;
}

export interface IUpdateRolePermissionsVariables {
  uuid: string;
  dto: UpdateRolePermissionsDTO;
}

export interface ICloneRoleVariables {
  uuid: string;
  dto: CreateRoleDTO;
}

export function useRolesQuery(
  params: RolesControllerFindAllV1Params,
): UseQueryResult<RolesControllerFindAllV1200, ApiError> {
  return useQuery({
    queryKey: rolesQueryKeys.list(params),
    queryFn: () => rolesService.listRoles(params),
    placeholderData: keepPreviousData,
  });
}

// Feeds role pickers (e.g. the users form's role select) — fetches one
// large page filtered by `search` instead of paginating through the picker
// itself.
export function useRoleOptionsQuery(
  search?: string,
): UseQueryResult<RolesControllerFindAllV1200, ApiError> {
  return useQuery({
    queryKey: rolesQueryKeys.options(search),
    queryFn: () => rolesService.listRoles({ perPage: MAX_PAGE_SIZE, search }),
    placeholderData: keepPreviousData,
  });
}

export function useRoleQuery(uuid: string): UseQueryResult<RoleResponseDTO, ApiError> {
  return useQuery({
    queryKey: rolesQueryKeys.detail(uuid),
    queryFn: () => rolesService.findRole(uuid),
  });
}

// Feeds the role permissions matrix — there's no pagination in that UI, so
// this fetches every permission in one page.
export function usePermissionsQuery(): UseQueryResult<PermissionsControllerFindAllV1200, ApiError> {
  return useQuery({
    queryKey: permissionsQueryKeys.all,
    queryFn: () => permissionsService.listPermissions({ perPage: MAX_PAGE_SIZE }),
  });
}

export function useCreateRoleMutation(): UseMutationResult<
  RoleResponseDTO,
  ApiError,
  CreateRoleDTO
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rolesService.createRole,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
    },
  });
}

export function useUpdateRoleMutation(): UseMutationResult<
  RoleResponseDTO,
  ApiError,
  IUpdateRoleVariables
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, dto }: IUpdateRoleVariables) => rolesService.updateRole(uuid, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
    },
  });
}

export function useDeleteRoleMutation(): UseMutationResult<void, ApiError, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => rolesService.deleteRole(uuid),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
    },
  });
}

export function useUpdateRolePermissionsMutation(): UseMutationResult<
  RoleResponseDTO,
  ApiError,
  IUpdateRolePermissionsVariables
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, dto }: IUpdateRolePermissionsVariables) =>
      rolesService.updateRolePermissions(uuid, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
    },
  });
}

export function useCloneRoleMutation(): UseMutationResult<
  RoleResponseDTO,
  ApiError,
  ICloneRoleVariables
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, dto }: ICloneRoleVariables) => rolesService.cloneRole(uuid, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: rolesQueryKeys.all });
    },
  });
}
