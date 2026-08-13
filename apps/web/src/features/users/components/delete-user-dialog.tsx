import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { UserResponseDTO } from '@core/api/generated/boilerplateAPI.schemas';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';

export interface DeleteUserDialogProps {
  user: UserResponseDTO | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isConfirming: boolean;
}

export function DeleteUserDialog({
  user,
  onOpenChange,
  onConfirm,
  isConfirming,
}: DeleteUserDialogProps): ReactElement {
  const { t } = useTranslation('users');

  return (
    <ConfirmDialog
      open={Boolean(user)}
      onOpenChange={onOpenChange}
      title={t('deleteDialog.title')}
      description={user ? t('deleteDialog.description', { name: user.name }) : null}
      confirmLabel={t('deleteDialog.confirm')}
      cancelLabel={t('deleteDialog.cancel')}
      onConfirm={onConfirm}
      isConfirming={isConfirming}
      variant="destructive"
    />
  );
}
