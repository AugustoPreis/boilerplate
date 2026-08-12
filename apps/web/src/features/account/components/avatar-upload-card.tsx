import type { ChangeEvent, ReactElement } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useAuthStore } from '@core/auth/auth.store';
import { mapAxiosErrorToAppError } from '@core/errors/error.mapper';
import { Avatar, AvatarFallback, AvatarImage } from '@shared/ui/avatar';
import { Button } from '@shared/ui/button';
import { Label } from '@shared/ui/label';
import { Stack } from '@shared/ui/layout';
import { Text } from '@shared/ui/typography';
import { getInitials } from '@shared/utils/get-initials';

import { useUploadAvatarMutation } from '../queries/account.queries';

export function AvatarUploadCard(): ReactElement | null {
  const { t } = useTranslation('account');
  const user = useAuthStore((state) => state.user);
  const uploadAvatarMutation = useUploadAvatarMutation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0] ?? null;

    setSelectedFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  function handleUpload(): void {
    if (!selectedFile) {
      return;
    }

    uploadAvatarMutation.mutate(selectedFile, {
      onSuccess: () => {
        toast.success(t('avatar.success'));
        setSelectedFile(null);
        setPreviewUrl(null);
      },
      onError: (error) => {
        toast.error(mapAxiosErrorToAppError(error).message);
      },
    });
  }

  if (!user) {
    return null;
  }

  return (
    <Stack gap={4} align="center" className="rounded-lg border border-border p-4 text-center">
      <Avatar className="size-20">
        <AvatarImage src={previewUrl ?? user.avatarUrl ?? undefined} alt={user.name} />
        <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
      </Avatar>

      <Stack gap={1}>
        <Text weight="medium">{user.name}</Text>
        <Text size="sm" tone="muted">
          {user.email}
        </Text>
      </Stack>

      <Stack gap={2} className="w-full text-left">
        <Label htmlFor="avatar-file-input">{t('avatar.selectLabel')}</Label>
        <input
          id="avatar-file-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-sm text-muted-foreground"
        />
      </Stack>

      <Button
        type="button"
        onClick={handleUpload}
        disabled={!selectedFile || uploadAvatarMutation.isPending}
        className="w-full"
      >
        {t('avatar.submit')}
      </Button>
    </Stack>
  );
}
