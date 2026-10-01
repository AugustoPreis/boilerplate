import type { ComponentPropsWithoutRef, ReactElement } from 'react';

import { cn } from '@shared/utils/cn';

export type TextareaProps = ComponentPropsWithoutRef<'textarea'>;

export function Textarea({ className, rows = 4, ...props }: TextareaProps): ReactElement {
  return (
    <textarea
      rows={rows}
      className={cn(
        'flex w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
