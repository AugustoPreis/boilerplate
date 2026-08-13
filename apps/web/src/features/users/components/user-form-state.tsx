import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { UserResponseDTO } from '@core/api/generated/boilerplateAPI.schemas';
import type { ApiError } from '@core/errors/error.types';
import { LoadingState } from '@shared/ui/loading-state';
import { NotFoundState } from '@shared/ui/not-found-state';

import { UserForm } from './user-form';

export interface UserFormStateProps {
  userQuery: UseQueryResult<UserResponseDTO, ApiError>;
  readOnly: boolean;
  onSuccess: (user: UserResponseDTO) => void;
  onCancel: () => void;
}

export function UserFormState({
  userQuery,
  readOnly,
  onSuccess,
  onCancel,
}: UserFormStateProps): ReactElement {
  const { t } = useTranslation('users');

  if (userQuery.isLoading) {
    return <LoadingState message={t('edit.loading')} />;
  }

  if (userQuery.isError || !userQuery.data) {
    return <NotFoundState message={t('edit.notFound')} />;
  }

  return (
    <UserForm user={userQuery.data} readOnly={readOnly} onSuccess={onSuccess} onCancel={onCancel} />
  );
}
