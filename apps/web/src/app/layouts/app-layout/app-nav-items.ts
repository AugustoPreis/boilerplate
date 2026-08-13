import { LayoutDashboard, Users, type LucideIcon } from 'lucide-react';

import { ROUTES } from '@shared/routes';

export interface IAppNavItem {
  labelKey: string;
  to: string;
  icon: LucideIcon;
  group: string;
  permission?: string;
}

export const APP_NAV_ITEMS = [
  {
    labelKey: 'nav.dashboard',
    to: ROUTES.home,
    icon: LayoutDashboard,
    group: 'nav.groups.general',
  },
  {
    labelKey: 'nav.users',
    to: ROUTES.users.index,
    icon: Users,
    group: 'nav.groups.administration',
    permission: 'users:read',
  },
] as const satisfies IAppNavItem[];
