import { Moon, Sun } from 'lucide-react';
import type { ReactElement } from 'react';

import { useThemeMode } from './theme-mode.context';

export function ThemeToggle(): ReactElement {
  const { resolvedMode, setMode } = useThemeMode();

  return (
    <button
      type="button"
      onClick={() => setMode(resolvedMode === 'dark' ? 'light' : 'dark')}
      className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
    >
      {resolvedMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      {resolvedMode === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  );
}
