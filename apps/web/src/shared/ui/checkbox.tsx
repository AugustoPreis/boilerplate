import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactElement } from 'react';

import { cn } from '@shared/utils/cn';

export type CheckboxProps = ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>;

export function Checkbox({ className, ...props }: CheckboxProps): ReactElement {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'peer flex size-4 shrink-0 items-center justify-center rounded-sm border border-input shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <Check size={12} aria-hidden="true" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
