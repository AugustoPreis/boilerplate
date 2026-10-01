import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { RoleResponseDTO } from '@core/api/generated/boilerplateAPI.schemas';
import { ConfirmDialog } from '@shared/ui/confirm-dialog';

export interface DeleteRoleDialogProps {
  role: RoleResponseDTO | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isConfirming: boolean;
}

export function DeleteRoleDialog({
  role,
  onOpenChange,
  onConfirm,
  isConfirming,
}: DeleteRoleDialogProps): ReactElement {
  const { t } = useTranslation('roles');

  return (
    <ConfirmDialog
      open={Boolean(role)}
      onOpenChange={onOpenChange}
      title={t('deleteDialog.title')}
      description={role ? t('deleteDialog.description', { name: role.name }) : null}
      confirmLabel={t('deleteDialog.confirm')}
      cancelLabel={t('deleteDialog.cancel')}
      onConfirm={onConfirm}
      isConfirming={isConfirming}
      variant="destructive"
    />
  );
}
