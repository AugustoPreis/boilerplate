import { History, LayoutDashboard, ShieldCheck, Users, type LucideIcon } from 'lucide-react';

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
  {
    labelKey: 'nav.roles',
    to: ROUTES.roles.index,
    icon: ShieldCheck,
    group: 'nav.groups.administration',
    permission: 'roles:read',
  },
  {
    labelKey: 'nav.auditLogs',
    to: ROUTES.auditLogs.index,
    icon: History,
    group: 'nav.groups.administration',
    permission: 'audit:read',
  },
] as const satisfies IAppNavItem[];
