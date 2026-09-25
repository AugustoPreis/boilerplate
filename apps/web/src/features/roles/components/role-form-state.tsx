import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { RoleResponseDTO } from '@core/api/generated/boilerplateAPI.schemas';
import type { ApiError } from '@core/errors/error.types';
import { LoadingState } from '@shared/ui/loading-state';
import { NotFoundState } from '@shared/ui/not-found-state';

import { RoleEditor } from './role-editor';

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
    <RoleEditor role={roleQuery.data} readOnly={readOnly} onSaved={onSuccess} onCancel={onCancel} />
  );
}
