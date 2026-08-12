import type { ChangeEvent, ReactElement } from 'react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { useAuthStore } from '@core/auth/auth.store';
import { mapAxiosErrorToAppError } from '@core/errors/error.mapper';
import { Avatar, AvatarFallback, AvatarImage } from '@shared/ui/avatar';
import { Button } from '@shared/ui/button';
import { Stack } from '@shared/ui/layout';
import { Text } from '@shared/ui/typography';
import { getInitials } from '@shared/utils/get-initials';

import { useUploadAvatarMutation } from '../queries/account.queries';

export function AvatarUploadCard(): ReactElement | null {
  const { t } = useTranslation('account');
  const user = useAuthStore((state) => state.user);
  const uploadAvatarMutation = useUploadAvatarMutation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));

    uploadAvatarMutation.mutate(file, {
      onSuccess: () => toast.success(t('avatar.success')),
      onError: (error) => {
        toast.error(mapAxiosErrorToAppError(error).message);
        setPreviewUrl(null);
      },
    });

    event.target.value = '';
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

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="sr-only"
      />
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={uploadAvatarMutation.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {uploadAvatarMutation.isPending ? t('avatar.uploading') : t('avatar.selectLabel')}
      </Button>
    </Stack>
  );
}
