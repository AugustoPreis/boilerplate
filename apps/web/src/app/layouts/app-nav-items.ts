import { LayoutDashboard, type LucideIcon } from 'lucide-react';

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
] as const satisfies IAppNavItem[];
