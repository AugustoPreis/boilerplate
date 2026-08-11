import { Link } from '@tanstack/react-router';
import { LogOut, Settings2, User } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@core/auth/auth.store';
import { ROUTES } from '@shared/routes';
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
import { getInitials } from '@shared/utils/get-initials';

import { useLogout } from '@features/auth';

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
        <DropdownMenuItem asChild>
          <Link to={ROUTES.account}>
            <User size={16} aria-hidden="true" />
            {t('userMenu.myProfile', { ns: 'common' })}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={ROUTES.preferences}>
            <Settings2 size={16} aria-hidden="true" />
            {t('userMenu.preferences', { ns: 'common' })}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={logout}
          disabled={isPending}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut size={16} aria-hidden="true" />
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
