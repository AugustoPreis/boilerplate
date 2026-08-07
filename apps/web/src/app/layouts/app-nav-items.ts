import { LayoutDashboard, type LucideIcon } from 'lucide-react';

export interface IAppNavItem {
  labelKey: string;
  to: string;
  icon: LucideIcon;
  permission?: string;
}

export const APP_NAV_ITEMS = [
  {
    labelKey: 'nav.dashboard',
    to: '/',
    icon: LayoutDashboard,
  },
] as const satisfies IAppNavItem[];
