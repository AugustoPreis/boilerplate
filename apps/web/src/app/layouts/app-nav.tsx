import { Link } from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { usePermissions } from '@core/auth/use-permissions.hook';
import { Stack } from '@shared/ui/layout';

import { APP_NAV_ITEMS, type IAppNavItem } from './app-nav-items';

export interface AppNavProps {
  onNavigate?: () => void;
}

function isNavItemVisible(
  item: IAppNavItem,
  hasPermission: (permission: string) => boolean,
): boolean {
  return !item.permission || hasPermission(item.permission);
}

export function AppNav({ onNavigate }: AppNavProps): ReactElement {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();

  const items = APP_NAV_ITEMS.filter((item) => isNavItemVisible(item, hasPermission));

  return (
    <Stack as="nav" gap={1}>
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            activeProps={{ className: 'bg-accent text-accent-foreground' }}
          >
            <Icon size={18} aria-hidden="true" />
            {t(item.labelKey)}
          </Link>
        );
      })}
    </Stack>
  );
}
