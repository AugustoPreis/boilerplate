import { useAuthStore } from './auth.store';
import { hasAnyPermission, hasPermission } from './permissions';

export interface IUsePermissions {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

export function usePermissions(): IUsePermissions {
  const permissions = useAuthStore((state) => state.user?.permissions ?? []);

  return {
    permissions,
    hasPermission: (permission) => hasPermission(permissions, permission),
    hasAnyPermission: (required) => hasAnyPermission(permissions, required),
  };
}
