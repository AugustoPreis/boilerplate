import { useNavigate } from '@tanstack/react-router';

import { useLogoutMutation } from '../queries/auth.queries';

export interface IUseLogout {
  logout: () => void;
  isPending: boolean;
}

export function useLogout(): IUseLogout {
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();

  function logout(): void {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        void navigate({ to: '/login' });
      },
    });
  }

  return { logout, isPending: logoutMutation.isPending };
}
