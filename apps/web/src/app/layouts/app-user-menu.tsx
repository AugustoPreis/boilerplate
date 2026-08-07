import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@core/auth/auth.store';
import { Avatar, AvatarFallback } from '@shared/ui/avatar';
import { Button } from '@shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu';
import { Stack } from '@shared/ui/layout';
import { Text } from '@shared/ui/typography';

import { useLogout } from '@features/auth';

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function AppUserMenu(): ReactElement | null {
  const { t } = useTranslation('auth');
  const user = useAuthStore((state) => state.user);
  const { logout, isPending } = useLogout();

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={t('userMenu.trigger', { ns: 'common' })}
        >
          <Avatar>
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <Stack gap={0}>
            <Text size="sm" weight="medium">
              {user.name}
            </Text>
            <Text size="sm" tone="muted">
              {user.email}
            </Text>
          </Stack>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={logout} disabled={isPending}>
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
