import { LayoutDashboard, type LucideIcon } from 'lucide-react';

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
    to: '/',
    icon: LayoutDashboard,
    group: 'nav.groups.general',
  },
] as const satisfies IAppNavItem[];
