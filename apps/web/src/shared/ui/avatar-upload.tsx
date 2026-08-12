import type { ChangeEvent, ReactElement } from 'react';
import { useRef } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@shared/ui/avatar';
import { Button } from '@shared/ui/button';
import { Stack } from '@shared/ui/layout';
import { getInitials } from '@shared/utils/get-initials';

export interface AvatarUploadProps {
  imageUrl?: string | null;
  name: string;
  selectLabel: string;
  uploadingLabel: string;
  isUploading?: boolean;
  disabled?: boolean;
  onFileSelected: (file: File) => void;
}

export function AvatarUpload({
  imageUrl,
  name,
  selectLabel,
  uploadingLabel,
  isUploading = false,
  disabled = false,
  onFileSelected,
}: AvatarUploadProps): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];

    if (file) {
      onFileSelected(file);
    }

    event.target.value = '';
  }

  return (
    <Stack gap={3} align="center">
      <Avatar className="size-20">
        <AvatarImage src={imageUrl ?? undefined} alt={name} />
        <AvatarFallback className="text-lg">{getInitials(name)}</AvatarFallback>
      </Avatar>

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
        disabled={disabled || isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? uploadingLabel : selectLabel}
      </Button>
    </Stack>
  );
}
