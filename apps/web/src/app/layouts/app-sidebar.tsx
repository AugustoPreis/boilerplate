import { Link } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { useSidebarStore } from '@app/providers/sidebar.store';

import { ROUTES } from '@shared/routes';
import { Box, Stack } from '@shared/ui/layout';
import { cn } from '@shared/utils/cn';

import { AppBrand } from './app-brand';
import { AppNav } from './app-nav';
import { getSidebarItemClasses } from './sidebar-item-classes';

export function AppSidebar(): ReactElement {
  const { t } = useTranslation();
  const collapsed = useSidebarStore((state) => state.collapsed);
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed);

  return (
    <Box
      as="aside"
      className={cn(
        'hidden shrink-0 flex-col border-r border-border bg-background lg:flex',
        collapsed ? 'w-20' : 'w-64',
      )}
    >
      <Box className="border-b border-border p-4">
        <AppBrand collapsed={collapsed} />
      </Box>

      <Box className="flex-1 overflow-y-auto p-4">
        <AppNav collapsed={collapsed} />
      </Box>

      <Stack gap={1} className="border-t border-border p-4">
        <Link to={ROUTES.settings} className={getSidebarItemClasses(collapsed)}>
          <Settings size={18} aria-hidden="true" />
          {!collapsed && t('sidebar.settings')}
        </Link>
        <button
          type="button"
          onClick={toggleCollapsed}
          className={getSidebarItemClasses(collapsed, 'w-full')}
        >
          {collapsed ? (
            <ChevronRight size={18} aria-hidden="true" />
          ) : (
            <ChevronLeft size={18} aria-hidden="true" />
          )}
          {collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
        </button>
      </Stack>
    </Box>
  );
}
