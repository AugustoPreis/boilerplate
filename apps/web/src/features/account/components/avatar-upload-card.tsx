import type { ReactElement } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useAuthStore } from '@core/auth/auth.store';
import { mapAxiosErrorToAppError } from '@core/errors/error.mapper';
import { AvatarUpload } from '@shared/ui/avatar-upload';
import { Stack } from '@shared/ui/layout';
import { Text } from '@shared/ui/typography';

import { useUploadAvatarMutation } from '../queries/account.queries';

export function AvatarUploadCard(): ReactElement | null {
  const { t } = useTranslation('account');
  const user = useAuthStore((state) => state.user);
  const uploadAvatarMutation = useUploadAvatarMutation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleFileSelected(file: File): void {
    setPreviewUrl(URL.createObjectURL(file));

    uploadAvatarMutation.mutate(file, {
      onSuccess: () => toast.success(t('avatar.success')),
      onError: (error) => {
        toast.error(mapAxiosErrorToAppError(error).message);
        setPreviewUrl(null);
      },
    });
  }

  if (!user) {
    return null;
  }

  return (
    <Stack gap={4} align="center" className="rounded-lg border border-border p-4 text-center">
      <AvatarUpload
        imageUrl={previewUrl ?? user.avatarUrl}
        name={user.name}
        selectLabel={t('avatar.selectLabel')}
        uploadingLabel={t('avatar.uploading')}
        isUploading={uploadAvatarMutation.isPending}
        onFileSelected={handleFileSelected}
      />

      <Stack gap={1}>
        <Text weight="medium">{user.name}</Text>
        <Text size="sm" tone="muted">
          {user.email}
        </Text>
      </Stack>
    </Stack>
  );
}
