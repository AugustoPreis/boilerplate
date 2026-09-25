import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { RoleResponseDTO } from '@core/api/generated/boilerplateAPI.schemas';
import type { ApiError } from '@core/errors/error.types';
import { Stack } from '@shared/ui/layout';
import { LoadingState } from '@shared/ui/loading-state';
import { NotFoundState } from '@shared/ui/not-found-state';

import { RoleForm } from './role-form';
import { RolePermissionsMatrix } from './role-permissions-matrix';

export interface RoleFormStateProps {
  roleQuery: UseQueryResult<RoleResponseDTO, ApiError>;
  readOnly: boolean;
  onSuccess: (role: RoleResponseDTO) => void;
  onCancel: () => void;
}

export function RoleFormState({
  roleQuery,
  readOnly,
  onSuccess,
  onCancel,
}: RoleFormStateProps): ReactElement {
  const { t } = useTranslation('roles');

  if (roleQuery.isLoading) {
    return <LoadingState message={t('edit.loading')} />;
  }

  if (roleQuery.isError || !roleQuery.data) {
    return <NotFoundState message={t('edit.notFound')} />;
  }

  return (
    <Stack gap={8}>
      <RoleForm
        role={roleQuery.data}
        readOnly={readOnly}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
      <RolePermissionsMatrix role={roleQuery.data} readOnly={readOnly} />
    </Stack>
  );
}
